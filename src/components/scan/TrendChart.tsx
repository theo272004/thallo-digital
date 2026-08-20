'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Micro } from './ui';
import type { HistoryPoint } from '@/lib/scan/types';

/**
 * Brand knowledge over time, for one brand in one market — the no-search
 * reading, which is the only one the history table keeps.
 *
 * ## Why the empty state is half of this component
 *
 * Almost everyone who reaches this panel is on their first scan and has exactly
 * one point. Drawing a line through one dot would suggest a measurement that
 * does not exist yet, which is the failure mode this whole tool is built to
 * avoid — so a single-point series renders as a statement about what happens
 * next, not as a chart. The chart appears on the second run, because that is
 * when there is a trend to show.
 *
 * ## Why the y-axis is not zoomed to the data
 *
 * It is pinned to 0–100. Share of voice is a percentage of a fixed denominator,
 * and a fitted axis would turn a two-point wobble into a cliff — the most common
 * way a chart lies without anybody deciding to lie.
 */

const OLIVE = '#39471D';

function shortDate(iso: string): string {
  // Parsed as UTC to match how the server stored it. Left to the local
  // timezone, a scan recorded late in the day shows the day before.
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: HistoryPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[12px] font-bold text-gray-900">{point.sovPct}% brand knowledge</p>
      <p className="mt-0.5 text-[11px] font-medium text-gray-400">
        {shortDate(point.date)}
        {point.grade ? ` · grade ${point.grade}` : ''}
      </p>
    </div>
  );
}

export default function TrendChart({ history, brand }: { history: HistoryPoint[]; brand: string }) {
  if (history.length < 2) {
    return (
      <div className="flex h-full items-center rounded-xl bg-gray-50 px-4 py-4">
        <p className="text-[13px] font-medium leading-relaxed text-gray-500">
          This is the first recorded scan for {brand} in this market, so there is nothing to compare it against yet.
          Run it again and this becomes a trend — which is the number that actually answers whether the work is
          landing. Model answers drift on their own, so a single reading a month apart is worth more than five in a
          week.
        </p>
      </div>
    );
  }

  const first = history[0];
  const last = history[history.length - 1];
  const change = last.sovPct - first.sovPct;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  return (
    /* Full height, because the card this sits in is half of a row and takes its
       height from the panel beside it. */
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-5">
        <span className="text-2xl font-bold leading-none tracking-tight text-gray-900">
          {change > 0 ? '+' : ''}
          {change}
          <span className="text-base"> pts</span>
        </span>
        <Micro className="text-gray-400">
          {direction === 'flat' ? 'no change' : direction} since {shortDate(first.date)} · {history.length} scans
        </Micro>
      </div>

      {/* `min-h`, not `h`: ResponsiveContainer measures its parent, and a parent
          sized by its content would collapse to nothing on first paint — but a
          parent that can grow lets the plot take the spare height of the card
          rather than leaving it blank underneath. */}
      <div className="min-h-[180px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#e8e8e5" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af', fontFamily: 'ui-monospace, monospace' }}
              dy={6}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af', fontFamily: 'ui-monospace, monospace' }}
              width={44}
            />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#e8e8e5' }} />
            <Line
              type="monotone"
              dataKey="sovPct"
              stroke={OLIVE}
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ fill: 'white', stroke: OLIVE, strokeWidth: 2, r: 3.5 }}
              activeDot={{ r: 5, fill: OLIVE, stroke: 'white', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
