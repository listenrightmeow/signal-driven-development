import { useState, useCallback } from 'preact/hooks';
import {
  createWalkthroughState,
  resolveGap,
  selectGap,
  canAdvancePass,
  advancePass,
  getProgress,
  isConverged,
} from './walkthrough-state';
import type { WalkthroughData, Gap } from '../data/walkthrough.types';
import walkthroughData from '../data/walkthrough.json';

const data = walkthroughData as WalkthroughData;

const CATEGORY_LABELS: Record<string, string> = {
  SG: 'Structural',
  HG: 'Heuristic',
  LG: 'Language',
  DG: 'Decision',
};

export default function Walkthrough({ initialGapId }: { initialGapId?: string }) {
  const [state, setState] = useState(() => {
    const s = createWalkthroughState(data);
    return initialGapId ? selectGap(s, initialGapId) : s;
  });

  const progress = getProgress(state);
  const converged = isConverged(state);
  const canAdvance = canAdvancePass(state);
  const activePassData = data.passes.find((p) => p.number === state.activePass);
  const selectedGap = activePassData?.gaps.find((g) => g.id === state.selectedGapId);

  const handleResolve = useCallback((gapId: string) => {
    setState((prev) => {
      const next = resolveGap(prev, gapId);
      // Auto-select next unresolved gap
      const passData = data.passes.find((p) => p.number === next.activePass);
      const nextUnresolved = passData?.gaps.find((g) => !next.resolvedGapIds.has(g.id));
      return nextUnresolved ? selectGap(next, nextUnresolved.id) : next;
    });
  }, []);

  const handleAdvance = useCallback(() => {
    setState((prev) => advancePass(prev));
  }, []);

  const handleSelectGap = useCallback((gapId: string) => {
    setState((prev) => selectGap(prev, gapId));
  }, []);

  const handleSelectPass = useCallback(
    (passNumber: number) => {
      if (passNumber > state.activePass) return;
      setState((prev) => ({ ...prev, activePass: passNumber, selectedGapId: null }));
    },
    [state.activePass],
  );

  return (
    <div className="walkthrough">
      {/* Pass tabs */}
      <div className="walkthrough__tabs" role="tablist" aria-label="Convergence passes">
        {data.passes.map((pass) => {
          const isActive = pass.number === state.activePass;
          const isLocked = pass.number > state.activePass;
          const passGapCount = pass.gaps.length;
          const resolvedInPass = pass.gaps.filter((g) => state.resolvedGapIds.has(g.id)).length;
          return (
            <button
              key={pass.number}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isLocked}
              className={`walkthrough__tab ${isActive ? 'walkthrough__tab--active' : ''} ${isLocked ? 'walkthrough__tab--locked' : ''}`}
              onClick={() => handleSelectPass(pass.number)}
              disabled={isLocked}
            >
              Pass {pass.number}
              <span className="walkthrough__tab-badge">
                {pass.number <= state.activePass
                  ? `${passGapCount - resolvedInPass}/${passGapCount}`
                  : passGapCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="walkthrough__progress">
        <div className="walkthrough__counter" aria-live="polite" aria-atomic="true">
          {converged
            ? 'Converged. Zero unresolved gaps.'
            : `${progress.total - progress.resolved} gap${progress.total - progress.resolved !== 1 ? 's' : ''} remaining`}
        </div>
        {!converged && (
          <div
            className="walkthrough__progress-bar"
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="walkthrough__progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      {converged ? (
        <ConvergenceState convergence={data.convergence} />
      ) : (
        <div className="walkthrough__panels">
          {/* Left: gap list */}
          <div className="walkthrough__gap-list" role="list" aria-label="Gaps in current pass">
            {activePassData?.gaps.map((gap) => {
              const isResolved = state.resolvedGapIds.has(gap.id);
              const isSelected = gap.id === state.selectedGapId;
              return (
                <button
                  key={gap.id}
                  role="listitem"
                  className={`walkthrough__gap-item ${isResolved ? 'walkthrough__gap-item--resolved' : ''} ${isSelected ? 'walkthrough__gap-item--selected' : ''}`}
                  onClick={() => handleSelectGap(gap.id)}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <span
                    className={`badge badge--${gap.severity === 'error' ? 'error' : 'warning'}`}
                  >
                    {gap.severity === 'error' ? 'Error' : 'Warning'}
                  </span>
                  <span className="walkthrough__gap-id">{gap.id}</span>
                  <span className="walkthrough__gap-title">{gap.title}</span>
                  {isResolved && (
                    <span className="walkthrough__resolved-check" aria-label="Resolved">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: gap detail */}
          <div className="walkthrough__detail" aria-label="Gap detail">
            {selectedGap ? (
              <GapDetail
                gap={selectedGap}
                isResolved={state.resolvedGapIds.has(selectedGap.id)}
                onResolve={handleResolve}
              />
            ) : (
              <div className="walkthrough__detail-empty">Select a gap to view its details.</div>
            )}
          </div>
        </div>
      )}

      {/* Advance button */}
      {canAdvance && (
        <div className="walkthrough__advance">
          <button className="btn btn--primary" onClick={handleAdvance}>
            Continue to Pass {state.activePass + 1} →
          </button>
        </div>
      )}
    </div>
  );
}

function GapDetail({
  gap,
  isResolved,
  onResolve,
}: {
  gap: Gap;
  isResolved: boolean;
  onResolve: (id: string) => void;
}) {
  return (
    <div className="gap-detail">
      <div className="gap-detail__header">
        <span className={`badge badge--${gap.severity === 'error' ? 'error' : 'warning'}`}>
          {gap.severity === 'error' ? 'Error' : 'Warning'}
        </span>
        <span className="gap-detail__category">{CATEGORY_LABELS[gap.category]} Gap</span>
      </div>
      <h3 className="gap-detail__title">
        <span className="gap-detail__id">{gap.id}</span>: {gap.title}
      </h3>
      <blockquote className="gap-detail__rule">{gap.rule}</blockquote>
      <p className="gap-detail__element">
        <strong>Element:</strong> {gap.element}
      </p>
      <div className="gap-detail__analysis">
        <h4>Analysis</h4>
        <p>{gap.analysis}</p>
      </div>
      <div className="gap-detail__recommendation">
        <h4>Recommendation</h4>
        <p>{gap.recommendation}</p>
      </div>

      {isResolved ? (
        <div className="gap-detail__resolution">
          <h4>Resolution</h4>
          {gap.resolution.hasModification && (
            <span className="badge badge--warning">Accepted with modification</span>
          )}
          <p>{gap.resolution.summary}</p>
          <p className="gap-detail__impact">
            <strong>Structural impact:</strong> {gap.resolution.structuralImpact}
          </p>
        </div>
      ) : (
        <div className="gap-detail__actions">
          <button
            className="btn btn--primary walkthrough__resolve-btn"
            onClick={() => onResolve(gap.id)}
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}

function ConvergenceState({ convergence }: { convergence: WalkthroughData['convergence'] }) {
  return (
    <div className="walkthrough__converged">
      <div className="walkthrough__converged-icon" aria-hidden="true">
        ●
      </div>
      <h2>Converged. Zero unresolved gaps.</h2>
      <p>The domain model is implementation-ready.</p>
      <div className="walkthrough__growth">
        <h3>Model Growth</h3>
        <div className="walkthrough__growth-grid">
          <GrowthStat
            label="Invariants"
            start={convergence.invariantGrowth.start}
            end={convergence.invariantGrowth.end}
          />
          <GrowthStat
            label="Sagas"
            start={convergence.sagaGrowth.start}
            end={convergence.sagaGrowth.end}
          />
          <GrowthStat
            label="Aggregates"
            start={convergence.aggregateGrowth.start}
            end={convergence.aggregateGrowth.end}
          />
          <GrowthStat
            label="Commands"
            start={convergence.commandGrowth.start}
            end={convergence.commandGrowth.end}
          />
          <GrowthStat
            label="Events"
            start={convergence.eventGrowth.start}
            end={convergence.eventGrowth.end}
          />
        </div>
      </div>
      <a href="/get-started" className="btn btn--primary">
        Run this on your own domain →
      </a>
    </div>
  );
}

function GrowthStat({ label, start, end }: { label: string; start: number; end: number }) {
  return (
    <div className="growth-stat">
      <span className="growth-stat__value">
        {start} → {end}
      </span>
      <span className="growth-stat__label">{label}</span>
    </div>
  );
}
