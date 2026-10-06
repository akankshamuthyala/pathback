import { Sighting } from '../../models/Sighting';
import { FraudFlag } from '../../models/FraudFlag';
import { calculateHammingDistance } from '../../utils/imageHash';

export class FraudDetector {
  /**
   * Evaluates a sighting submission for potential duplicate images, spam floods, or anomalous attributes.
   */
  static async evaluateSightingSubmission(
    sightingData: {
      userId?: string;
      approximateLocation: string;
      imageHash?: string;
      description: string;
    }
  ): Promise<{ isDuplicate: boolean; duplicateSightingId?: string; flagsTriggered: string[] }> {
    const flagsTriggered: string[] = [];
    let isDuplicate = false;
    let duplicateSightingId: string | undefined;

    // 1. Perceptual Image Hash Duplicate Detection
    if (sightingData.imageHash) {
      const recentSightings = await Sighting.find({
        duplicateImageHash: { $exists: true, $ne: null },
      }).sort({ createdAt: -1 }).limit(50);

      for (const existing of recentSightings) {
        if (existing.duplicateImageHash) {
          const distance = calculateHammingDistance(sightingData.imageHash, existing.duplicateImageHash);
          if (distance <= 4) {
            isDuplicate = true;
            duplicateSightingId = existing.sightingId;
            flagsTriggered.push(`Image perceptual hash matches existing sighting ${existing.sightingId} (distance: ${distance}).`);
            
            await FraudFlag.create({
              type: 'DUPLICATE_IMAGE',
              userId: sightingData.userId,
              sightingId: existing._id,
              severity: 'medium',
              status: 'pending',
              reason: `Perceptual image hash collision (Hamming distance ${distance}) detected with previous report ${existing.sightingId}.`,
              evidenceMetadata: { incomingHash: sightingData.imageHash, existingHash: existing.duplicateImageHash },
            });
            break;
          }
        }
      }
    }

    // 2. Rapid Submission Velocity Check
    if (sightingData.userId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const userRecentCount = await Sighting.countDocuments({
        createdBy: sightingData.userId,
        createdAt: { $gte: fiveMinutesAgo },
      });

      if (userRecentCount >= 4) {
        flagsTriggered.push('High submission velocity detected (>4 submissions within 5 minutes).');
        await FraudFlag.create({
          type: 'RAPID_SUBMISSIONS',
          userId: sightingData.userId,
          severity: 'high',
          status: 'pending',
          reason: `User submitted ${userRecentCount + 1} reports within a 5-minute interval.`,
        });
      }
    }

    return {
      isDuplicate,
      duplicateSightingId,
      flagsTriggered,
    };
  }
}
