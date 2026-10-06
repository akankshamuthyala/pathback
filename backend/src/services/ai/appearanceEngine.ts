import { z } from 'zod';
import { getAnthropicClient } from './anthropicClient';
import { env } from '../../config/env';

export const AppearanceAnalysisResultSchema = z.object({
  analysisTitle: z.literal('Age-Aware Appearance Analysis'),
  timeElapsedYears: z.number(),
  ageBaseline: z.number(),
  currentEstimatedAge: z.number(),
  stableAttributes: z.array(z.object({
    attribute: z.string(),
    description: z.string(),
    investigativeReliability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  })),
  changeableAttributes: z.array(z.object({
    attribute: z.string(),
    expectedVariations: z.string(),
    potentialConfounders: z.string(),
  })),
  probableMaturationChanges: z.array(z.string()),
  investigatorReviewConsiderations: z.array(z.string()),
  uncertaintyStatement: z.string(),
});

export type AppearanceAnalysisResult = z.infer<typeof AppearanceAnalysisResultSchema>;

export const generateAppearanceAnalysis = async (caseData: any): Promise<{ result: AppearanceAnalysisResult; isDemo: boolean; model: string }> => {
  const yearsElapsed = Math.max(0, caseData.estimatedCurrentAge - caseData.ageWhenMissing);
  const client = getAnthropicClient();

  if (client) {
    try {
      const prompt = `You are the SETHU Age-Aware Appearance Analysis Engine.
You provide responsible, scientifically grounded biological maturation modeling for missing persons.

CRITICAL RESPONSIBLE AI RULES:
- Never claim that an appearance progression is an exact prediction or guarantee.
- Clearly separate stable biological traits from easily changeable traits.
- Emphasize that visual similarity must never be treated as proof of identity.
- Explicitly emphasize investigator review.

Case Record:
- Person Name: ${caseData.personName}
- Age When Missing: ${caseData.ageWhenMissing}
- Estimated Current Age: ${caseData.estimatedCurrentAge}
- Time Elapsed: ${yearsElapsed} years
- Recorded Physical Description: ${caseData.physicalDescription}
- Gender: ${caseData.gender || 'Not specified'}

Respond ONLY with valid JSON matching this schema:
{
  "analysisTitle": "Age-Aware Appearance Analysis",
  "timeElapsedYears": ${yearsElapsed},
  "ageBaseline": ${caseData.ageWhenMissing},
  "currentEstimatedAge": ${caseData.estimatedCurrentAge},
  "stableAttributes": [
    { "attribute": "Eye spacing / orbital structure", "description": "Details", "investigativeReliability": "HIGH" }
  ],
  "changeableAttributes": [
    { "attribute": "Hair style / length", "expectedVariations": "Details", "potentialConfounders": "Details" }
  ],
  "probableMaturationChanges": ["Biological growth observation 1", "Observation 2"],
  "investigatorReviewConsiderations": ["Guidance 1", "Guidance 2"],
  "uncertaintyStatement": "Age-Aware Appearance Analysis represents probabilistic biological modeling. It must never be treated as conclusive proof of identity."
}`;

      const response = await client.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && textBlock.text) {
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = AppearanceAnalysisResultSchema.parse(parsed);
          return {
            result: validated,
            isDemo: false,
            model: env.CLAUDE_MODEL,
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic API call failed for appearance analysis. Using deterministic biological model:', err);
    }
  }

  // Deterministic biological maturation model
  const isMinor = caseData.ageWhenMissing < 18;
  const isElderly = caseData.ageWhenMissing >= 60;

  const demoResult: AppearanceAnalysisResult = {
    analysisTitle: 'Age-Aware Appearance Analysis',
    timeElapsedYears: yearsElapsed,
    ageBaseline: caseData.ageWhenMissing,
    currentEstimatedAge: caseData.estimatedCurrentAge,
    stableAttributes: [
      {
        attribute: 'Inter-pupillary distance & orbital frame',
        description: 'Fixed cranial metric; remains relatively invariant post-adolescence.',
        investigativeReliability: 'HIGH',
      },
      {
        attribute: 'Nasal bridge cartilage architecture',
        description: 'Underlying structural bone profile provides moderate longitudinal persistence.',
        investigativeReliability: 'MEDIUM',
      },
      {
        attribute: 'Ear lobe attachment & antihelix morphology',
        description: 'Highly individual morphological landmark unaffected by weight fluctuations.',
        investigativeReliability: 'HIGH',
      },
    ],
    changeableAttributes: [
      {
        attribute: 'Hair length, texture, and coloration',
        expectedVariations: yearsElapsed > 1 ? 'Frequent styling alterations, dye treatments, or natural lightening/darkening.' : 'Minor potential styling variances.',
        potentialConfounders: 'Headwear, grooming habits, weather exposure.',
      },
      {
        attribute: 'Facial soft-tissue & adiposity',
        expectedVariations: 'Weight variations of ±5-10 kg noticeably alter mandibular contour.',
        potentialConfounders: 'Nutritional status, health conditions, hydration.',
      },
      {
        attribute: 'Facial hair & brow grooming',
        expectedVariations: isMinor && yearsElapsed >= 2 ? 'Substantial secondary development of mustache/beard growth.' : 'Grooming style variations.',
        potentialConfounders: 'Shaving habits, deliberate disguise, natural maturation.',
      },
    ],
    probableMaturationChanges: isMinor
      ? [
          `Maturation over ${yearsElapsed} year(s) typically produces mandibular elongation and jawline squaring.`,
          'Height progression is expected to have increased by 2-5 cm depending on pubertal stage.',
          'Nasal cartilage elongation and deepening of nasolabial folds.',
        ]
      : isElderly
      ? [
          'Gradual loss of skin elasticity with deepening of periorbital and glabellar lines.',
          'Slight reduction in spinal disk height; possible altered posture.',
          'Hair thinning and pigmentation reduction (graying/whitening).',
        ]
      : [
          `Subtle soft-tissue settling over ${yearsElapsed} year(s); emergence of early facial micro-lines.`,
          'Possible hairline recession or subtle density shifts.',
        ],
    investigatorReviewConsiderations: [
      'Focus visual comparisons primarily on high-reliability stable cranial landmarks (ear morphology, eye proportions).',
      'Discount discrepancies solely attributable to hair styling, grooming, or clothing color.',
      'Request historical family photographs spanning multiple angles to triangulate stable features.',
    ],
    uncertaintyStatement:
      'Age-Aware Appearance Analysis represents probabilistic biological modeling and hypothetical maturation projections. An age-progressed visual representation or profile must NEVER be treated as conclusive proof of identity. Human verification and corroborating documentation are mandatory.',
  };

  return {
    result: demoResult,
    isDemo: true,
    model: 'sethu-deterministic-appearance-v1',
  };
};
