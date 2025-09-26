import { describe, expect, it } from 'vitest';
import { budgetFit, styleSimilarity } from './match';

describe('styleSimilarity', () => {
  it('boosts when request tags empty', () => {
    const score = styleSimilarity(['minimal', 'tech'], []);
    expect(score).toBeGreaterThan(0.39);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns perfect match when tags identical', () => {
    const score = styleSimilarity(['minimal', 'tech'], ['minimal', 'tech']);
    expect(score).toBeCloseTo(1, 5);
  });
});

describe('budgetFit', () => {
  it('is full score within range', () => {
    expect(budgetFit(10000, 8000, 12000)).toBe(1);
  });

  it('decays to zero 40 percent below', () => {
    expect(budgetFit(4800, 8000, 12000)).toBeCloseTo(0, 5);
  });

  it('decays when above range', () => {
    expect(budgetFit(16000, 8000, 12000)).toBeLessThan(0.4);
  });
});
