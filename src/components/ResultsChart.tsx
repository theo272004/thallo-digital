'use client';

import React from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
} from 'recharts';

// ── Chart data — 7 equal columns, one per month ──────────────────────────────
const CHART_DATA = [
  { month: 'Dec', value: 18 },
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 46 },
  { month: 'Mar', value: 60 },
  { month: 'Apr', value: 72 },
  { month: 'May', value: 84 },
  { month: 'Jun', value: 94 },
];

/**
 * The AI-visibility line chart. Split out of ResultsDashboard and loaded with
 * next/dynamic so Recharts — by far the heaviest dependency on the page — is
 * fetched as its own chunk instead of riding along in the initial bundle.
 */
export default function ResultsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={CHART_DATA}
        margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        accessibilityLayer={false}
      >
        {/* 5 horizontal lines + 7 vertical lines */}
        <CartesianGrid
          stroke="#e8e8e5"
          strokeWidth={1}
          strokeDasharray=""
          vertical={true}
          horizontal={true}
        />
        {/* X axis — month labels centred under each column */}
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fontWeight: 700,
            fill: '#9ca3af',
            fontFamily: 'ui-monospace, monospace',
          }}
          dy={6}
        />
        {/* Y axis — hidden but controls 5 horizontal grid lines */}
        <YAxis
          hide
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
        />
        {/* The line itself */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#39471D"
          strokeWidth={2.5}
          strokeLinecap="round"
          dot={{ fill: 'white', stroke: '#39471D', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 5, fill: '#39471D', stroke: 'white', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
