import type { WalkthroughData } from '../data/walkthrough.types';

export interface WalkthroughState {
  data: WalkthroughData;
  activePass: number;
  resolvedGapIds: Set<string>;
  selectedGapId: string | null;
}

export function createWalkthroughState(data: WalkthroughData): WalkthroughState {
  return {
    data,
    activePass: 1,
    resolvedGapIds: new Set(),
    selectedGapId: null,
  };
}

export function resolveGap(state: WalkthroughState, gapId: string): WalkthroughState {
  if (state.resolvedGapIds.has(gapId)) return state;

  const activePassData = state.data.passes.find((p) => p.number === state.activePass);
  if (!activePassData) return state;

  const gapExists = activePassData.gaps.some((g) => g.id === gapId);
  if (!gapExists) return state;

  const newResolved = new Set(state.resolvedGapIds);
  newResolved.add(gapId);

  return { ...state, resolvedGapIds: newResolved };
}

export function selectGap(state: WalkthroughState, gapId: string | null): WalkthroughState {
  return { ...state, selectedGapId: gapId };
}

export function canAdvancePass(state: WalkthroughState): boolean {
  const activePassData = state.data.passes.find((p) => p.number === state.activePass);
  if (!activePassData) return false;
  if (activePassData.gaps.length === 0) return false;

  const nextPass = state.data.passes.find((p) => p.number === state.activePass + 1);
  if (!nextPass) return false;

  return activePassData.gaps.every((g) => state.resolvedGapIds.has(g.id));
}

export function advancePass(state: WalkthroughState): WalkthroughState {
  if (!canAdvancePass(state)) return state;
  return { ...state, activePass: state.activePass + 1, selectedGapId: null };
}

export function getProgress(state: WalkthroughState): {
  resolved: number;
  total: number;
  percentage: number;
} {
  const activePassData = state.data.passes.find((p) => p.number === state.activePass);
  if (!activePassData) return { resolved: 0, total: 0, percentage: 0 };

  const total = activePassData.gaps.length;
  const resolved = activePassData.gaps.filter((g) => state.resolvedGapIds.has(g.id)).length;
  const percentage = total === 0 ? 100 : (resolved / total) * 100;

  return { resolved, total, percentage };
}

export function isConverged(state: WalkthroughState): boolean {
  const activePassData = state.data.passes.find((p) => p.number === state.activePass);
  if (!activePassData) return false;
  return activePassData.gaps.length === 0;
}
