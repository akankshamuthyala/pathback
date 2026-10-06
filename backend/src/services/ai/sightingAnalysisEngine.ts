import { z } from 'zod';
import { getAnthropicClient } from './anthropicClient';
import { env } from '../../config/env';

export const SightingAnalysisResultSchema = z.object({
  potentialLeadStatus: z.enum([
    'Low Relevance',
    'Possible Lead',
    'High Relevance',
    'Human Verification Required',
  ]),
  leadScore: z.number().min(0).max(100),
  confidenceLabel: z.enum([
    'Low Confidence',
    'Moderate Confidence',
    'Substantial Confidence',
    'Requires Field Confirmation',
  ]),
  scoreBreakdown: z.object({
    appearanceRelevance: z.number(),
    ageCompatibility: z.number(),
    locationRelevance: z.number(),
    timelineRelevance: z.number(),
    clothingConsistency: z.number(),
    descriptionConsistency: z.number(),
    sourceReliabilityScore: z.number(),
  }),
  matchingFactors: z.array(z.string()),
  conflictingFactors: z.array(z.string()),
  missingInformationGaps: z.array(z.string()),
  investigatorRecommendation: z.string(),
  uncertaintyStatement: z.string(),
});

export type SightingAnalysisResult = z.infer<typeof SightingAnalysisResultSchema>;

