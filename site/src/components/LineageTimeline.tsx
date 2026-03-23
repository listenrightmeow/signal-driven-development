import { useState, useCallback, useRef, useMemo } from 'preact/hooks';
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

export default function LineageTimeline() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selected = selectedIndex !== null ? entries[selectedIndex] : null;
  const selectedColor =
    selectedIndex !== null
      ? TRACK_COLORS[entries[selectedIndex].track] || 'var(--text-tertiary)'
      : '';

  // Timeline dimensions
  const minYear = 2003;
  const maxYear = 2026;
  const yearRange = maxYear - minYear;

  const getX = (year: number) => ((year - minYear) / yearRange) * 920 + 40;
  const getY = (track: number) => 30 + (track % 6) * 22;

  // Compute track connection lines (connect same-authority nodes)
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
        .lineage__node {
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          transition: opacity var(--transition-fast);
        }
        .lineage__node:hover {
          opacity: 1;
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
        .lineage__node-glow {
          filter: drop-shadow(0 0 6px var(--gap-success));
        }
        .lineage__hover-label {
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
        }
        .lineage__node:hover .lineage__hover-label {
          opacity: 1;
        }
        @keyframes sddPulse {
          0%, 100% { filter: drop-shadow(0 0 4px var(--gap-success)); }
          50% { filter: drop-shadow(0 0 12px var(--gap-success)); }
        }
        .lineage__node-pulse {
          animation: sddPulse 2.5s ease-in-out infinite;
        }

        /* Detail card — full width */
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
          .lineage__node-glow,
          .lineage__node-pulse {
            filter: none;
            animation: none;
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

            {/* Track connection lines */}
            {trackLines.map((line, i) => (
              <line
                key={`track-${i}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.color}
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.2"
              />
            ))}

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

            {/* Axis line */}
            <line x1="40" y1="175" x2="960" y2="175" stroke="var(--border)" strokeWidth="1" />

            {/* Nodes */}
            {entries.map((entry, i) => {
              const x = getX(entry.year);
              const y = getY(entry.track);
              const isSelected = selectedIndex === i;
              const isSDD = entry.authority === 'SDD';
              const color = TRACK_COLORS[entry.track] || 'var(--text-tertiary)';
              const surname = entry.authority.split(' ').pop() || entry.authority;

              return (
                <g
                  key={i}
                  role="listitem"
                  tabIndex={0}
                  className={`lineage__node ${isSelected ? 'lineage__node--selected' : ''}`}
                  onClick={(e: any) => handleNodeClick(e, i)}
                  onKeyDown={(e: any) => handleKeyDown(e, i)}
                  style={{ cursor: 'pointer' }}
                  aria-label={`${entry.year}: ${entry.title} by ${entry.authority}`}
                >
                  {/* Connector line to axis */}
                  <line
                    x1={x}
                    y1={y + 8}
                    x2={x}
                    y2={170}
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                  />

                  {/* Selected highlight ring */}
                  {isSelected && (
                    <circle cx={x} cy={y} r={isSDD ? 12 : 10} fill={color} opacity="0.15" />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSDD ? 8 : 6}
                    fill={color}
                    className={isSDD ? 'lineage__node-pulse' : ''}
                    opacity={isSelected ? 1 : 0.8}
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
                    y={y - 12}
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
                </g>
              );
            })}
          </svg>
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
