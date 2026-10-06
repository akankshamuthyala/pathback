import mongoose from 'mongoose';
import { User } from '../models/User';
import { MissingCase } from '../models/MissingCase';
import { Sighting } from '../models/Sighting';
import { Evidence } from '../models/Evidence';
import { PatternCluster } from '../models/PatternCluster';
import { AIAnalysis } from '../models/AIAnalysis';
import { ConsentRecord } from '../models/ConsentRecord';
import { SecureMessage } from '../models/SecureMessage';
import { AuditLog } from '../models/AuditLog';
import { hashPassword } from '../utils/password';
import { calculateImageHash } from '../utils/imageHash';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding fresh synthetic demonstration data for PathBack platform...');

    // Clear previous synthetic demo data to ensure matching ages and photos
    await User.deleteMany({});
    await MissingCase.deleteMany({});
    await Sighting.deleteMany({});
    await Evidence.deleteMany({});
    await PatternCluster.deleteMany({});
    await AIAnalysis.deleteMany({});
    await ConsentRecord.deleteMany({});
    await SecureMessage.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create Demo Users
    const passwordHash = await hashPassword('DemoPassword@123');
    const adminPasswordHash = await hashPassword('Admin@123');
    const invPasswordHash = await hashPassword('Investigator@123');
    const famPasswordHash = await hashPassword('Family@123');
    const repPasswordHash = await hashPassword('Reporter@123');

    const adminUser = await User.create({
      name: 'Administrator Sarah Jenkins',
      phoneNumber: '+15550000001',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isPhoneVerified: true,
      status: 'active',
      organizationName: 'PathBack Global Governance Oversight',
    });

    const investigatorUser = await User.create({
      name: 'Inspector Maya Sen',
      phoneNumber: '+15550000002',
      passwordHash: invPasswordHash,
      role: 'investigator',
      isPhoneVerified: true,
      status: 'active',
      organizationName: 'Metropolitan Missing Persons Unit',
      badgeNumber: 'INV-4402',
    });

    const familyUser = await User.create({
      name: 'Sunita Sharma (Mother)',
      phoneNumber: '+15550000003',
      passwordHash: famPasswordHash,
      role: 'family_member',
      isPhoneVerified: true,
      status: 'active',
    });

    const reporterUser = await User.create({
      name: 'Rahul Verma (Witness)',
      phoneNumber: '+15550000004',
      passwordHash: repPasswordHash,
      role: 'public_reporter',
      isPhoneVerified: true,
      status: 'active',
    });

    console.log('✅ Demo user accounts created.');

    // 2. Synthetic C    // Case 1: Child Lost at 9 years old
    const nineDaysAgo = new Date(Date.now() - 9 * 86400000);
    const case1 = await MissingCase.create({
      caseId: 'SET-2026-001',
      title: 'Disappearance of Aarav Sharma (Age 9) - Child Transit Protocol',
      personName: 'Aarav Sharma',
      gender: 'Male',
      ageWhenMissing: 9,
      estimatedCurrentAge: 9,
      dateMissing: nineDaysAgo,
      lastKnownLocation: 'Platform 3 Waiting Lounge, Central Railway Station, Sector 4',
      approximateLocation: 'Central Railway Station Area, District 4',
      locationVisibility: 'RESTRICTED_INVESTIGATOR',
      physicalDescription: 'Young boy, approx 4ft 2in tall, cheerful smile, short dark hair, slight birthmark near right collarbone.',
      clothingDescription: 'Grey-blue graphic t-shirt, dark shorts, white sneakers, carrying a small school backpack.',
      vulnerabilityInformation: 'Child status (9 years old). Primary school student. First occurrence away from family care.',
      circumstances: 'Aarav was last seen heading toward the railway station platform area following afternoon tuition classes. Did not arrive home on designated commuter train.',
      status: 'Active',
      riskLevel: 'HIGH',
      consentStatus: 'Not Yet Located',
      createdBy: familyUser._id,
      assignedInvestigator: investigatorUser._id,
      originalPhotographs: ['/cases/case_9yo.jpg'],
      additionalPhotographs: ['/cases/case_9yo.jpg'],
      patternFeatures: {
        ageRange: { min: 8, max: 11 },
        locationArea: 'Central Railway Station Area, District 4',
        locationPrecision: 'NEIGHBORHOOD',
        timeWindow: { start: nineDaysAgo.toISOString(), end: new Date().toISOString() },
        clothing: ['grey-blue t-shirt', 'dark shorts', 'white sneakers'],
        hairDescription: ['short dark hair'],
        generalVisualDescriptors: ['young boy', 'cheerful smile', 'small backpack'],
        sourceType: 'family_report',
        sourceReliability: 'verified',
      },
    });

    // Case 2: Adult Lost at 30 years old
    const eighteenDaysAgo = new Date(Date.now() - 18 * 86400000);
    const case2 = await MissingCase.create({
      caseId: 'SET-2026-002',
      title: 'Disappearance of Priya Patel (Age 30) - University Metro Corridor',
      personName: 'Priya Patel',
      gender: 'Female',
      ageWhenMissing: 30,
      estimatedCurrentAge: 30,
      dateMissing: eighteenDaysAgo,
      lastKnownLocation: 'Gate 2 Entrance, North Campus Metro, Avenue 5',
      approximateLocation: 'University Metro Corridor, North District',
      locationVisibility: 'RESTRICTED_INVESTIGATOR',
      physicalDescription: 'Adult female, height approx 5ft 5in, shoulder-length wavy dark hair, warm smile, professional demeanor.',
      clothingDescription: 'Olive green formal blazer, cream inner blouse, dark trousers, carrying leather work tote.',
      vulnerabilityInformation: 'Adult (30 years old). Senior research associate. No acute medical conditions documented.',
      circumstances: 'Concluded meetings at 5:30 PM. Mobile phone transitioned to offline status 35 minutes later at transit interchange.',
      status: 'Under Review',
      riskLevel: 'NORMAL',
      consentStatus: 'Not Yet Located',
      createdBy: familyUser._id,
      assignedInvestigator: investigatorUser._id,
      originalPhotographs: ['/cases/case_30yo.jpg'],
      additionalPhotographs: ['/cases/case_30yo.jpg'],
      patternFeatures: {
        ageRange: { min: 28, max: 34 },
        locationArea: 'University Metro Corridor, North District',
        locationPrecision: 'NEIGHBORHOOD',
        timeWindow: { start: eighteenDaysAgo.toISOString(), end: new Date().toISOString() },
        clothing: ['olive green blazer', 'cream blouse', 'dark trousers'],
        hairDescription: ['shoulder-length wavy dark hair'],
        generalVisualDescriptors: ['adult', 'medium build', 'professional attire'],
        sourceType: 'family_intake',
        sourceReliability: 'verified',
      },
    });

    // Case 3: Young Child Lost at 5 years old - Located, Consent Pending
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    const case3 = await MissingCase.create({
      caseId: 'SET-2026-003',
      title: 'Missing Child Meera Das (Age 5) - Rapid Protection Protocol',
      personName: 'Meera Das',
      gender: 'Female',
      ageWhenMissing: 5,
      estimatedCurrentAge: 5,
      dateMissing: threeDaysAgo,
      lastKnownLocation: 'Parkside Municipal Garden Courtyard, East Wing',
      approximateLocation: 'Greenwood Municipal Gardens, East Zone',
      locationVisibility: 'RESTRICTED_INVESTIGATOR',
      physicalDescription: 'Young child / toddler, height approx 3ft 2in, curly dark hair with colorful hair clips, expressive big brown eyes.',
      clothingDescription: 'Bright orange floral patterned frock, pink undershirt, colorful thread on wrist.',
      vulnerabilityInformation: 'Young child status (5 years old). Wandered from family during municipal gathering. Child protection care active.',
      circumstances: 'Wandered away from courtyard playground during community event. Safely located by municipal patrol and placed in child protective care.',
      status: 'Located',
      riskLevel: 'CRITICAL',
      consentStatus: 'Identity Verified, Consent Pending',
      createdBy: investigatorUser._id,
      assignedInvestigator: investigatorUser._id,
      originalPhotographs: ['/cases/case_5yo.jpg'],
      additionalPhotographs: ['/cases/case_5yo.jpg'],
      patternFeatures: {
        ageRange: { min: 4, max: 7 },
        locationArea: 'Greenwood Municipal Gardens, East Zone',
        locationPrecision: 'NEIGHBORHOOD',
        timeWindow: { start: threeDaysAgo.toISOString(), end: new Date().toISOString() },
        clothing: ['orange floral frock', 'pink tee'],
        hairDescription: ['curly dark hair with clips'],
        generalVisualDescriptors: ['toddler', 'young child'],
        sourceType: 'care_facility',
        sourceReliability: 'verified',
      },
    });

    console.log('✅ 3 Synthetic cases created (Ages: 9 yrs, 30 yrs, 5 yrs).');

    // 3. Synthetic Sightings
    const photoHash1 = 'a1f8e2c4b790d356';
    const photoHash2 = 'f0e4b8a2c195d732';

    // Sighting 1: Platform 4 (Linked to Aarav Sharma - 9yo)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const sighting1 = await Sighting.create({
      sightingId: 'S-101',
      caseId: case1._id,
      description: 'Observed a 9-year-old boy matching the photo sitting near the commuter waiting bench on Railway Platform 4. Appeared tired, carrying a small backpack. Was reading a colorful comic book.',
      location: 'Bench adjacent to Bookstall, Platform 4, Central Railway Station',
      approximateLocation: 'Central Railway Station Area, District 4',
      date: sevenDaysAgo,
      time: '18:45',
      clothing: 'Grey-blue graphic t-shirt, dark shorts, white sneakers',
      estimatedAge: 9,
      sourceType: 'transit_staff',
      sourceReliability: 'high',
      photographs: ['/cases/case_9yo.jpg'],
      duplicateImageHash: photoHash1,
      reviewStatus: 'Potential Lead',
      createdBy: reporterUser._id,
      patternClusterIds: ['CLUST-CENTRAL-01'],
      patternFeatures: {
        ageRange: { min: 8, max: 11 },
        locationArea: 'Central Railway Station Area, District 4',
        timeWindow: { start: sevenDaysAgo.toISOString(), end: sevenDaysAgo.toISOString() },
        clothing: ['grey-blue t-shirt', 'dark shorts', 'white sneakers'],
      },
    });

    // Sighting 2: Bus Stand West (Corridor pattern near railway station)
    const sixDaysAgo = new Date(Date.now() - 6 * 86400000);
    const sighting2 = await Sighting.create({
      sightingId: 'S-102',
      caseId: case1._id,
      description: 'Saw a young 9-year-old schoolboy purchasing fruit juice at the West terminal concession. Spoke politely, asked what time the bus leaves.',
      location: 'West Bus Terminal Bay 6, 2.1km West of Central Station',
      approximateLocation: 'Central Railway Station Area, District 4',
      date: sixDaysAgo,
      time: '08:20',
      clothing: 'Grey-blue shirt, dark shorts',
      estimatedAge: 9,
      sourceType: 'witness_report',
      sourceReliability: 'medium',
      photographs: ['/cases/case_9yo.jpg'],
      duplicateImageHash: photoHash2,
      reviewStatus: 'Under Review',
      createdBy: reporterUser._id,
      patternClusterIds: ['CLUST-CENTRAL-01'],
      patternFeatures: {
        ageRange: { min: 8, max: 11 },
        locationArea: 'Central Railway Station Area, District 4',
        timeWindow: { start: sixDaysAgo.toISOString(), end: sixDaysAgo.toISOString() },
        clothing: ['grey-blue shirt', 'dark shorts'],
      },
    });

    // Sighting 3: Duplicate submission of S-101 (Perceptual hash collision demonstration)
    const sighting3 = await Sighting.create({
      sightingId: 'S-103',
      caseId: case1._id,
      description: 'Forwarding image seen on social media claiming 9-year-old child was spotted near railway terminal.',
      location: 'Central Station Platform 4 Area',
      approximateLocation: 'Central Railway Station Area, District 4',
      date: sevenDaysAgo,
      time: '18:45',
      clothing: 'Grey-blue shirt and dark shorts',
      estimatedAge: 9,
      sourceType: 'social_media_repost',
      sourceReliability: 'low',
      photographs: ['/cases/case_9yo.jpg'],
      duplicateImageHash: photoHash1, // Exact match with S-101!
      reviewStatus: 'Duplicate',
      createdBy: reporterUser._id,
      patternClusterIds: ['CLUST-CENTRAL-01'],
    });

    // Sighting 4: Visually similar but unrelated report (conflicting evidence)
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);
    const sighting4 = await Sighting.create({
      sightingId: 'S-104',
      caseId: case1._id,
      description: 'Young man seen entering coffee shop. Initially thought he resembled the flyer, but this person was taller (approx 6ft 1in) and wearing an orange hoodie with earbuds.',
      location: 'University Metro Gate 3 Promenade',
      approximateLocation: 'University Metro Corridor, North District',
      date: fiveDaysAgo,
      time: '14:15',
      clothing: 'Bright orange oversized hoodie, beige cargo pants',
      estimatedAge: 19,
      sourceType: 'witness_report',
      sourceReliability: 'medium',
      photographs: [],
      reviewStatus: 'Rejected',
      createdBy: reporterUser._id,
    });

    // Sighting 5: Community Shelter report for Meera Das (5yo)
    const oneDayAgo = new Date(Date.now() - 1 * 86400000);
    const sighting5 = await Sighting.create({
      sightingId: 'S-105',
      caseId: case3._id,
      description: 'A 5-year-old little girl was brought in by municipal patrol after being found near the garden fountain courtyard. Social worker gave her juice; she provided her first name Meera. Resembles case photo.',
      location: 'Municipal Child Welfare Protection Desk, Room 104',
      approximateLocation: 'Greenwood Municipal Gardens, East Zone',
      date: oneDayAgo,
      time: '19:30',
      clothing: 'Bright orange floral patterned frock, pink undershirt, colorful wrist thread',
      estimatedAge: 5,
      sourceType: 'shelter',
      sourceReliability: 'verified',
      photographs: ['/cases/case_5yo.jpg'],
      reviewStatus: 'Verified Lead',
      createdBy: investigatorUser._id,
    });

    console.log('✅ 5 Synthetic sightings created.');

    // 4. Pattern Cluster: Central Railway Station & Transit Corridor Reports
    const cluster1 = await PatternCluster.create({
      clusterId: 'CLUST-CENTRAL-01',
      title: 'Central Railway Station & Transit Corridor Reports',
      description: 'Multi-signal pattern recognition identified 3 proximate sightings near Central Railway Station transit corridor across an active 48-hour window.',
      caseIds: [case1._id],
      sightingIds: [sighting1._id, sighting2._id, sighting3._id],
      sharedArea: 'Central Railway Station Area, District 4',
      dateRange: {
        start: sevenDaysAgo,
        end: sixDaysAgo,
      },
      relevanceScore: 82,
      scoreBreakdown: {
        geographicSimilarity: 95,
        timelineSimilarity: 88,
        descriptionSimilarity: 85,
        coarseVisualSimilarity: 80,
        clothingSimilarity: 90,
        duplicateReportEvidence: 95,
      },
      supportingFactors: [
        'Multiple sightings localized within a 2.1 km transit perimeter (Railway Platform 4 and West Bus Terminal).',
        'Sightings occurred within a consecutive 48-hour active timeline window.',
        'Corroborating witness reports consistently describe grey-blue graphic t-shirt and dark shorts.',
        'Estimated age observed (8-10) aligns closely with Aarav Sharma baseline (9 yrs).',
        'Image hash analysis identified S-103 as a redundant social media repost of S-101.',
      ],
      conflictingFactors: [
        'Report S-102 mentions dark framed glasses while S-101 observer did not note eyewear.',
        'Lighting conditions in the bus bay were shadowed, introducing slight observer variance.',
      ],
      limitations: [
        'Coarse visual similarity signals represent probabilistic correlations; biometric face recognition is not applied.',
        'Transit hub foot-traffic density introduces high volume of general passerby noise.',
      ],
      status: 'Under Review',
      investigatorNotes: 'Inspector Maya Sen: Cross-referencing platform 4 CCTV logs with the ticketing vendor at West Bus Terminal.',
      reviewedBy: investigatorUser._id,
      reviewedAt: new Date(),
    });

    // 5. Pre-computed AI Analyses
    await AIAnalysis.create({
      type: 'CASE_SUMMARY',
      caseId: case1._id,
      confidence: 88,
      limitations: [
        'Summary generated from ingested intake records and witness submissions.',
        'Operational deployment requires field verification by assigned investigator.',
      ],
      engineModel: 'claude-3-7-sonnet-20250219',
      isDemo: true,
      createdBy: investigatorUser._id,
      result: {
        executiveSummary: 'Aarav Sharma, age 16, disappeared 9 days ago following evening classes near Central Railway Station. A high-relevance spatial cluster has emerged along the immediate transit corridor.',
        keyFacts: [
          'Disappearance occurred on evening transit route.',
          'Attire confirmed as navy blue button-up shirt and dark charcoal trousers.',
          'Three corroborating reports clustered within 2.1 km radius.',
        ],
        missingInformationGaps: [
          'Platform 4 security video archives for the 18:30-19:00 window.',
          'Metro smart-card transaction timestamp reconciliation.',
        ],
        criticalTimelineMilestones: [
          { date: nineDaysAgo.toISOString().split('T')[0], description: 'Disappearance reported by mother', significance: 'Baseline timeline anchor' },
          { date: sevenDaysAgo.toISOString().split('T')[0], description: 'Sighting S-101 reported at Platform 4', significance: 'Strong spatial lead' },
          { date: sixDaysAgo.toISOString().split('T')[0], description: 'Sighting S-102 reported at West Bus Stand', significance: 'Transit corridor directional correlation' },
        ],
        recommendedInvestigatorActions: [
          'Interview station concession staff at West Bus Terminal.',
          'Coordinate with transit security to safeguard platform CCTV footage.',
        ],
        uncertaintyStatement: 'AI-assisted synthesis is a decision-support guide and does not constitute statutory proof.',
      },
    });

    await AIAnalysis.create({
      type: 'AGE_PROGRESSION_APPEARANCE',
      caseId: case1._id,
      confidence: 82,
      limitations: [
        'Age-Aware Appearance Analysis represents probabilistic biological modeling.',
        'Morphological projections must NEVER be treated as conclusive proof of identity.',
      ],
      engineModel: 'claude-3-7-sonnet-20250219',
      isDemo: true,
      createdBy: investigatorUser._id,
      result: {
        analysisTitle: 'Age-Aware Appearance Analysis',
        timeElapsedYears: 0,
        ageBaseline: 16,
        currentEstimatedAge: 16,
        stableAttributes: [
          { attribute: 'Inter-pupillary distance & orbital frame', description: 'Cranial metric invariant across observational window', investigativeReliability: 'HIGH' },
          { attribute: 'Collarbone birthmark', description: 'Permanent cutaneous landmark on right clavicular margin', investigativeReliability: 'HIGH' },
        ],
        changeableAttributes: [
          { attribute: 'Hair styling & length', expectedVariations: 'Potential unkempt appearance after 9 days in transit', potentialConfounders: 'Weather, caps' },
          { attribute: 'Eyewear status', expectedVariations: 'Possibility of removed or misplaced glasses', potentialConfounders: 'Broken frames' },
        ],
        probableMaturationChanges: [
          'Short time elapsed; biological skeletal growth invariant. Primary changes are situational (fatigue, disheveled attire).',
        ],
        investigatorReviewConsiderations: [
          'Rely primarily on right collarbone birthmark if physical confirmation is possible.',
          'Do not disqualify leads solely based on presence/absence of glasses.',
        ],
        uncertaintyStatement: 'Probabilistic biological model. An age-progressed profile must never be treated as conclusive proof of identity.',
      },
    });

    await AIAnalysis.create({
      type: 'SIGHTING_ANALYSIS',
      caseId: case1._id,
      sightingId: sighting1._id,
      confidence: 78,
      limitations: [
        'Sighting analysis scores are mathematical correlation aids, not proof of identity.',
        'Human verification is mandatory before taking operational steps.',
      ],
      engineModel: 'claude-3-7-sonnet-20250219',
      isDemo: true,
      createdBy: investigatorUser._id,
      result: {
        potentialLeadStatus: 'Human Verification Required',
        leadScore: 78,
        confidenceLabel: 'Requires Field Confirmation',
        scoreBreakdown: {
          appearanceRelevance: 78,
          ageCompatibility: 95,
          locationRelevance: 92,
          timelineRelevance: 85,
          clothingConsistency: 90,
          descriptionConsistency: 80,
          sourceReliabilityScore: 80,
        },
        matchingFactors: [
          'Observed age (16) matches missing youth baseline exactly.',
          'Location (Platform 4) is directly within primary disappearance station sector.',
          'Attire matches: navy blue shirt and charcoal trousers recorded on both documents.',
          'Reported by verified transit staff member.',
        ],
        conflictingFactors: [
          'Observer did not note spectacles in the brief interaction.',
          'Image was captured in low evening light with platform crowd motion.',
        ],
        missingInformationGaps: [
          'Confirmation whether subject boarded outbound commuter train #402.',
        ],
        investigatorRecommendation: 'Priority field lead. Dispatch liaison officer to Platform 4 station master office immediately.',
        uncertaintyStatement: 'Decision support score only. Never call this a confirmed match.',
      },
    });

    // 6. Consent Record for Case 3 (Meera Das - Located, Consent Pending)
    await ConsentRecord.create({
      caseId: case3._id,
      status: 'Identity Verified, Consent Pending',
      sharedWith: ['INVESTIGATOR_MAYA_SEN', 'SANCTUARY_DIRECTOR'],
      scope: 'RESTRICTED_DISCLOSURE',
      reason: 'Subject has been safely located at community sanctuary. In compliance with SETHU Consent-First protocol, private contact numbers, exact room coordinates, and personal photographs remain strictly locked until senior social worker completes consent review.',
      grantedBy: 'Inspector Maya Sen & Sanctuary Social Worker',
      createdBy: investigatorUser._id,
    });

    // 7. Secure Messages
    await SecureMessage.create({
      caseId: case1._id,
      senderId: familyUser._id,
      recipientId: investigatorUser._id,
      message: 'Inspector Sen, we checked Aarav locker at his tuition center. His favorite notebook was missing, but all his textbooks were left behind. Does this help the transit timeline?',
      visibility: 'family_and_investigator',
      hasRedactedContactInfo: false,
    });

    await SecureMessage.create({
      caseId: case1._id,
      senderId: investigatorUser._id,
      recipientId: familyUser._id,
      message: 'Thank you Sunita. That corroborates Sighting S-101 where the witness noted he was holding a paperback book on Platform 4. We have alerted the transit division and are actively reviewing the lead.',
      visibility: 'family_and_investigator',
      hasRedactedContactInfo: false,
    });

    // 8. Audit Logs
    await AuditLog.create({
      actorId: investigatorUser._id,
      actorName: 'Inspector Maya Sen',
      role: 'investigator',
      action: 'CONSENT_STATUS_MODIFIED',
      entityType: 'ConsentRecord',
      entityId: case3.caseId,
      reason: 'Transitioned case to Identity Verified, Consent Pending. Safeguarding exact shelter address.',
      metadata: { caseId: case3.caseId, consentStatus: 'Identity Verified, Consent Pending' },
    });

    await AuditLog.create({
      actorId: adminUser._id,
      actorName: 'Administrator Sarah Jenkins',
      role: 'admin',
      action: 'SECURITY_AUDIT_VERIFIED',
      entityType: 'System',
      reason: 'Verified platform compliance with PS-13 AI Security, Privacy & Trust protocols.',
    });

    console.log('✅ Complete synthetic demo dataset successfully seeded.');
  } catch (error) {
    console.error('❌ Error during demo database seeding:', error);
  }
};
