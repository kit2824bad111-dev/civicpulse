export interface DuplicateCandidate {
  id: string;
  refNumber?: string;
  title: string;
  locationName: string;
  createdAt: Date;
  categoryCode: string;
  affectedCount: number;
  matchScore: number; // 0 to 100
  matchReason: string;
  isOutage: boolean;
}

export function calculateDuplicateScore(
  newComplaint: {
    title: string;
    description: string;
    locationName: string;
    categoryCode: string;
    createdAt?: Date;
  },
  existingComplaint: {
    id: string;
    refNumber?: string;
    title: string;
    description: string;
    locationName: string;
    categoryCode: string;
    createdAt: Date;
    affectedCount: number;
    isOutage?: boolean;
  }
): { matchScore: number; matchReason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category check
  if (newComplaint.categoryCode.toLowerCase() === existingComplaint.categoryCode.toLowerCase()) {
    score += 35;
    reasons.push('Matching category');
  } else {
    // If categories don't match, unlikely duplicate
    return { matchScore: 0, matchReason: 'Different categories' };
  }

  // 2. Location matching (normalized area / street comparison)
  const loc1 = newComplaint.locationName.trim().toLowerCase();
  const loc2 = existingComplaint.locationName.trim().toLowerCase();
  if (loc1 === loc2) {
    score += 35;
    reasons.push('Identical locality');
  } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
    score += 25;
    reasons.push('Overlapping location area');
  }

  // 3. Time proximity check (within 6 hours)
  const time1 = newComplaint.createdAt ? new Date(newComplaint.createdAt).getTime() : Date.now();
  const time2 = new Date(existingComplaint.createdAt).getTime();
  const diffHours = Math.abs(time1 - time2) / (1000 * 60 * 60);

  if (diffHours <= 2) {
    score += 20;
    reasons.push('Submitted within 2 hours of each other');
  } else if (diffHours <= 6) {
    score += 10;
    reasons.push('Submitted within 6 hours');
  }

  // 4. Keyword similarity in title/description
  const words1 = `${newComplaint.title} ${newComplaint.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = `${existingComplaint.title} ${existingComplaint.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const commonWords = words1.filter(w => words2.includes(w));

  if (commonWords.length >= 3) {
    score += 10;
    reasons.push(`Shared key terms (${commonWords.slice(0, 3).join(', ')})`);
  }

  return {
    matchScore: Math.min(100, score),
    matchReason: reasons.join(' • '),
  };
}
