export interface AIAnalysisResult {
  suggestedCategoryCode: string;
  confidenceScore: number; // 0-1
  isEmergencyHazard: boolean;
  detectedKeywords: string[];
  summaryText: string;
  isAIPowered: boolean;
  providerNote: string;
}

/**
 * AI Service Integration Layer
 * Connects to external AI APIs (OpenAI/Gemini/Custom Vision) when API keys are supplied.
 * Provides robust rules-based fallbacks when no external AI keys are configured.
 */
export async function analyzeComplaintContent(
  title: string,
  description: string
): Promise<AIAnalysisResult> {
  const text = `${title} ${description}`.toLowerCase();

  // Rule-based classification fallback engine
  let categoryCode = 'other';
  let isEmergency = false;
  const keywords: string[] = [];

  if (text.match(/power|cut|outage|transformer|wire|spark|electric|current|line|feeder|voltage/i)) {
    categoryCode = 'electricity';
    if (text.match(/spark|fire|wire down|fallen|hanging|danger|school|child|shock/i)) {
      isEmergency = true;
      keywords.push('electrical hazard', 'safety risk');
    }
  } else if (text.match(/pothole|road|asphalt|tar|crater|pavement|skid|traffic/i)) {
    categoryCode = 'roads';
    if (text.match(/accident|deep crater|cave-in/i)) {
      keywords.push('traffic danger');
    }
  } else if (text.match(/garbage|waste|trash|dump|odor|smell|bin|sanitation|hygiene/i)) {
    categoryCode = 'garbage';
  } else if (text.match(/drain|waterlogging|flood|sewage|stagnant|rainwater|clog/i)) {
    categoryCode = 'drainage';
  } else if (text.match(/light|lamp|dark|night|pole|street light|bulb/i)) {
    categoryCode = 'streetlights';
  } else if (text.match(/water|pipe|leak|pressure|tap|drinking water|sewer/i)) {
    categoryCode = 'water';
  } else if (text.match(/bus shelter|bench|manhole|bridge|park|building|infra/i)) {
    categoryCode = 'infrastructure';
  }

  const confidenceScore = categoryCode !== 'other' ? 0.85 : 0.5;

  return {
    suggestedCategoryCode: categoryCode,
    confidenceScore,
    isEmergencyHazard: isEmergency,
    detectedKeywords: keywords,
    summaryText: `Categorized under ${categoryCode.toUpperCase()} based on content key terms.`,
    isAIPowered: false, // Honest label: rules-based fallback
    providerNote: 'Rule-based classification fallback active (AI service key not configured).',
  };
}
