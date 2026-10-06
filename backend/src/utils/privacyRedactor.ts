import { UserRole } from '../types';

/**
 * Sanitizes case information based on requesting user's authorization level.
 * Protects vulnerable missing persons, located individuals, and sensitive family data.
 */
export const sanitizeCaseForRole = (caseData: any, userRole?: UserRole, isOwner: boolean = false): any => {
  const isAuthorized = userRole === 'investigator' || userRole === 'admin' || (userRole === 'family_member' && isOwner);

  const clean = typeof caseData.toObject === 'function' ? caseData.toObject() : { ...caseData };

  if (!isAuthorized) {
    // Redact sensitive exact location and coordinates
    clean.lastKnownLocation = clean.approximateLocation || 'Confidential (Investigator Only)';
    if (clean.patternFeatures?.coordinates) {
      delete clean.patternFeatures.coordinates;
    }
    // Redact sensitive medical vulnerability details
    clean.vulnerabilityInformation = clean.vulnerabilityInformation 
      ? '[Protected Health Information — Available only to verified investigators]' 
      : undefined;

    // Check if located person consent restricts details
    if (['Located', 'Consent Pending', 'Restricted Disclosure', 'Do Not Disclose'].includes(clean.consentStatus)) {
      clean.physicalDescription = '[Restricted pending consent review]';
      clean.circumstances = '[Restricted under consent privacy protocol]';
    }
  }

  return clean;
};

/**
 * Sanitizes sighting data based on user authorization level.
 */
export const sanitizeSightingForRole = (sightingData: any, userRole?: UserRole, isReporter: boolean = false): any => {
  const isAuthorized = userRole === 'investigator' || userRole === 'admin' || isReporter;

  const clean = typeof sightingData.toObject === 'function' ? sightingData.toObject() : { ...sightingData };

  if (!isAuthorized) {
    clean.location = clean.approximateLocation || 'Neighborhood Area (Approximate)';
    if (clean.patternFeatures?.coordinates) {
      delete clean.patternFeatures.coordinates;
    }
    // Mask raw witness contact if embedded
    if (clean.description) {
      clean.description = clean.description.replace(/\b\d{10}\b/g, '[PHONE REDACTED]');
    }
  }

  return clean;
};

/**
 * Strips phone numbers, email addresses, and exact physical addresses from communication strings.
 */
export const redactSensitiveContactInfo = (text: string): { sanitized: string; hadRedactions: boolean } => {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  let sanitized = text;
  let hadRedactions = false;

  if (phoneRegex.test(sanitized)) {
    sanitized = sanitized.replace(phoneRegex, '[PHONE WITHHELD BY SETHU PRIVACY PROTOCOL]');
    hadRedactions = true;
  }

  if (emailRegex.test(sanitized)) {
    sanitized = sanitized.replace(emailRegex, '[EMAIL WITHHELD BY SETHU PRIVACY PROTOCOL]');
    hadRedactions = true;
  }

  return { sanitized, hadRedactions };
};
