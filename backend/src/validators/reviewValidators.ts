import { z } from 'zod';

export const submitReviewSchema = z.object({
  analysisId: z.string().optional(),
  caseId: z.string().min(1, 'Case ID is required.'),
  sightingId: z.string().optional(),
  decision: z.enum(['approved', 'rejected', 'duplicate', 'needs_more_info']),
  priorityOverride: z.enum(['NORMAL', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().min(5, 'Investigator notes are required.'),
  reason: z.string().min(5, 'Review rationale must be recorded for audit trail.'),
});

export const updateConsentSchema = z.object({
  status: z.enum([
    'Not Yet Located',
    'Located, Identity Pending',
    'Identity Verified, Consent Pending',
    'Limited Disclosure Approved',
    'Family Contact Approved',
    'Restricted Disclosure',
    'Do Not Disclose',
    'Consent Withdrawn',
    'Reunification Supported',
  ]),
  scope: z.string().min(3, 'Consent scope description is required.'),
  reason: z.string().min(5, 'Consent justification is required for audit logs.'),
  grantedBy: z.string().optional(),
  sharedWith: z.array(z.string()).default([]),
});

export const sendMessageSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required.'),
  recipientId: z.string().optional(),
  recipientRole: z.string().optional(),
  message: z.string().min(1, 'Message content cannot be blank.').max(2000),
  visibility: z.enum(['investigator_only', 'family_and_investigator', 'all_authorized']).default('family_and_investigator'),
});

export const updatePatternClusterSchema = z.object({
  status: z.enum(['Suggested', 'Under Review', 'Confirmed Related by Investigator', 'Dismissed', 'Needs More Information']),
  investigatorNotes: z.string().min(5, 'Investigator rationale is required.'),
});
