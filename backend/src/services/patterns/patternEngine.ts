import { MissingCase } from '../../models/MissingCase';
import { Sighting } from '../../models/Sighting';
import { PatternCluster, IPatternCluster } from '../../models/PatternCluster';
import { calculateHammingDistance } from '../../utils/imageHash';

export interface PatternScoreBreakdown {
  geographicSimilarity: number; // 30%
  timelineSimilarity: number;   // 20%
  descriptionSimilarity: number; // 20%
  coarseVisualSimilarity: number; // 15%
  clothingSimilarity: number;   // 10%
  duplicateReportEvidence: number; // 5%
  totalScore: number;
}

export class PatternRecognitionEngine {
  /**
   * Calculates multi-signal pattern similarity between two records (e.g., a case and a sighting, or two sightings).
   */
  static computeSimilarity(recordA: any, recordB: any): { score: PatternScoreBreakdown; supporting: string[]; conflicting: string[]; limitations: string[] } {
    const supporting: string[] = [];
    const conflicting: string[] = [];
    const limitations: string[] = [];

    // 1. Geographic Similarity (30%)
    const locA = (recordA.approximateLocation || recordA.location || '').toLowerCase();
    const locB = (recordB.approximateLocation || recordB.location || '').toLowerCase();
    const wordsA = locA.split(/[\s,]+/);
    const wordsB = locB.split(/[\s,]+/);
    const commonWords = wordsA.filter((w: string) => w.length > 3 && wordsB.includes(w));
    
    let geoScore = 40;
    if (commonWords.length >= 2 || locA === locB) {
      geoScore = 95;
      supporting.push(`Reports share distinct geographic neighborhood terms: "${commonWords.join(', ')}".`);
    } else if (commonWords.length === 1) {
      geoScore = 75;
      supporting.push(`Reports fall within proximate vicinity or regional corridor ("${commonWords[0]}").`);
    } else {
      geoScore = 30;
      conflicting.push('Locations do not share immediate neighborhood or landmark keywords.');
    }

    // 2. Timeline Similarity (20%)
    const dateA = new Date(recordA.date || recordA.dateMissing).getTime();
    const dateB = new Date(recordB.date || recordB.dateMissing).getTime();
    const dayDelta = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

    let timeScore = 30;
    if (dayDelta <= 3) {
      timeScore = 95;
      supporting.push(`Sightings occurred within an immediate 72-hour window (${Math.round(dayDelta)} days).`);
    } else if (dayDelta <= 10) {
      timeScore = 80;
      supporting.push(`Reports occurred within a 10-day active observation cluster (${Math.round(dayDelta)} days apart).`);
    } else if (dayDelta <= 30) {
      timeScore = 60;
      supporting.push(`Sightings fall within a 30-day temporal bracket.`);
    } else {
      timeScore = 25;
      conflicting.push(`Substantial time gap (${Math.round(dayDelta)} days) between reported incidents.`);
    }

    // 3. Description Similarity (20%)
    const descA = (recordA.description || recordA.physicalDescription || '').toLowerCase();
    const descB = (recordB.description || recordB.physicalDescription || '').toLowerCase();
    const descTokens = ['tall', 'short', 'slim', 'medium', 'scar', 'glasses', 'beard', 'shaved', 'walk', 'limp', 'backpack'];
    const sharedTokens = descTokens.filter((t) => descA.includes(t) && descB.includes(t));
    
    let descScore = 50;
    if (sharedTokens.length >= 2) {
      descScore = 90;
      supporting.push(`Multiple corroborating physical traits noted by witnesses: "${sharedTokens.join(', ')}".`);
    } else if (sharedTokens.length === 1) {
      descScore = 70;
      supporting.push(`Single distinguishing descriptor correlated: "${sharedTokens[0]}".`);
    } else {
      descScore = 40;
      limitations.push('Witness descriptions contain generic wording without unique identifying markers.');
    }

    // 4. Coarse Visual Similarity (15%)
    const ageA = recordA.estimatedCurrentAge || recordA.ageWhenMissing || recordA.estimatedAge || 25;
    const ageB = recordB.estimatedAge || recordB.estimatedCurrentAge || recordB.ageWhenMissing || 25;
    const ageDelta = Math.abs(ageA - ageB);

    let visualScore = 50;
    if (ageDelta <= 2) {
      visualScore = 90;
      supporting.push(`Estimated observed age ranges overlap closely (${ageA} vs ${ageB} yrs).`);
    } else if (ageDelta <= 5) {
      visualScore = 70;
      supporting.push(`Age estimates are biologically compatible within acceptable observational margin.`);
    } else {
      visualScore = 30;
      conflicting.push(`Notable divergence in estimated age (${ageA} vs ${ageB} yrs).`);
    }

    // 5. Clothing Similarity (10%)
    const clothA = (recordA.clothing || recordA.clothingDescription || '').toLowerCase();
    const clothB = (recordB.clothing || recordB.clothingDescription || '').toLowerCase();
    const clothTokens = ['blue', 'black', 'white', 'yellow', 'dark', 'denim', 'jeans', 'shirt', 'jacket', 'kurti', 'hoodie', 'shoes', 'cap'];
    const matchedCloth = clothTokens.filter((c) => clothA.includes(c) && clothB.includes(c));

    let clothScore = 40;
    if (matchedCloth.length >= 2) {
      clothScore = 95;
      supporting.push(`Attire descriptions indicate matching garment items: "${matchedCloth.join(', ')}".`);
    } else if (matchedCloth.length === 1) {
      clothScore = 75;
      supporting.push(`One shared attire descriptor: "${matchedCloth[0]}".`);
    } else {
      clothScore = 35;
      conflicting.push('Reported clothing styles or colors differ.');
    }

    // 6. Duplicate / Repeated-Report Evidence (5%)
    let dupScore = 20;
    if (recordA.duplicateImageHash && recordB.duplicateImageHash) {
      const dist = calculateHammingDistance(recordA.duplicateImageHash, recordB.duplicateImageHash);
      if (dist <= 4) {
        dupScore = 100;
        supporting.push('Perceptual image hash matches indicates duplicate upload or identical photograph source.');
      }
    }

    limitations.push('Coarse visual signals represent probabilistic indicators; face recognition biometrics are intentionally not applied.');
    limitations.push('Environmental factors (transit crowd density, ambient lighting) introduce observer variance.');

    const totalScore = Math.round(
      geoScore * 0.3 +
      timeScore * 0.2 +
      descScore * 0.2 +
      visualScore * 0.15 +
      clothScore * 0.1 +
      dupScore * 0.05
    );

    const breakdown: PatternScoreBreakdown = {
      geographicSimilarity: geoScore,
      timelineSimilarity: timeScore,
      descriptionSimilarity: descScore,
      coarseVisualSimilarity: visualScore,
      clothingSimilarity: clothScore,
      duplicateReportEvidence: dupScore,
      totalScore,
    };

    return {
      score: breakdown,
      supporting,
      conflicting,
      limitations,
    };
  }

