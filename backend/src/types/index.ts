import { Request } from 'express';

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

export type AIAnalysisType =
  | 'CASE_SUMMARY'
  | 'AGE_PROGRESSION_APPEARANCE'
  | 'SIGHTING_ANALYSIS'
  | 'RISK_ASSESSMENT'
  | 'MULTIMODAL_CONNECTION';

export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface PatternFeatures {
  ageRange?: {
    min: number;
    max: number;
  };
  locationArea?: string;
  locationPrecision?: 'EXACT' | 'NEIGHBORHOOD' | 'DISTRICT' | 'CITY';
  coordinates?: {
    lat: number;
    lng: number;
  };
  timeWindow?: {
    start: string;
    end: string;
  };
  clothing?: string[];
  hairDescription?: string[];
  generalVisualDescriptors?: string[];
  sourceType?: string;
  sourceReliability?: 'low' | 'medium' | 'high' | 'verified' | 'unknown';
}
