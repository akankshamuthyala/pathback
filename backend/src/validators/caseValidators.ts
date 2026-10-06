import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  personName: z.string().min(2, 'Person name is required.').max(100),
  gender: z.string().optional(),
  ageWhenMissing: z.coerce.number().min(0).max(120),
  estimatedCurrentAge: z.coerce.number().min(0).max(120),
  dateMissing: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date missing is required.'),
  lastKnownLocation: z.string().min(3, 'Last known location is required.'),
  approximateLocation: z.string().min(3, 'Approximate area is required for redacted views.'),
  locationVisibility: z.enum(['RESTRICTED_INVESTIGATOR', 'PUBLIC_APPROXIMATE']).default('RESTRICTED_INVESTIGATOR'),
  physicalDescription: z.string().min(10, 'Physical description must be at least 10 characters.'),
  clothingDescription: z.string().min(5, 'Clothing description is required.'),
  vulnerabilityInformation: z.string().optional(),
  circumstances: z.string().min(10, 'Circumstances must be described.'),
  riskLevel: z.enum(['NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
});

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: z.enum([
    'Draft',
    'Active',
    'Under Review',
    'Potential Lead',
    'Human Verification',
    'Located',
    'Consent Pending',
    'Reunification Supported',
    'Closed',
    'Archived',
  ]).optional(),
  riskOverrideReason: z.string().optional(),
  assignedInvestigator: z.string().optional(),
});