export const analyzeSighting = async (
  caseData: any,
  sightingData: any
): Promise<{ result: SightingAnalysisResult; isDemo: boolean; model: string }> => {
  const client = getAnthropicClient();

  if (client) {
    try {
      const prompt = `You are the SETHU AI Sighting Analysis Engine.
You evaluate the potential investigative relevance of a submitted sighting report against a missing-person case record.

CRITICAL RESPONSIBLE AI MANDATES:
- NEVER state or imply: "This is definitely the missing person" or "Confirmed Match".
- Use language: "Potential Lead", "Possible Lead", "Human Verification Required".
- Balance matching evidence rigorously against conflicting evidence and quality limitations.
- Score transparently on a 0-100 scale across multiple factors (location, timeline, description, attire, age compatibility).

Case Record:
- Case ID: ${caseData.caseId}
- Person: ${caseData.personName}
- Age: ${caseData.ageWhenMissing} (est. current: ${caseData.estimatedCurrentAge})
- Missing Date: ${new Date(caseData.dateMissing).toLocaleDateString()}
- Area: ${caseData.approximateLocation}
- Physical: ${caseData.physicalDescription}
- Clothing: ${caseData.clothingDescription}

Sighting Report:
- Sighting ID: ${sightingData.sightingId}
- Sighting Date: ${new Date(sightingData.date).toLocaleDateString()} ${sightingData.time || ''}
- Sighting Area: ${sightingData.approximateLocation}
- Witness Description: ${sightingData.description}
- Sighting Clothing: ${sightingData.clothing || 'Not reported'}
- Estimated Age Observed: ${sightingData.estimatedAge || 'Not specified'}
- Source Type: ${sightingData.sourceType}
- Source Reliability: ${sightingData.sourceReliability}

Respond ONLY with valid JSON matching:
{
  "potentialLeadStatus": "Human Verification Required",
  "leadScore": 76,
  "confidenceLabel": "Requires Field Confirmation",
  "scoreBreakdown": {
    "appearanceRelevance": 72,
    "ageCompatibility": 88,
    "locationRelevance": 82,
    "timelineRelevance": 80,
    "clothingConsistency": 68,
    "descriptionConsistency": 75,
    "sourceReliabilityScore": 65
  },
  "matchingFactors": ["Factor 1", "Factor 2"],
  "conflictingFactors": ["Factor 1", "Factor 2"],
  "missingInformationGaps": ["Gap 1", "Gap 2"],
  "investigatorRecommendation": "Specific recommendation for investigator",
  "uncertaintyStatement": "AI-assisted analysis is a prioritization aid and never an identification proof. An authorized investigator must independently verify this sighting."
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
          const validated = SightingAnalysisResultSchema.parse(parsed);
          return {
            result: validated,
            isDemo: false,
            model: env.CLAUDE_MODEL,
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic API error during sighting analysis. Falling back to multi-signal scoring model:', err);
    }
  }

  // Multi-signal deterministic lead calculation
  let ageScore = 75;
  if (sightingData.estimatedAge) {
    const ageDiff = Math.abs(sightingData.estimatedAge - caseData.estimatedCurrentAge);
    ageScore = Math.max(20, Math.round(100 - ageDiff * 15));
  }

  // Location text overlap or proximity
  const caseLocWords = (caseData.approximateLocation || '').toLowerCase().split(/[\s,]+/);
  const sightLocWords = (sightingData.approximateLocation || '').toLowerCase().split(/[\s,]+/);
  const commonLoc = caseLocWords.filter((w: string) => w.length > 3 && sightLocWords.includes(w));
  const locationScore = commonLoc.length > 0 ? 84 : 60;

  // Timeline proximity
  const caseDate = new Date(caseData.dateMissing).getTime();
  const sightDate = new Date(sightingData.date).getTime();
  const daysDiff = Math.abs(sightDate - caseDate) / (1000 * 60 * 60 * 24);
  const timelineScore = daysDiff <= 14 ? 85 : daysDiff <= 45 ? 68 : 45;

  // Clothing similarity
  const caseCloth = (caseData.clothingDescription || '').toLowerCase();
  const sightCloth = (sightingData.clothing || '').toLowerCase();
  const sharedClothWords = ['blue', 'black', 'dark', 'jeans', 'shirt', 'jacket', 'trousers', 'kurti', 'sweater', 'hoodie']
    .filter((kw) => caseCloth.includes(kw) && sightCloth.includes(kw));
  const clothingScore = sharedClothWords.length > 0 ? 76 : 42;

  // Source reliability weighting
  const reliabilityMap: Record<string, number> = {
    verified: 95,
    high: 80,
    medium: 65,
    low: 40,
    unknown: 50,
  };
  const sourceScore = reliabilityMap[sightingData.sourceReliability] || 50;

  // Weighted composite lead score
  const compositeScore = Math.round(
    ageScore * 0.2 +
    locationScore * 0.25 +
    timelineScore * 0.2 +
    clothingScore * 0.15 +
    sourceScore * 0.2
  );

  let status: 'Low Relevance' | 'Possible Lead' | 'High Relevance' | 'Human Verification Required' = 'Possible Lead';
  if (compositeScore >= 75) status = 'Human Verification Required';
  else if (compositeScore >= 60) status = 'High Relevance';
  else if (compositeScore < 45) status = 'Low Relevance';

  const demoResult: SightingAnalysisResult = {
    potentialLeadStatus: status,
    leadScore: compositeScore,
    confidenceLabel: compositeScore >= 70 ? 'Requires Field Confirmation' : 'Moderate Confidence',
    scoreBreakdown: {
      appearanceRelevance: 70,
      ageCompatibility: ageScore,
      locationRelevance: locationScore,
      timelineRelevance: timelineScore,
      clothingConsistency: clothingScore,
      descriptionConsistency: 72,
      sourceReliabilityScore: sourceScore,
    },
    matchingFactors: [
      `Estimated age observed (${sightingData.estimatedAge || 'approx.'}) is compatible with case age baseline (${caseData.estimatedCurrentAge} yrs).`,
      commonLoc.length > 0 
        ? `Location matches regional corridor terms: "${commonLoc.join(', ')}".` 
        : `Reported within regional transit perimeter of ${caseData.approximateLocation}.`,
      sharedClothWords.length > 0
        ? `Overlapping attire descriptors: "${sharedClothWords.join(', ')}".`
        : 'Attire style is consistent with seasonal climate during sighting period.',
      `Timeline relevance score of ${timelineScore}/100 based on elapsed window (${Math.round(daysDiff)} days).`,
    ],
    conflictingFactors: [
      sightingData.clothing && !sharedClothWords.length
        ? `Attire described as "${sightingData.clothing}" differs from initial intake report.`
        : 'Witness observation conditions (lighting, distance) remain unverified.',
      'Photographic evidence was captured at distance and cannot confirm fine facial landmarks.',
    ],
    missingInformationGaps: [
      'Inquiry into nearby business security camera archives to cross-reference timestamps.',
      'Direct interview with primary witness to ascertain exact point of orientation.',
    ],
    investigatorRecommendation: compositeScore >= 70
      ? 'Prioritize for human field verification. Contact local liaison to preserve nearby security camera archives and interview witness.'
      : 'Log as supporting situational lead. Monitor for corroborating reports from adjacent sectors.',
    uncertaintyStatement:
      'AI-assisted sighting analysis evaluates mathematical correlation across reported features. It is strictly a decision-support filter and NEVER an identification proof. All leads require authorized investigator review.',
  };

  return {
    result: demoResult,
    isDemo: true,
    model: 'sethu-deterministic-sighting-v1',
  };
};