  /**
   * Scans active cases and recent sightings to aggregate recurring pattern clusters.
   */
  static async runCrossCasePatternAnalysis(): Promise<IPatternCluster[]> {
    const cases = await MissingCase.find({ status: { $in: ['Active', 'Under Review', 'Potential Lead'] } }).limit(20);
    const sightings = await Sighting.find().sort({ createdAt: -1 }).limit(30);

    const clustersFound: IPatternCluster[] = [];

    // Group sightings by approximate location corridor
    const locationGroups: Record<string, any[]> = {};
    for (const sighting of sightings) {
      const area = sighting.approximateLocation || 'Unknown Region';
      if (!locationGroups[area]) locationGroups[area] = [];
      locationGroups[area].push(sighting);
    }

    for (const [area, areaSightings] of Object.entries(locationGroups)) {
      if (areaSightings.length >= 2) {
        // Find relevant cases that share this geographic bucket
        const relevantCases = cases.filter((c) => {
          const cLoc = c.approximateLocation.toLowerCase();
          return cLoc.includes(area.toLowerCase()) || area.toLowerCase().includes(cLoc.split(',')[0].toLowerCase());
        });

        // Compute cross-pattern similarity
        const sim = this.computeSimilarity(
          relevantCases[0] || areaSightings[0],
          areaSightings[1]
        );

        const clusterId = `CLUST-${area.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        
        const minDate = new Date(Math.min(...areaSightings.map((s) => new Date(s.date).getTime())));
        const maxDate = new Date(Math.max(...areaSightings.map((s) => new Date(s.date).getTime())));

        // Update or create cluster record
        let existing = await PatternCluster.findOne({ sharedArea: area });
        if (!existing) {
          existing = new PatternCluster({
            clusterId,
            title: `${area} Transit & Community Sighting Cluster`,
            description: `Automated pattern detector identified ${areaSightings.length} sightings in ${area} across a ${Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 86400))} day timeline.`,
            caseIds: relevantCases.map((c) => c._id),
            sightingIds: areaSightings.map((s) => s._id),
            sharedArea: area,
            dateRange: { start: minDate, end: maxDate },
            relevanceScore: sim.score.totalScore,
            scoreBreakdown: sim.score,
            supportingFactors: sim.supporting,
            conflictingFactors: sim.conflicting,
            limitations: sim.limitations,
            status: 'Suggested',
          });
          await existing.save();
        } else {
          existing.sightingIds = areaSightings.map((s) => s._id);
          existing.caseIds = relevantCases.map((c) => c._id);
          existing.relevanceScore = sim.score.totalScore;
          existing.scoreBreakdown = sim.score;
          existing.supportingFactors = sim.supporting;
          existing.conflictingFactors = sim.conflicting;
          await existing.save();
        }

        // Link cluster ID back to sightings
        for (const s of areaSightings) {
          if (!s.patternClusterIds.includes(existing.clusterId)) {
            s.patternClusterIds.push(existing.clusterId);
            await s.save();
          }
        }

        clustersFound.push(existing);
      }
    }

    return clustersFound;
  }
}
