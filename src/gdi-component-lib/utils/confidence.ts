import type { ConfidenceScore } from '../types';

/**
 * Converts LLM confidence score (1-10) to confidence level.
 * - High: 8-10
 * - Medium: 5-7
 * - Low: 1-4
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export function getConfidenceLabel(score: number): string {
  const level = getConfidenceLevel(score);
  switch (level) {
    case 'high':
      return `High confidence (${score}/10)`;
    case 'medium':
      return `Medium confidence (${score}/10)`;
    case 'low':
      return `Low confidence (${score}/10)`;
  }
}

export function toConfidenceScore(score: number): ConfidenceScore {
  return {
    value: score,
    level: getConfidenceLevel(score),
  };
}

/**
 * Get color for confidence visualization.
 */
export function getConfidenceColor(score: number): string {
  if (score >= 8) return 'success';
  if (score >= 5) return 'warning';
  return 'error';
}
