import { z } from 'zod';

export const createSightingSchema = z.object({
  caseId: z.string().optional(),
  description: z.string().min(10, 'Witness description must be at least 10 characters.'),
  location: z.string().min(3, 'Location details are required.'),
  approximateLocation: z.string().min(3, 'Approximate area is required.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid sighting date is required.'),
  time: z.string().optional(),
  clothing: z.string().optional(),
  estimatedAge: z.coerce.number().min(0).max(120).optional(),
  sourceType: z.string().default('witness_report'),
  sourceReliability: z.enum(['low', 'medium', 'high', 'verified', 'unknown']).default('unknown'),
  voiceTranscript: z.string().optional(),
  isVoiceTranscribed: z.coerce.boolean().default(false),
});
