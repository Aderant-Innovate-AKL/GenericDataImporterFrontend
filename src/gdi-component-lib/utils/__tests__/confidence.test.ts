import { describe, it, expect } from 'vitest';

import {
  getConfidenceLevel,
  getConfidenceLabel,
  toConfidenceScore,
  getConfidenceColor,
} from '../confidence';

describe('confidence utilities', () => {
  it('maps scores (1-10) to levels', () => {
    expect(getConfidenceLevel(9)).toBe('high');
    expect(getConfidenceLevel(8)).toBe('high');
    expect(getConfidenceLevel(7)).toBe('medium');
    expect(getConfidenceLevel(5)).toBe('medium');
    expect(getConfidenceLevel(4)).toBe('low');
    expect(getConfidenceLevel(1)).toBe('low');
  });

  it('produces labels with score', () => {
    expect(getConfidenceLabel(9)).toContain('High confidence');
    expect(getConfidenceLabel(9)).toContain('9/10');
    expect(getConfidenceLabel(6)).toContain('Medium confidence');
    expect(getConfidenceLabel(3)).toContain('Low confidence');
  });

  it('wraps confidence score', () => {
    const score = toConfidenceScore(8);
    expect(score.value).toBe(8);
    expect(score.level).toBe('high');
  });

  it('gets confidence color', () => {
    expect(getConfidenceColor(9)).toBe('success');
    expect(getConfidenceColor(6)).toBe('warning');
    expect(getConfidenceColor(3)).toBe('error');
  });
});
