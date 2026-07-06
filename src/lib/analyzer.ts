import { Listing, AnalysisResult } from './types';

// Text analysis
export function analyzeText(description: string): {
  quality_score: number;
  word_count: number;
  has_structure: boolean;
  keywords: string[];
} {
  if (!description) return { quality_score: 0, word_count: 0, has_structure: false, keywords: [] };
  
  const words = description.split(/\s+/).filter(w => w.length > 0);
  const word_count = words.length;
  
  // Check for structure (bullet points, line breaks, sections)
  const has_structure = /[\n\-•★]/.test(description) || description.split('\n').length > 3;
  
  // Extract keywords (words longer than 3 chars, appearing multiple times)
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const lower = w.toLowerCase().replace(/[^а-яёa-z0-9]/g, '');
    if (lower.length > 3) wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  });
  const keywords = Object.entries(wordFreq)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  // Quality score based on length and structure
  let quality_score = 0;
  if (word_count >= 20) quality_score += 0.3;
  if (word_count >= 50) quality_score += 0.2;
  if (word_count >= 100) quality_score += 0.1;
  if (has_structure) quality_score += 0.2;
  if (keywords.length >= 3) quality_score += 0.2;
  
  return { quality_score: Math.min(quality_score, 1), word_count, has_structure, keywords };
}

// Image analysis
export function analyzeImages(images: string[]): {
  quality_score: number;
  count: number;
  has_variety: boolean;
} {
  const count = images.length;
  let quality_score = 0;
  
  if (count >= 1) quality_score += 0.2;
  if (count >= 3) quality_score += 0.2;
  if (count >= 5) quality_score += 0.2;
  if (count >= 8) quality_score += 0.2;
  if (count >= 12) quality_score += 0.2;
  
  const has_variety = count >= 3;
  
  return { quality_score: Math.min(quality_score, 1), count, has_variety };
}

// Uniqueness check (Jaccard similarity)
export function calculateUniqueness(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 1 : 1 - (intersection.size / union.size);
}

// Overall score calculation
export function calculateOverallScore(params: {
  text_score: number;
  image_score: number;
  uniqueness_score: number;
  price_deviation?: number;
}): number {
  const { text_score, image_score, uniqueness_score, price_deviation = 0 } = params;
  
  let score = 0;
  score += text_score * 3;      // 30% weight
  score += image_score * 3;     // 30% weight
  score += uniqueness_score * 2; // 20% weight
  score += (1 - Math.min(price_deviation, 1)) * 2; // 20% weight
  
  return Math.round((score / 10) * 10 * 10) / 10; // 0-10 scale
}

// Analyze a full listing
export function analyzeListing(listing: Listing, avgPrice?: number): AnalysisResult {
  const textAnalysis = analyzeText(listing.description);
  const imageAnalysis = analyzeImages(listing.images);
  
  const price_deviation = avgPrice 
    ? Math.abs(listing.price - avgPrice) / avgPrice 
    : 0;
  
  const overall_score = calculateOverallScore({
    text_score: textAnalysis.quality_score,
    image_score: imageAnalysis.quality_score,
    uniqueness_score: 0.8, // Default, compare with others later
    price_deviation,
  });
  
  return {
    text_quality_score: textAnalysis.quality_score,
    uniqueness_score: 0.8,
    image_quality_score: imageAnalysis.quality_score,
    overall_score,
    word_count: textAnalysis.word_count,
    has_structure: textAnalysis.has_structure,
    keywords: textAnalysis.keywords,
  };
}
