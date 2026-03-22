import { describe, it, expect } from 'vitest';
import lineageData from '../../src/data/lineage.json';

describe('Lineage data', () => {
  it('should have entries sorted by year', () => {
    for (let i = 1; i < lineageData.length; i++) {
      expect(lineageData[i].year).toBeGreaterThanOrEqual(lineageData[i - 1].year);
    }
  });

  it('should have 15 entries', () => {
    expect(lineageData.length).toBe(15);
  });

  it('should span from 2003 to 2026', () => {
    expect(lineageData[0].year).toBe(2003);
    expect(lineageData[lineageData.length - 1].year).toBe(2026);
  });

  it('each entry should have all required fields', () => {
    for (const entry of lineageData) {
      expect(entry.year).toBeDefined();
      expect(entry.authority).toBeDefined();
      expect(entry.title).toBeDefined();
      expect(entry.description).toBeDefined();
      expect(entry.sddConnection).toBeDefined();
      expect(entry.sourceUrl).toBeDefined();
    }
  });

  it('SDD entry should be the last one', () => {
    const last = lineageData[lineageData.length - 1];
    expect(last.authority).toBe('SDD');
    expect(last.year).toBe(2026);
  });
});
