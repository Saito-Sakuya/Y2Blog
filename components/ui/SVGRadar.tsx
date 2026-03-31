'use client';

import React, { useState } from 'react';

interface Axis {
  label: string;
  score: number; // 0-10
}

interface Props {
  data: {
    name: string;
    axes: Axis[];
  };
  size?: number;
}

export default function SVGRadar({ data, size = 200 }: Props) {
  const [hovered, setHovered] = useState<{ label: string; score: number; x: number; y: number } | null>(null);

  const padding = 40; // padding to prevent label clipping
  const viewBoxSize = size + padding * 2;
  const center = viewBoxSize / 2;
  const radius = size * 0.4; // relative to original size
  const numAxes = data.axes.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Grid / Web
  const levels = 5;
  const webs = Array.from({ length: levels }).map((_, i) => {
    const r = radius * ((i + 1) / levels);
    const pts = Array.from({ length: numAxes }).map((_, j) => {
      const a = j * angleStep - Math.PI / 2;
      return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
    });
    return pts.join(' ');
  });

  // Data Polygon & Points
  const pointsData = data.axes.map((axis, j) => {
    const a = j * angleStep - Math.PI / 2;
    const r = radius * (axis.score / 10);
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
      axis
    };
  });
  const dataPts = pointsData.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: viewBoxSize }}>
      <div className="font-sans" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: 'var(--text-primary)' }}>
        {data.name}
      </div>
      <div style={{ position: 'relative' }}>
        <svg width={viewBoxSize} height={viewBoxSize} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} style={{ overflow: 'visible' }}>
          {/* Background webs */}
          {webs.map((poly, i) => (
            <polygon
              key={i}
              points={poly}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Axis lines */}
          {Array.from({ length: numAxes }).map((_, j) => {
            const a = j * angleStep - Math.PI / 2;
            return (
              <line
                key={`axis-${j}`}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(a)}
                y2={center + radius * Math.sin(a)}
                stroke="var(--border)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={dataPts}
            fill="var(--glow-pink)"
            stroke="var(--accent-pink)"
            strokeWidth="2"
            pointerEvents="none"
          />

          {/* Labels */}
          {data.axes.map((axis, j) => {
            const a = j * angleStep - Math.PI / 2;
            const labelR = radius + 24; // offset label
            const tx = center + labelR * Math.cos(a);
            const ty = center + labelR * Math.sin(a);
            return (
              <text
                key={`text-${j}`}
                x={tx}
                y={ty}
                fill="var(--text-secondary)"
                fontSize="10"
                fontFamily="var(--font-pixel)"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {axis.label}
              </text>
            );
          })}

          {/* Interactive invisible hit areas */}
          {pointsData.map((p, i) => (
            <circle
              key={`hit-${i}`}
              cx={p.x}
              cy={p.y}
              r={16}
              fill="transparent"
              style={{ cursor: 'crosshair', pointerEvents: 'all' }}
              onMouseEnter={() => setHovered({ label: p.axis.label, score: p.axis.score, x: p.x, y: p.y })}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Active Hover Glow */}
          {hovered && (
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="var(--glow-purple)" stroke="var(--accent-purple)" strokeWidth={2} pointerEvents="none" />
          )}
        </svg>

        {/* HTML Tooltip Overlay */}
        {hovered && (
          <div style={{
            position: 'absolute',
            left: hovered.x + 12,
            top: hovered.y - 12,
            backgroundColor: 'var(--bg-secondary)',
            border: '2px solid var(--border)',
            padding: '4px 8px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '2px 2px 0 var(--glow-purple)',
            zIndex: 10
          }}>
            <span className="font-sans" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{hovered.label}</span>
            <span className="font-pixel" style={{ marginLeft: 8, fontSize: 14, color: 'var(--accent-pink)' }}>{hovered.score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
