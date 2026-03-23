import { useState, useCallback, useRef, useMemo, useEffect } from 'preact/hooks';
import lineageData from '../data/lineage.json';

interface TimelineEntry {
  year: number;
  authority: string;
  initials: string;
  title: string;
  description: string;
  sddConnection: string;
  sourceUrl: string;
  sourceType: string;
  concepts: string[];
  track: number;
  influences: number[];
}

const entries = lineageData as TimelineEntry[];

const TRACK_COLORS = [
  'var(--accent)', // Evans
  '#6366F1', // Young
  '#EC4899', // Vernon
  '#F97316', // Brandolini
  '#14B8A6', // Tune
  '#8B5CF6', // Baas-Schwegler
  '#EF4444', // Khononov
  '#EAB308', // NDD
  '#06B6D4', // DDD Europe
  'var(--gap-success)', // SDD
];

const SOURCE_TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  talk: 'Talk',
  workshop: 'Workshop',
  tool: 'Tool',
  pattern: 'Pattern',
  methodology: 'Methodology',
};

// Timeline dimensions
const MIN_YEAR = 2003;
const MAX_YEAR = 2026;
const YEAR_RANGE = MAX_YEAR - MIN_YEAR;
const getX = (year: number) => ((year - MIN_YEAR) / YEAR_RANGE) * 920 + 40;
const getY = (track: number) => 30 + (track % 6) * 22;

// Era definitions
const ERAS = [
  { label: 'Foundations', startYear: 2003, endYear: 2013 },
  { label: 'Tooling', startYear: 2015, endYear: 2021 },
  { label: 'AI Convergence', startYear: 2024, endYear: 2026 },
];

// Unique authorities for legend
const AUTHORITIES = (() => {
  const seen = new Map<string, { color: string; track: number }>();
  entries.forEach((e) => {
    if (!seen.has(e.authority)) {
      seen.set(e.authority, {
        color: TRACK_COLORS[e.track] || 'var(--text-tertiary)',
        track: e.track,
      });
    }
  });
  return Array.from(seen.entries()).map(([name, { color, track }]) => ({
    name,
    color,
    track,
  }));
})();

