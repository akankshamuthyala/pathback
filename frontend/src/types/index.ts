export type UserRole = 
  | 'public_reporter' 
  | 'family_member' 
  | 'investigator' 
  | 'verified_org' 
  | 'admin';

export type CaseStatus =
  | 'Draft'
  | 'Active'
  | 'Under Review'
  | 'Potential Lead'
  | 'Human Verification'
  | 'Located'
  | 'Consent Pending'
  | 'Reunification Supported'
  | 'Closed'
  | 'Archived';

export type RiskLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type ConsentStatus =
  | 'Not Yet Located'
  | 'Located, Identity Pending'
  | 'Identity Verified, Consent Pending'
  | 'Limited Disclosure Approved'
  | 'Family Contact Approved'
  | 'Restricted Disclosure'
  | 'Do Not Disclose'
  | 'Consent Withdrawn'
  | 'Reunification Supported';

export type SightingReviewStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'Potential Lead'
  | 'Verified Lead'
  | 'Rejected'
  | 'Duplicate'
  | 'Needs More Information';

export type ClusterStatus =
  | 'Suggested'
  | 'Under Review'
  | 'Confirmed Related by Investigator'
  | 'Dismissed'
  | 'Needs More Information';

export interface User {
  id: string;
  _id?: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  isPhoneVerified: boolean;
  status: 'active' | 'suspended' | 'flagged';
  organizationName?: string;
  badgeNumber?: string;
  createdAt: string;
}

export interface MissingCase {
  _id: string;
  caseId: string;
  title: string;
  personName: string;
  gender?: string;
  ageWhenMissing: number;
  estimatedCurrentAge: number;
  dateMissing: string;
  lastKnownLocation: string;
  approximateLocation: string;
  locationVisibility: 'RESTRICTED_INVESTIGATOR' | 'PUBLIC_APPROXIMATE';
  physicalDescription: string;
  clothingDescription: string;
  vulnerabilityInformation?: string;
  circumstances: string;
  originalPhotographs: string[];
  additionalPhotographs: string[];
  status: CaseStatus;
  riskLevel: RiskLevel;
  riskOverrideReason?: string;
  consentStatus: ConsentStatus;
  createdBy: any;
  assignedInvestigator?: any;
  patternFeatures?: any;
  patternClusterIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Sighting {
  _id: string;
  sightingId: string;
  caseId?: any;
  description: string;
  location: string;
  approximateLocation: string;
  date: string;
  time?: string;
  clothing?: string;
  estimatedAge?: number;
  sourceType: string;
  sourceReliability: 'low' | 'medium' | 'high' | 'verified' | 'unknown';
  photographs: string[];
  voiceTranscript?: string;
  isVoiceTranscribed?: boolean;
  duplicateImageHash?: string;
  reviewStatus: SightingReviewStatus;
  patternClusterIds?: string[];
  patternFeatures?: any;
  createdBy: any;
  createdAt: string;
}

export interface Evidence {
  _id: string;
  caseId: string;
  sightingId?: string;
  type: 'image' | 'document' | 'voice' | 'video';
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  extractedText?: string;
  extractedMetadata?: Record<string, any>;
  accessLevel: string;
  uploadedBy: any;
  createdAt: string;
}

export interface AIAnalysis {
  _id: string;
  type: 'CASE_SUMMARY' | 'AGE_PROGRESSION_APPEARANCE' | 'SIGHTING_ANALYSIS' | 'RISK_ASSESSMENT' | 'MULTIMODAL_CONNECTION';
  caseId: any;
  sightingId?: any;
  result: any;
  confidence: number;
  limitations: string[];
  engineModel: string;
  isDemo: boolean;
  createdBy: any;
  createdAt: string;
}

export interface PatternCluster {
  _id: string;
  clusterId: string;
  title: string;
  description: string;
  caseIds: any[];
  sightingIds: any[];
  sharedArea: string;
  dateRange: {
    start: string;
    end: string;
  };
  relevanceScore: number;
  scoreBreakdown: {
    geographicSimilarity: number;
    timelineSimilarity: number;
    descriptionSimilarity: number;
    coarseVisualSimilarity: number;
    clothingSimilarity: number;
    duplicateReportEvidence: number;
  };
  supportingFactors: string[];
  conflictingFactors: string[];
  limitations: string[];
  status: ClusterStatus;
  investigatorNotes?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  createdAt: string;
}

export interface ConsentRecord {
  _id: string;
  caseId: string;
  status: ConsentStatus;
  sharedWith: string[];
  scope: string;
  reason: string;
  grantedBy?: string;
  createdBy: any;
  createdAt: string;
}

export interface SecureMessage {
  _id: string;
  caseId: string;
  senderId: any;
  recipientId?: any;
  message: string;
  visibility: 'investigator_only' | 'family_and_investigator' | 'all_authorized';
  hasRedactedContactInfo: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorId?: any;
  actorName?: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface FraudFlag {
  _id: string;
  type: string;
  userId?: any;
  caseId?: any;
  sightingId?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  reason: string;
  evidenceMetadata?: Record<string, any>;
  reviewedBy?: any;
  createdAt: string;
}
