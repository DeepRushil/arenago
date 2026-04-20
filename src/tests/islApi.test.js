/**
 * Test Suite 1 – islApi.js
 * Covers the ISL matches API service (mocked network).
 */
import { describe, it, expect } from 'vitest';
import { getISLMatches } from '../services/islApi';

describe('islApi – getISLMatches()', () => {
  it('TEST 01 – resolves to an array', async () => {
    const matches = await getISLMatches();
    expect(Array.isArray(matches)).toBe(true);
  });

  it('TEST 02 – returns exactly 3 matches', async () => {
    const matches = await getISLMatches();
    expect(matches).toHaveLength(3);
  });

  it('TEST 03 – each match has required fields', async () => {
    const matches = await getISLMatches();
    matches.forEach((m) => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('status');
      expect(m).toHaveProperty('team1');
      expect(m).toHaveProperty('team2');
      expect(m).toHaveProperty('venue');
    });
  });

  it('TEST 04 – match statuses are valid enum values', async () => {
    const validStatuses = ['FT', 'LIVE', 'UPCOMING'];
    const matches = await getISLMatches();
    matches.forEach((m) => {
      expect(validStatuses).toContain(m.status);
    });
  });

  it('TEST 05 – live match has a numeric time (match minute)', async () => {
    const matches = await getISLMatches();
    const live = matches.find((m) => m.status === 'LIVE');
    expect(live).toBeDefined();
    // time is stored as "68:12" – assert it looks like mm:ss
    expect(live.time).toMatch(/^\d+:\d{2}$/);
  });

  it('TEST 06 – scores are non-negative numbers', async () => {
    const matches = await getISLMatches();
    matches.forEach((m) => {
      expect(typeof m.score1).toBe('number');
      expect(typeof m.score2).toBe('number');
      expect(m.score1).toBeGreaterThanOrEqual(0);
      expect(m.score2).toBeGreaterThanOrEqual(0);
    });
  });
});
