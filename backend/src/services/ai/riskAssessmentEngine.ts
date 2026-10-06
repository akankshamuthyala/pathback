import { z } from 'zod';
import { RiskLevel } from '../../types';
import { getAnthropicClient } from './anthropicClient';
import { env } from '../../config/env';

export const RiskAssessmentResultSchema = z.object({
  riskLevel: z.enum(['NORMAL', 'HIGH', 'CRITICAL']),
  priorityScore: z.number().min(0).max(100),
  primaryContributingFactors: z.array(z.string()),
  vulnerabilityBreakdown: z.object({
    ageVulnerability: z.enum(['LOW', 'MODERATE', 'CRITICAL']),
    medicalVulnerability: z.enum(['LOW', 'MODERATE', 'CRITICAL']),
    environmentalCircumstances: z.enum(['LOW', 'MODERATE', 'CRITICAL']),
    timelineUrgency: z.enum(['LOW', 'MODERATE', 'CRITICAL']),
  }),
  investigativeExplanation: z.string(),
  suggestedActionProtocols: z.array(z.string()),
  humanOverrideProtocol: z.string(),
  uncertaintyStatement: z.string(),
});

export type RiskAssessmentResult = z.infer<typeof RiskAssessmentResultSchema>;

export const assessRisk = async (caseData: any): Promise<{ result: RiskAssessmentResult; isDemo: boolean; model: string }> => {
  // Deterministic rule engine baseline
  let score = 30;
  const factors: string[] = [];
  let ageVuln: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';
  let medVuln: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';
  let circVuln: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';
  let timeVuln: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';

  // Rule 1: Age vulnerability
  const currentAge = caseData.estimatedCurrentAge || caseData.ageWhenMissing;
  if (currentAge < 12) {
    score += 45;
    ageVuln = 'CRITICAL';
    factors.push(`Individual is under age 12 (${currentAge} years), classified as highest developmental vulnerability.`);
  } else if (currentAge < 18) {
    score += 30;
    ageVuln = 'CRITICAL';
    factors.push(`Minor status (age ${currentAge}) requires mandatory elevated child-safeguarding protocol.`);
  } else if (currentAge >= 65) {
    score += 30;
    ageVuln = 'CRITICAL';
    factors.push(`Advanced age (${currentAge} years) heightens risk of cognitive or physical disorientation.`);
  }

  // Rule 2: Medical / Vulnerability
  const vulnText = (caseData.vulnerabilityInformation || '').toLowerCase();
  const medFlags = ['alzheimer', 'dementia', 'memory', 'diabetic', 'insulin', 'epilepsy', 'seizure', 'cardiac', 'medication', 'suicid', 'depression'];
  const matchedMeds = medFlags.filter((f) => vulnText.includes(f));
  if (matchedMeds.length > 0) {
    score += 35;
    medVuln = 'CRITICAL';
    factors.push(`Critical medical condition noted (${matchedMeds.join(', ')}). Timely access to medication or specialized care is essential.`);
  } else if (vulnText.length > 0) {
    score += 15;
    medVuln = 'MODERATE';
    factors.push(`Vulnerability flags reported: "${caseData.vulnerabilityInformation}".`);
  }

  // Rule 3: Circumstances
  const circText = (caseData.circumstances || '').toLowerCase();
  const highRiskCircs = ['abduct', 'kidnap', 'forced', 'threat', 'distress', 'coercion', 'suspicious', 'night'];
  const matchedCircs = highRiskCircs.filter((c) => circText.includes(c));
  if (matchedCircs.length > 0) {
    score += 25;
    circVuln = 'CRITICAL';
    factors.push(`Circumstances indicate acute risk indicators (${matchedCircs.join(', ')}).`);
  }

  // Rule 4: Time elapsed
  const daysMissing = (Date.now() - new Date(caseData.dateMissing).getTime()) / (1000 * 60 * 60 * 24);
  if (daysMissing <= 2) {
    score += 20;
    timeVuln = 'CRITICAL';
    factors.push(`Disappearance within last 48 hours ("Golden Search Window"). Prompt resource allocation yields highest recovery efficacy.`);
  } else if (daysMissing <= 7) {
    score += 10;
    timeVuln = 'MODERATE';
    factors.push(`Disappearance within past 7 days; investigative momentum active.`);
  }

  const normalizedScore = Math.min(100, score);
  let computedLevel: RiskLevel = 'NORMAL';
  if (normalizedScore >= 75) computedLevel = 'CRITICAL';
  else if (normalizedScore >= 50) computedLevel = 'HIGH';

  const client = getAnthropicClient();
  if (client) {
    try {
      const prompt = `You are the SETHU AI Decision-Intelligence Risk Engine.
Provide an objective, structured risk assessment report for an intake missing-person case.

Case Context:
- Person: ${caseData.personName}
- Age: ${currentAge}
- Missing Date: ${new Date(caseData.dateMissing).toLocaleDateString()}
- Location: ${caseData.approximateLocation}
- Circumstances: ${caseData.circumstances}
- Vulnerabilities: ${caseData.vulnerabilityInformation || 'None declared'}
- Deterministic Rule Level: ${computedLevel} (Score: ${normalizedScore})

Respond ONLY with valid JSON matching:
{
  "riskLevel": "${computedLevel}",
  "priorityScore": ${normalizedScore},
  "primaryContributingFactors": ${JSON.stringify(factors)},
  "vulnerabilityBreakdown": {
    "ageVulnerability": "${ageVuln}",
    "medicalVulnerability": "${medVuln}",
    "environmentalCircumstances": "${circVuln}",
    "timelineUrgency": "${timeVuln}"
  },
  "investigativeExplanation": "Detailed 2-3 sentence justification.",
  "suggestedActionProtocols": ["Protocol 1", "Protocol 2"],
  "humanOverrideProtocol": "Authorized investigators retain legal authority to manually elevate or downgrade this assessment by logging an explicit justification reason.",
  "uncertaintyStatement": "AI risk triage does not constitute a legal or medical determination. Human investigator judgment is sovereign."
}`;

      const response = await client.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && textBlock.text) {
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = RiskAssessmentResultSchema.parse(parsed);
          return {
            result: validated,
            isDemo: false,
            model: env.CLAUDE_MODEL,
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic API risk evaluation fallback to deterministic engine:', err);
    }
  }

  // Deterministic Explainable Result
  const demoResult: RiskAssessmentResult = {
    riskLevel: computedLevel,
    priorityScore: normalizedScore,
    primaryContributingFactors: factors.length > 0 ? factors : ['Standard missing adult intake with no immediate acute medical flag.'],
    vulnerabilityBreakdown: {
      ageVulnerability: ageVuln,
      medicalVulnerability: medVuln,
      environmentalCircumstances: circVuln,
      timelineUrgency: timeVuln,
    },
    investigativeExplanation: `Algorithmic triage calculated a priority score of ${normalizedScore}/100 resulting in ${computedLevel} classification. Contributing variables include ${factors.slice(0, 2).join(' ')}`,
    suggestedActionProtocols: [
      computedLevel === 'CRITICAL'
        ? 'Deploy immediate inter-agency transit and shelter alerts within 15 km radius.'
        : 'Coordinate with local community outreach groups and assign primary case officer.',
      'Schedule automated cross-case pattern clustering scan across regional sightings.',
      'Maintain restricted access to exact coordinate data in compliance with SETHU privacy protocols.',
    ],
    humanOverrideProtocol: 'Authorized investigators can override this risk status at any time by entering a justified rationale on the case management board.',
    uncertaintyStatement: 'Algorithmic risk assessments serve as operational prioritization guides. They do not constitute statutory or medical declarations. Assigned human personnel must evaluate dynamic field conditions.',
  };

  return {
    result: demoResult,
    isDemo: true,
    model: 'sethu-deterministic-risk-v1',
  };
};
