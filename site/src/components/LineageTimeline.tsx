import { useState, useCallback, useRef } from 'preact/hooks';
import lineageData from '../data/lineage.json';

interface TimelineEntry {
  year: number;
  authority: string;
  initials: string;
  title: string;
  description: string;
  sddConnection: string;
  sourceUrl: string;
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

export default function LineageTimeline() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

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

  // Timeline dimensions
  const minYear = 2003;
  const maxYear = 2026;
  const yearRange = maxYear - minYear;

  return (
    <div className="lineage" ref={containerRef}>
      <div className="lineage__timeline" role="list" aria-label="DDD lineage timeline">
        <svg viewBox="0 0 1000 200" className="lineage__svg" role="img">
          <title>DDD Lineage Timeline</title>
          <desc>
            Interactive timeline from 2003 to 2026 showing the intellectual lineage of Domain-Driven
            Design and how Signal-Driven Development builds on each contribution.
          </desc>

          {/* Year axis */}
          {[2003, 2006, 2010, 2013, 2015, 2018, 2021, 2024, 2026].map((year) => {
            const x = ((year - minYear) / yearRange) * 920 + 40;
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
            const x = ((entry.year - minYear) / yearRange) * 920 + 40;
            const y = 30 + (entry.track % 6) * 22;
            const isSelected = selectedIndex === i;
            const isSDD = entry.authority === 'SDD';
            const color = TRACK_COLORS[entry.track] || 'var(--text-tertiary)';

            return (
              <g
                key={i}
                role="listitem"
                tabIndex={0}
                className={`lineage__node ${isSelected ? 'lineage__node--selected' : ''}`}
                onClick={() => handleSelect(i)}
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

                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSDD ? 8 : 6}
                  fill={color}
                  className={isSDD ? 'lineage__node-glow' : ''}
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
                >
                  {entry.initials}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail card */}
      {selected && (
        <div className="lineage__detail card" aria-label="Timeline entry detail">
          <div className="lineage__detail-header">
            <span className="lineage__detail-year">{selected.year}</span>
            <span className="lineage__detail-authority">{selected.authority}</span>
          </div>
          <h3 className="lineage__detail-title">{selected.title}</h3>
          <p className="lineage__detail-desc">{selected.description}</p>
          <div className="lineage__detail-connection">
            <strong>SDD connection:</strong> {selected.sddConnection}
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
      )}
    </div>
  );
}
