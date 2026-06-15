import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Type for Sector Breakdown
interface SectorBreakdown {
  transport: number;
  energy: number;
  diet: number;
  consumption: number;
}

// 1. HORIZONTAL COMPARISON CHART Pro-Level Styling
interface ComparisonChartProps {
  userValueKg: number;
}

export const GoalComparisonChart: React.FC<ComparisonChartProps> = ({ userValueKg }) => {
  const benchmarks = [
    { label: 'USA Household Avg', value: 15500, color: 'bg-red-400' },
    { label: 'Europe Household Avg', value: 6500, color: 'bg-amber-400' },
    { label: 'Your Annual Carbon', value: userValueKg, color: 'bg-emerald-500', isUser: true },
    { label: 'Global Safe Target', value: 2000, color: 'bg-cyan-400' },
  ];

  const maxValue = Math.max(16000, userValueKg * 1.1);

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
        <h4 className="text-sm font-medium text-slate-700">Annual Footprint Comparison</h4>
        <span className="text-xs text-slate-500 font-mono">Unit: kg CO₂e / Year</span>
      </div>

      <div className="space-y-4.5 pt-2">
        {benchmarks.map((item, index) => {
          const percent = (item.value / maxValue) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-medium ${item.isUser ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-600'}`}>
                  {item.isUser && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  {item.label}
                </span>
                <span className={`font-mono font-medium ${item.isUser ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {(item.value / 1000).toFixed(1)} t
                </span>
              </div>
              <div className="w-full h-4.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
                <motion.div
                  className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.9, delay: index * 0.1, ease: 'easeOut' }}
                >
                  {percent > 15 && (
                    <span className="text-[9px] font-bold text-white leading-none font-mono">
                      {Math.round(percent)}%
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>0</span>
        <span>4 t</span>
        <span>8 t</span>
        <span>12 t</span>
        <span>16+ t</span>
      </div>
    </div>
  );
};

// 2. RADIAL / DONUT BREAKDOWN CHART
interface BreakdownChartProps {
  breakdown: SectorBreakdown;
}

export const CategoryRadialChart: React.FC<BreakdownChartProps> = ({ breakdown }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = breakdown.transport + breakdown.energy + breakdown.diet + breakdown.consumption || 1;
  const sectors = [
    { id: 'transport', label: 'Transport', value: breakdown.transport, color: '#3b82f6', icon: '🚗' },
    { id: 'energy', label: 'Home Energy', value: breakdown.energy, color: '#f59e0b', icon: '⚡' },
    { id: 'diet', label: 'Diet & Food', value: breakdown.diet, color: '#10b981', icon: '🥗' },
    { id: 'consumption', label: 'Shopping & Waste', value: breakdown.consumption, color: '#8b5cf6', icon: '🛍️' },
  ];

  // SVG dimensions
  const size = 180;
  const radius = 65;
  const strokeWidth = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around p-5 rounded-2xl bg-white border border-slate-100 shadow-sm gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Drawing */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {sectors.map((sector, idx) => {
            const percentage = sector.value / total;
            const strokeDashoffset = circumference - percentage * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotation = (accumulatedAngle / total) * 360;
            accumulatedAngle += sector.value;

            const isHovered = hoveredIndex === idx;

            return (
              <motion.circle
                key={sector.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={sector.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotation}deg)`,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Info in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <AnimatePresence mode="wait">
            {hoveredIndex === null ? (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center px-4"
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Annual</span>
                <span className="text-xl font-bold font-mono text-slate-800 leading-none">
                  {(total / 1000).toFixed(1)}t
                </span>
                <span className="text-[9px] text-slate-500 font-medium">CO₂ Gross</span>
              </motion.div>
            ) : (
              <motion.div
                key={hoveredIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center px-4"
              >
                <span className="text-lg">{sectors[hoveredIndex].icon}</span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {sectors[hoveredIndex].label}
                </span>
                <span className="text-sm font-bold font-mono text-slate-800">
                  {((sectors[hoveredIndex].value / total) * 100).toFixed(0)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend Checklist */}
      <div className="flex-1 space-y-2.5 w-full">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-1">
          Emission Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {sectors.map((sector, idx) => (
            <div
              key={sector.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 border cursor-default ${
                hoveredIndex === idx
                  ? 'bg-slate-50 border-slate-200 shadow-sm translate-x-1'
                  : 'bg-white border-transparent'
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: sector.color }}>
                  {sector.icon}
                </div>
                <span className="text-xs text-slate-600 font-medium">{sector.label}</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="font-semibold text-slate-700">{(sector.value / 1000).toFixed(1)} t </span>
                <span className="text-[10px] text-slate-400">({((sector.value / total) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. WEEKLY RECOVERY AREA CHART (Progress curves)
interface WeeklySavingsChartProps {
  logs: { date: string; savedCo2Kg: number }[];
}

export const WeeklySavingsChart: React.FC<WeeklySavingsChartProps> = ({ logs }) => {
  // Aggregate last 7 calendar days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailySavings = last7Days.map(date => {
    const dayLogs = logs.filter(l => l.date === date);
    const sum = dayLogs.reduce((acc, curr) => acc + curr.savedCo2Kg, 0);
    return {
      dateLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: Number(sum.toFixed(1)),
    };
  });

  const maxSaving = Math.max(5, ...dailySavings.map(d => d.amount));

  // Chart proportions
  const width = 450;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;

  // Map coordinates
  const points = dailySavings.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (dailySavings.length - 1);
    const y = height - paddingY - (d.amount / maxSaving) * (height - paddingY * 2);
    return { x, y, label: d.dateLabel, value: d.amount };
  });

  // SVG Path generation
  let dPath = '';
  let dArea = '';
  if (points.length > 0) {
    // Generate Bezier Curve smoothly
    dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Connect to baseline for background area shade
    dArea = `${dPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  const [activePoint, setActivePoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  return (
    <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Weekly Carbon Shield</h4>
          <p className="text-[10px] text-slate-400">Total emission mitigations logged daily</p>
        </div>
        <span className="text-xs bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded-full font-semibold font-mono">
          +{logs.reduce((acc, curr) => acc + curr.savedCo2Kg, 0).toFixed(1)} kg saved
        </span>
      </div>

      <div className="relative h-[160px] w-full mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Horizontal Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth={1} />

          {/* Spark Area Shade */}
          {dArea && (
            <motion.path
              d={dArea}
              fill="url(#emeraldGradient)"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}

          {/* Spark Stroke Curve */}
          {dPath && (
            <motion.path
              d={dPath}
              fill="none"
              stroke="#10b981"
              strokeWidth={3.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          )}

          {/* Dot Highlights */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={2.5}
                className="cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
              />
              <text
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-semibold font-mono"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Highlight Tooltip */}
        <AnimatePresence>
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-xl border border-slate-700/80 shadow-md font-mono pointer-events-none flex items-center justify-center gap-1.5"
              style={{
                left: `calc(${(activePoint.x / width) * 100}% - 42px)`,
                top: `calc(${(activePoint.y / height) * 100}% - 38px)`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{activePoint.value} kg CO₂</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
