import { describe, it, expect } from 'vitest';
import {
  createWalkthroughState,
  resolveGap,
  selectGap,
  canAdvancePass,
  advancePass,
  getProgress,
  isConverged,
} from '../../src/components/walkthrough-state';
import walkthroughData from '../../src/data/walkthrough.json';
import type { WalkthroughData } from '../../src/data/walkthrough.types';

const data = walkthroughData as WalkthroughData;

describe('Walkthrough State Machine', () => {
  describe('createWalkthroughState', () => {
    it('should initialize with Pass 1 active and 18 unresolved gaps', () => {
      const state = createWalkthroughState(data);
      expect(state.activePass).toBe(1);
      expect(state.resolvedGapIds).toEqual(new Set());
      expect(state.selectedGapId).toBeNull();
      const progress = getProgress(state);
      expect(progress.total).toBe(18);
      expect(progress.resolved).toBe(0);
    });
  });

  describe('resolveGap', () => {
    it('should decrement unresolved count when a gap is resolved', () => {
      let state = createWalkthroughState(data);
      state = resolveGap(state, 'SG-01');
      const progress = getProgress(state);
      expect(progress.resolved).toBe(1);
      expect(progress.total).toBe(18);
    });

    it('should be a no-op when resolving an already-resolved gap', () => {
      let state = createWalkthroughState(data);
      state = resolveGap(state, 'SG-01');
      const stateBefore = state;
      state = resolveGap(state, 'SG-01');
      expect(state).toEqual(stateBefore);
    });

    it('should ignore gaps from a different pass than active', () => {
      let state = createWalkthroughState(data);
      state = resolveGap(state, 'SG-P2-01'); // Pass 2 gap while in Pass 1
      const progress = getProgress(state);
      expect(progress.resolved).toBe(0);
    });
  });

  describe('selectGap', () => {
    it('should set the selected gap ID', () => {
      let state = createWalkthroughState(data);
      state = selectGap(state, 'SG-01');
      expect(state.selectedGapId).toBe('SG-01');
    });

    it('should return the gap data for the selected gap', () => {
      let state = createWalkthroughState(data);
      state = selectGap(state, 'SG-01');
      const gap = data.passes[0].gaps.find((g) => g.id === 'SG-01');
      expect(gap).toBeDefined();
      expect(gap!.title).toBe('Appointment aggregate has zero invariants');
    });

    it('should clear selection when null is passed', () => {
      let state = createWalkthroughState(data);
      state = selectGap(state, 'SG-01');
      state = selectGap(state, null);
      expect(state.selectedGapId).toBeNull();
    });
  });

  describe('canAdvancePass', () => {
    it('should return false when not all gaps are resolved', () => {
      const state = createWalkthroughState(data);
      expect(canAdvancePass(state)).toBe(false);
    });

    it('should return true when all gaps in active pass are resolved', () => {
      let state = createWalkthroughState(data);
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      expect(canAdvancePass(state)).toBe(true);
    });

    it('should return false on Pass 3 (no next pass)', () => {
      let state = createWalkthroughState(data);
      // Resolve all Pass 1
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      // Resolve all Pass 2
      for (const gap of data.passes[1].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      // Pass 3 — converged, no next pass
      expect(canAdvancePass(state)).toBe(false);
    });
  });

  describe('advancePass', () => {
    it('should move to Pass 2 after all Pass 1 gaps resolved', () => {
      let state = createWalkthroughState(data);
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      expect(state.activePass).toBe(2);
      const progress = getProgress(state);
      expect(progress.total).toBe(5);
      expect(progress.resolved).toBe(0);
    });

    it('should return same state if gaps are not all resolved', () => {
      let state = createWalkthroughState(data);
      const before = state;
      state = advancePass(state);
      expect(state).toEqual(before);
    });

    it('should move to Pass 3 after all Pass 2 gaps resolved', () => {
      let state = createWalkthroughState(data);
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      for (const gap of data.passes[1].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      expect(state.activePass).toBe(3);
    });
  });

  describe('getProgress', () => {
    it('should return 0% initially', () => {
      const state = createWalkthroughState(data);
      const progress = getProgress(state);
      expect(progress.percentage).toBe(0);
    });

    it('should track percentage correctly', () => {
      let state = createWalkthroughState(data);
      state = resolveGap(state, 'SG-01');
      const progress = getProgress(state);
      expect(progress.percentage).toBeCloseTo(100 / 18, 1);
    });

    it('should return 100% when all gaps in pass are resolved', () => {
      let state = createWalkthroughState(data);
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      const progress = getProgress(state);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('isConverged', () => {
    it('should return false during Pass 1', () => {
      const state = createWalkthroughState(data);
      expect(isConverged(state)).toBe(false);
    });

    it('should return true on Pass 3', () => {
      let state = createWalkthroughState(data);
      for (const gap of data.passes[0].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      for (const gap of data.passes[1].gaps) {
        state = resolveGap(state, gap.id);
      }
      state = advancePass(state);
      expect(isConverged(state)).toBe(true);
    });
  });

  describe('modification flags', () => {
    it('SG-03 should have modification flag', () => {
      const gap = data.passes[0].gaps.find((g) => g.id === 'SG-03');
      expect(gap?.resolution.hasModification).toBe(true);
    });

    it('SG-05 should have modification flag', () => {
      const gap = data.passes[0].gaps.find((g) => g.id === 'SG-05');
      expect(gap?.resolution.hasModification).toBe(true);
    });

    it('SG-01 should not have modification flag', () => {
      const gap = data.passes[0].gaps.find((g) => g.id === 'SG-01');
      expect(gap?.resolution.hasModification).toBeUndefined();
    });
  });
});