export default function LineageTimeline() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [filterAuthority, setFilterAuthority] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger stagger animations after mount
    const raf = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleNodeClick = useCallback(
    (e: MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      handleSelect(index);
    },
    [handleSelect],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(index);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    },
    [handleSelect],
  );

  const handleLegendClick = useCallback((authority: string) => {
    setFilterAuthority((prev) => (prev === authority ? null : authority));
  }, []);

  const selected = selectedIndex !== null ? entries[selectedIndex] : null;
  const selectedColor =
    selectedIndex !== null
      ? TRACK_COLORS[entries[selectedIndex].track] || 'var(--text-tertiary)'
      : '';

  // Compute track connection lines
  const trackLines = useMemo(() => {
    const authorityNodes: Record<string, { x: number; y: number; color: string }[]> = {};
    entries.forEach((entry) => {
      const key = entry.authority;
      if (!authorityNodes[key]) authorityNodes[key] = [];
      authorityNodes[key].push({
        x: getX(entry.year),
        y: getY(entry.track),
        color: TRACK_COLORS[entry.track] || 'var(--text-tertiary)',
      });
    });
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    Object.values(authorityNodes).forEach((nodes) => {
      if (nodes.length < 2) return;
      for (let i = 0; i < nodes.length - 1; i++) {
        lines.push({
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 1].x,
          y2: nodes[i + 1].y,
          color: nodes[i].color,
        });
      }
    });
    return lines;
  }, []);

  // Compute relationship arcs for selected node
  const relationshipArcs = useMemo(() => {
    if (selectedIndex === null) return [];
    const arcs: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      color: string;
      opacity: number;
      direction: 'outgoing' | 'incoming';
    }[] = [];
    const sel = entries[selectedIndex];
    const selX = getX(sel.year);
    const selY = getY(sel.track);
    const selColor = TRACK_COLORS[sel.track] || 'var(--text-tertiary)';

    // Outgoing: nodes this one influences
    sel.influences.forEach((targetIdx) => {
      if (targetIdx >= 0 && targetIdx < entries.length) {
        const target = entries[targetIdx];
        arcs.push({
          fromX: selX,
          fromY: selY,
          toX: getX(target.year),
          toY: getY(target.track),
          color: selColor,
          opacity: 0.35,
          direction: 'outgoing',
        });
      }
    });

    // Incoming: nodes that influence this one
    entries.forEach((entry, i) => {
      if (i !== selectedIndex && entry.influences.includes(selectedIndex)) {
        arcs.push({
          fromX: getX(entry.year),
          fromY: getY(entry.track),
          toX: selX,
          toY: selY,
          color: TRACK_COLORS[entry.track] || 'var(--text-tertiary)',
          opacity: 0.2,
          direction: 'incoming',
        });
      }
    });

    return arcs;
  }, [selectedIndex]);

  // Related node indices (for highlight)
  const relatedIndices = useMemo(() => {
    if (selectedIndex === null) return new Set<number>();
    const set = new Set<number>();
    const sel = entries[selectedIndex];
    sel.influences.forEach((i) => set.add(i));
    entries.forEach((entry, i) => {
      if (entry.influences.includes(selectedIndex)) set.add(i);
    });
    return set;
  }, [selectedIndex]);

  // Convergence zone x positions
  const convStartX = getX(2024);
  const convEndX = getX(2026);

  return (
    <>
      <style>{`
        .lineage {
          margin-top: var(--space-6);
        }
        .lineage__timeline {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: var(--space-2) 0;
        }
        .lineage__svg {
          min-width: 800px;
          width: 100%;
          height: auto;
        }

        /* --- Node animations --- */
        @keyframes nodeEnter {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes connectorDrop {
          from { stroke-dashoffset: 160; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes trackLineDraw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes arcDraw {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes selectBounce {
          0% { transform: scale(1); }
          35% { transform: scale(1.18); }
          65% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes sddPulse {
          0%, 100% { filter: drop-shadow(0 0 4px var(--gap-success)); }
          50% { filter: drop-shadow(0 0 14px var(--gap-success)); }
        }
        @keyframes convergenceGlow {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }

        .lineage__node {
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          opacity: 0;
        }
        .lineage__node--loaded {
          animation: nodeEnter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .lineage__node:hover {
          opacity: 1 !important;
        }
        .lineage__node:focus {
          outline: none;
        }
        .lineage__node:focus-visible circle:first-of-type {
          stroke: var(--accent);
          stroke-width: 2;
        }
        .lineage__node text {
          pointer-events: none;
        }

        /* Hover glow ring */
        .lineage__hover-glow {
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
        }
        .lineage__node:hover .lineage__hover-glow {
          opacity: 0.25;
        }

        /* Hover scale on main circle */
        .lineage__node-circle {
          transition: transform 150ms ease;
          transform-origin: center;
          transform-box: fill-box;
        }
        .lineage__node:hover .lineage__node-circle {
          transform: scale(1.3);
        }

        /* Selected bounce */
        .lineage__node--selected .lineage__node-circle {
          animation: selectBounce 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .lineage__node-pulse {
          animation: sddPulse 2.5s ease-in-out infinite;
        }

        /* Connector lines */
        .lineage__connector {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
        }
        .lineage__connector--loaded {
          animation: connectorDrop 500ms ease-out forwards;
        }

        /* Track lines */
        .lineage__track-line {
          stroke-dasharray: 4 3;
          opacity: 0;
        }
        .lineage__track-line--loaded {
          animation: trackLineDraw 800ms ease-out forwards;
          stroke-dasharray: 4 3;
          opacity: 0.2;
        }

        /* Relationship arcs */
        .lineage__arc {
          fill: none;
          stroke-width: 1.5;
          stroke-dasharray: 600;
          animation: arcDraw 500ms ease-out forwards;
        }

        /* Hover label + tooltip */
        .lineage__hover-label {
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
        }
        .lineage__node:hover .lineage__hover-label {
          opacity: 1;
        }
        .lineage__tooltip-group {
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
        }
        .lineage__node:hover .lineage__tooltip-group {
          opacity: 1;
        }

        /* Authority filter dimming */
        .lineage__node--dimmed {
          opacity: 0.12 !important;
        }
        .lineage__track-line--dimmed {
          opacity: 0.05 !important;
        }

        /* Convergence zone */
        .lineage__convergence-zone {
          animation: convergenceGlow 4s ease-in-out infinite;
        }

        /* --- Legend --- */
        .lineage__legend {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2) var(--space-4);
          margin-top: var(--space-4);
          padding: 0;
        }
        .lineage__legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm, 4px);
          border: 1px solid transparent;
          transition: all 150ms ease;
          user-select: none;
        }
        .lineage__legend-item:hover {
          color: var(--text-secondary);
          background: color-mix(in srgb, var(--text-tertiary) 8%, transparent);
        }
        .lineage__legend-item--active {
          color: var(--text-primary);
          border-color: var(--border);
          background: color-mix(in srgb, var(--text-tertiary) 12%, transparent);
        }
        .lineage__legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* --- Detail card --- */
        .lineage__detail {
          margin-top: var(--space-6);
          width: 100%;
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
        }
        .lineage__detail-track-bar {
          height: 3px;
          width: 100%;
        }
        .lineage__detail-body {
          padding: var(--space-5, 1.25rem) var(--space-6, 1.5rem);
        }
        .lineage__detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .lineage__detail-meta {
          flex: 1;
          min-width: 0;
        }
        .lineage__detail-year {
          font-family: var(--font-mono);
          font-size: var(--text-xl, 1.25rem);
          color: var(--accent);
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
        .lineage__detail-authority {
          font-size: var(--text-base, 1rem);
          color: var(--text-secondary);
          margin: var(--space-1, 0.25rem) 0 0 0;
          line-height: 1.4;
        }
        .lineage__detail-title {
          font-size: var(--text-lg);
          margin: var(--space-2, 0.5rem) 0 0 0;
          line-height: 1.3;
        }
        .lineage__detail-source-badge {
          font-size: var(--text-xs, 0.6875rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
          border-radius: var(--radius-sm, 4px);
          background: color-mix(in srgb, var(--text-tertiary) 15%, transparent);
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .lineage__detail-desc {
          color: var(--text-secondary);
          line-height: 1.7;
          margin: var(--space-4, 1rem) 0 0 0;
        }
        .lineage__detail-connection {
          margin-top: var(--space-4, 1rem);
          padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
          border-left: 3px solid var(--accent);
          background: color-mix(in srgb, var(--accent) 5%, transparent);
          border-radius: 0 var(--radius-sm, 4px) var(--radius-sm, 4px) 0;
          line-height: 1.6;
        }
        .lineage__detail-connection-label {
          font-size: var(--text-sm, 0.75rem);
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 var(--space-2, 0.5rem) 0;
        }
        .lineage__detail-connection-text {
          color: var(--text-secondary);
          font-size: var(--text-base, 0.9375rem);
          margin: 0;
        }
        .lineage__detail-relationships {
          margin-top: var(--space-4, 1rem);
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        .lineage__detail-rel-label {
          font-size: var(--text-xs, 0.6875rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-tertiary);
          width: 100%;
        }
        .lineage__detail-rel-chip {
          font-size: var(--text-xs, 0.6875rem);
          padding: 2px var(--space-2, 0.5rem);
          border-radius: var(--radius-sm, 4px);
          border: 1px solid;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .lineage__detail-rel-chip:hover {
          filter: brightness(1.2);
        }
        .lineage__detail-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-3, 0.75rem);
          margin-top: var(--space-4, 1rem);
        }
        .lineage__detail-concepts {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2, 0.5rem);
        }
        .lineage__detail-concept {
          font-size: var(--text-xs, 0.6875rem);
          padding: 2px var(--space-2, 0.5rem);
          border-radius: var(--radius-sm, 4px);
          background: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
          color: var(--text-secondary);
        }
        .lineage__detail-link {
          font-size: var(--text-sm);
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .lineage__node {
            opacity: 1 !important;
            animation: none !important;
          }
          .lineage__node--loaded {
            animation: none !important;
            opacity: 1 !important;
          }
          .lineage__connector {
            stroke-dashoffset: 0 !important;
            animation: none !important;
          }
          .lineage__connector--loaded {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .lineage__track-line--loaded {
            animation: none !important;
            opacity: 0.2;
          }
          .lineage__arc {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .lineage__node-pulse {
            animation: none !important;
            filter: drop-shadow(0 0 6px var(--gap-success));
          }
          .lineage__node--selected .lineage__node-circle {
            animation: none !important;
          }
          .lineage__convergence-zone {
            animation: none !important;
            opacity: 0.05;
          }
          .lineage__node-circle {
            transition: none !important;
          }
          .lineage__hover-glow {
            transition: none !important;
          }
        }
      `}</style>
      <div className="lineage" ref={containerRef}>
        <div className="lineage__timeline" role="list" aria-label="DDD lineage timeline">
          <svg viewBox="0 0 1000 200" className="lineage__svg" focusable="false" role="img">
            <title>DDD Lineage Timeline</title>
            <desc>
              Interactive timeline from 2003 to 2026 showing the intellectual lineage of
              Domain-Driven Design and how Signal-Driven Development builds on each contribution.
            </desc>

            <defs>
              {/* Gradient axis line */}
              <linearGradient id="axisGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--border)" />
                <stop offset="80%" stopColor="var(--border)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
              {/* Convergence zone gradient */}
              <linearGradient id="convergenceGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Convergence zone highlight */}
            <rect
              x={convStartX - 10}
              y={0}
              width={convEndX - convStartX + 20}
              height={200}
              fill="url(#convergenceGrad)"
              className="lineage__convergence-zone"
              rx="4"
            />

            {/* Era labels */}
            {ERAS.map((era) => {
              const cx = (getX(era.startYear) + getX(era.endYear)) / 2;
              return (
                <text
                  key={era.label}
                  x={cx}
                  y={163}
                  textAnchor="middle"
                  fill="var(--text-tertiary)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  opacity="0.4"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {era.label}
                </text>
              );
            })}

            {/* Track connection lines */}
            {trackLines.map((line, i) => {
              const isDimmed =
                filterAuthority !== null &&
                !entries.some(
                  (e) => e.authority === filterAuthority && TRACK_COLORS[e.track] === line.color,
                );
              return (
                <line
                  key={`track-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.color}
                  strokeWidth="1"
                  className={`lineage__track-line ${loaded ? 'lineage__track-line--loaded' : ''} ${isDimmed ? 'lineage__track-line--dimmed' : ''}`}
                />
              );
            })}

            {/* Year axis */}
            {[2003, 2006, 2010, 2013, 2015, 2018, 2021, 2024, 2026].map((year) => {
              const x = getX(year);
              return (
                <g key={year}>
                  <line x1={x} y1={170} x2={x} y2={180} stroke="var(--border)" strokeWidth="1" />
                  <text
                    x={x}
                    y={195}
                    textAnchor="middle"
                    fill="var(--text-tertiary)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {year}
                  </text>
                </g>
              );
            })}

            {/* Gradient axis line */}
            <line x1="40" y1="175" x2="960" y2="175" stroke="url(#axisGradient)" strokeWidth="1" />

            {/* Relationship arcs (on selection) */}
            {relationshipArcs.map((arc, i) => {
              const midX = (arc.fromX + arc.toX) / 2;
              const dist = Math.abs(arc.toX - arc.fromX);
              const midY = Math.min(arc.fromY, arc.toY) - Math.min(dist * 0.15, 40);
              const d = `M ${arc.fromX} ${arc.fromY} Q ${midX} ${midY} ${arc.toX} ${arc.toY}`;
              return (
                <path
                  key={`arc-${i}`}
                  d={d}
                  stroke={arc.color}
                  opacity={arc.opacity}
                  className="lineage__arc"
                  strokeDasharray="4 2"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              );
            })}

            {/* Nodes */}
            {entries.map((entry, i) => {
              const x = getX(entry.year);
              const y = getY(entry.track);
              const isSelected = selectedIndex === i;
              const isRelated = relatedIndices.has(i);
              const isSDD = entry.authority === 'SDD';
              const color = TRACK_COLORS[entry.track] || 'var(--text-tertiary)';
              const surname = entry.authority.split(' ').pop() || entry.authority;
              const isDimmed = filterAuthority !== null && entry.authority !== filterAuthority;
              const isHovered = hoveredIndex === i;
              const connectorLen = 170 - (y + 8);

              return (
                <g
                  key={i}
                  role="listitem"
                  tabIndex={0}
                  className={`lineage__node ${loaded ? 'lineage__node--loaded' : ''} ${isSelected ? 'lineage__node--selected' : ''} ${isDimmed ? 'lineage__node--dimmed' : ''}`}
                  onClick={(e: any) => handleNodeClick(e, i)}
                  onKeyDown={(e: any) => handleKeyDown(e, i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    cursor: 'pointer',
                    animationDelay: `${i * 80}ms`,
                  }}
                  aria-label={`${entry.year}: ${entry.title} by ${entry.authority}`}
                >
                  {/* Connector line to axis (animated drop) */}
                  <line
                    x1={x}
                    y1={y + 8}
                    x2={x}
                    y2={170}
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                    className={`lineage__connector ${loaded ? 'lineage__connector--loaded' : ''}`}
                    strokeDasharray={connectorLen}
                    style={{ animationDelay: `${i * 80 + 100}ms` }}
                  />

                  {/* Hover glow ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSDD ? 16 : 13}
                    fill={color}
                    className="lineage__hover-glow"
                  />

                  {/* Selected highlight ring */}
                  {(isSelected || isRelated) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={isSDD ? 14 : 12}
                      fill={color}
                      opacity={isSelected ? 0.2 : 0.1}
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSDD ? 8 : 6}
                    fill={color}
                    className={`lineage__node-circle ${isSDD ? 'lineage__node-pulse' : ''}`}
                    opacity={isSelected || isRelated ? 1 : 0.8}
                  />

                  {/* Initials */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="var(--bg-primary)"
                    fontSize="7"
                    fontWeight="600"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {entry.initials}
                  </text>

                  {/* Hover label — surname above node */}
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    fill={color}
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="var(--font-mono)"
                    className="lineage__hover-label"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {surname}
                  </text>

                  {/* Tooltip — year + title on hover */}
                  {isHovered && !isSelected && (
                    <g className="lineage__tooltip-group" style={{ opacity: 1 }}>
                      <rect
                        x={x - 80}
                        y={y - 46}
                        width={160}
                        height={22}
                        rx={4}
                        fill="var(--bg-secondary, #1a1a2e)"
                        stroke="var(--border)"
                        strokeWidth="0.5"
                        opacity="0.95"
                      />
                      <text
                        x={x}
                        y={y - 31}
                        textAnchor="middle"
                        fill="var(--text-secondary)"
                        fontSize="8"
                        fontFamily="var(--font-mono)"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {entry.year} —{' '}
                        {entry.title.length > 28 ? entry.title.slice(0, 26) + '…' : entry.title}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Authority filter legend */}
        <div className="lineage__legend" role="group" aria-label="Filter by authority">
          {AUTHORITIES.map((auth) => (
            <button
              key={auth.name}
              type="button"
              className={`lineage__legend-item ${filterAuthority === auth.name ? 'lineage__legend-item--active' : ''}`}
              onClick={() => handleLegendClick(auth.name)}
              aria-pressed={filterAuthority === auth.name}
            >
              <span className="lineage__legend-dot" style={{ background: auth.color }} />
              {auth.name}
            </button>
          ))}
        </div>

        {/* Detail card — full width */}
        {selected && (
          <div className="lineage__detail card" aria-label="Timeline entry detail">
            <div className="lineage__detail-track-bar" style={{ background: selectedColor }} />
            <div className="lineage__detail-body">
              <div className="lineage__detail-header">
                <div className="lineage__detail-meta">
                  <p className="lineage__detail-year">{selected.year}</p>
                  <p className="lineage__detail-authority">{selected.authority}</p>
                  <h3 className="lineage__detail-title">{selected.title}</h3>
                </div>
                <span className="lineage__detail-source-badge">
                  {SOURCE_TYPE_LABELS[selected.sourceType] || selected.sourceType}
                </span>
              </div>

              <p className="lineage__detail-desc">{selected.description}</p>

              <div className="lineage__detail-connection">
                <p className="lineage__detail-connection-label">SDD Connection</p>
                <p className="lineage__detail-connection-text">{selected.sddConnection}</p>
              </div>

              {/* Relationship chips */}
              {(selected.influences.length > 0 ||
                entries.some((e) => e.influences.includes(selectedIndex!))) && (
                <div className="lineage__detail-relationships">
                  {selected.influences.length > 0 && (
                    <>
                      <span className="lineage__detail-rel-label">Influenced</span>
                      {selected.influences.map((targetIdx) => {
                        const target = entries[targetIdx];
                        if (!target) return null;
                        const tColor = TRACK_COLORS[target.track] || 'var(--text-tertiary)';
                        return (
                          <button
                            key={targetIdx}
                            type="button"
                            className="lineage__detail-rel-chip"
                            style={{
                              color: tColor,
                              borderColor: tColor,
                              background: 'transparent',
                            }}
                            onClick={() => setSelectedIndex(targetIdx)}
                          >
                            {target.authority} ({target.year})
                          </button>
                        );
                      })}
                    </>
                  )}
                  {entries.some((e) => e.influences.includes(selectedIndex!)) && (
                    <>
                      <span
                        className="lineage__detail-rel-label"
                        style={{ marginTop: selected.influences.length > 0 ? '0.5rem' : 0 }}
                      >
                        Influenced by
                      </span>
                      {entries
                        .map((e, i) => ({ entry: e, idx: i }))
                        .filter(({ entry }) => entry.influences.includes(selectedIndex!))
                        .map(({ entry, idx }) => {
                          const eColor = TRACK_COLORS[entry.track] || 'var(--text-tertiary)';
                          return (
                            <button
                              key={idx}
                              type="button"
                              className="lineage__detail-rel-chip"
                              style={{
                                color: eColor,
                                borderColor: eColor,
                                background: 'transparent',
                              }}
                              onClick={() => setSelectedIndex(idx)}
                            >
                              {entry.authority} ({entry.year})
                            </button>
                          );
                        })}
                    </>
                  )}
                </div>
              )}

              <div className="lineage__detail-footer">
                <div className="lineage__detail-concepts">
                  {selected.concepts.map((concept: string) => (
                    <span key={concept} className="lineage__detail-concept">
                      {concept}
                    </span>
                  ))}
                </div>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lineage__detail-link"
                >
                  View source →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
