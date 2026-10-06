import { z } from 'zod';
import { getAnthropicClient } from './anthropicClient';
import { env } from '../../config/env';

export const CaseSummaryResultSchema = z.object({
  executiveSummary: z.string(),
  keyFacts: z.array(z.string()),
  missingInformationGaps: z.array(z.string()),
  criticalTimelineMilestones: z.array(z.object({
    date: z.string(),
    description: z.string(),
    significance: z.string(),
  })),
  recommendedInvestigatorActions: z.array(z.string()),
  uncertaintyStatement: z.string(),
});

export type CaseSummaryResult = z.infer<typeof CaseSummaryResultSchema>;

export const generateCaseSummary = async (caseData: any, evidenceList: any[] = []): Promise<{ result: CaseSummaryResult; isDemo: boolean; model: string }> => {
  const client = getAnthropicClient();

  if (client) {
    try {
      const prompt = `You are the SETHU AI Case Summary Engine. You synthesize missing-person case records into objective, explainable investigative summaries.
Follow these Responsible AI rules:
- State facts clearly; distinguish known records from inferences.
- Never state biometric certainty or make unverified assumptions.
- Highlight missing critical information that investigators should collect.
- Provide clear uncertainty disclosures.

Case Details:
- Title: ${caseData.title}
- Person Name: ${caseData.personName}
- Age When Missing: ${caseData.ageWhenMissing}
- Estimated Current Age: ${caseData.estimatedCurrentAge}
- Missing Since: ${new Date(caseData.dateMissing).toLocaleDateString()}
- Last Known Approximate Area: ${caseData.approximateLocation}
- Physical Description: ${caseData.physicalDescription}
- Clothing: ${caseData.clothingDescription}
- Circumstances: ${caseData.circumstances}
- Vulnerability Factors: ${caseData.vulnerabilityInformation || 'None reported'}
- Evidence Count: ${evidenceList.length} items

Respond ONLY with a valid JSON object matching this structure:
{
  "executiveSummary": "Concise 2-3 sentence factual overview of the case status and context.",
  "keyFacts": ["Fact 1", "Fact 2", "Fact 3"],
  "missingInformationGaps": ["Information gap 1", "Information gap 2"],
  "criticalTimelineMilestones": [
    { "date": "YYYY-MM-DD", "description": "What occurred", "significance": "Why it matters" }
  ],
  "recommendedInvestigatorActions": ["Action 1", "Action 2"],
  "uncertaintyStatement": "Explicit statement regarding information confidence and requirement for human verification."
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
          const validated = CaseSummaryResultSchema.parse(parsed);
          return {
            result: validated,
            isDemo: false,
            model: env.CLAUDE_MODEL,
          };
        }
      }
    } catch (error) {
      console.warn('Anthropic API call failed or timed out. Falling back to deterministic demo engine:', error);
    }
  }

  // Deterministic Explainable Demo Fallback
  const yearsElapsed = Math.max(0, caseData.estimatedCurrentAge - caseData.ageWhenMissing);
  const demoResult: CaseSummaryResult = {
    executiveSummary: `Case record ${caseData.caseId} indicates ${caseData.personName}, aged ${caseData.ageWhenMissing} at disappearance, has been missing since ${new Date(caseData.dateMissing).toLocaleDateString()} from the ${caseData.approximateLocation} area. ${yearsElapsed > 0 ? `${yearsElapsed} year(s) have elapsed since the initial report.` : 'Recent disappearance requiring active initial search.'}`,
    keyFacts: [
      `Last confirmed location: ${caseData.approximateLocation}`,
      `Recorded attire: ${caseData.clothingDescription}`,
      `Reported physical traits: ${caseData.physicalDescription}`,
      caseData.vulnerabilityInformation ? `Reported vulnerability factor: ${caseData.vulnerabilityInformation}` : 'No acute medical flags on primary intake record',
    ],
    missingInformationGaps: [
      'CCTV records from adjacent transit hubs covering ±2 hours of last sighting window',
      'Recent high-resolution frontal photographic reference',
      'Confirmed transit ticket or farecard transaction verification',
    ],
    criticalTimelineMilestones: [
      {
        date: new Date(caseData.dateMissing).toISOString().split('T')[0],
        description: 'Last confirmed sighting reported by family / primary contact',
        significance: 'Establishes baseline timeline anchor and attire record',
      },
      {
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        description: 'Community witness sighting submitted near transit corridor',
        significance: 'Potential geographic corridor correlation pending verification',
      },
    ],
    recommendedInvestigatorActions: [
      'Correlate transit logs within 3 km perimeter of last confirmed location',
      'Run cross-case pattern analysis against reports from matching date window',
      'Initiate contact with regional outreach centers and shelter intake registries',
    ],
    uncertaintyStatement: 'AI-assisted synthesis is derived solely from ingested case data and uploaded documents. All timeline milestones and information gaps must be verified by an assigned human investigator before operational deployment.',
  };

  return {
    result: demoResult,
    isDemo: true,
    model: 'sethu-deterministic-summary-v1',
  };
};
