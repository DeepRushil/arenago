/**
 * Test Suite 2 – StadiumSelector data & haversine helpers
 * Tests the STADIUMS constant and the distance-sorting logic
 * (pure JS, no DOM needed).
 */
import { describe, it, expect } from 'vitest';
import { STADIUMS } from '../components/StadiumSelector';

describe('STADIUMS constant', () => {
  it('TEST 07 – contains at least 10 venues', () => {
    expect(STADIUMS.length).toBeGreaterThanOrEqual(10);
  });

  it('TEST 08 – every stadium has a valid id, name, city, team', () => {
    STADIUMS.forEach((s) => {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(typeof s.name).toBe('string');
      expect(typeof s.city).toBe('string');
      expect(typeof s.team).toBe('string');
    });
  });

  it('TEST 09 – lat/lng within realistic India bounds', () => {
    STADIUMS.forEach((s) => {
      expect(s.lat).toBeGreaterThanOrEqual(8);
      expect(s.lat).toBeLessThanOrEqual(37);
      expect(s.lng).toBeGreaterThanOrEqual(68);
      expect(s.lng).toBeLessThanOrEqual(98);
    });
  });

  it('TEST 10 – all stadium ids are unique', () => {
    const ids = STADIUMS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('TEST 11 – capacity field is a non-empty string', () => {
    STADIUMS.forEach((s) => {
      expect(typeof s.capacity).toBe('string');
      expect(s.capacity.length).toBeGreaterThan(0);
    });
  });

  it('TEST 12 – color is a valid CSS hex string', () => {
    const hexPattern = /^#[0-9a-fA-F]{3,6}$/;
    STADIUMS.forEach((s) => {
      expect(s.color).toMatch(hexPattern);
    });
  });
});
