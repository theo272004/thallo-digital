'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Micro, useInView } from './ui';
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

/**
 * Where the bubble goes, decided by the reading it belongs to and by nothing
 * else.
 *
 * Recharts hangs its tooltip off the pointer and eases it to each new place, so
 * the box drifted up and down with the mouse over a dot that had not moved, and
 * slid sideways between readings. It also flips to the other side of the cursor
 * by itself near an edge — which is how the last reading ended up with its
 * bubble laid back across the middle of the chart, pointing at nothing.
 *
 * Two of those three were the problem; the gliding was not. Moving between
 * readings should feel like the box travelling to the next one — that is what
 * makes running along the chart worth doing — and the first pass at this threw
 * it out with the drift and the flipping. It is back, and it is now a glide
 * between two places that are decided rather than between two guesses:
 *
 * · Vertically, from the value. `position={{ y: 0 }}` pins Recharts' wrapper
 *   to the top of the plot, so the offset this box applies is absolute — the
 *   dot's own height, 12px of air, and the pointer nowhere in the arithmetic.
 *   A reading high enough that above would leave the plot gets it below
 *   instead. It is a plain CSS transition, so it eases with the horizontal.
 * · Horizontally, from the reading's place in the series. The first opens to
 *   the right of its dot, the last closes to the left of it, and every reading
 *   in between is centred over its own. Where the box sits already tells you
 *   which reading you are on, and the last one stays at the end.
 *
 * Both moves run 260ms on the same ease-out, so the box arrives as one thing
 * rather than as an x and a y. `isAnimationActive="auto"` is Recharts' own
 * word for "and not at all if the reader asked for less motion"; the class on
 * the box says the same for the vertical half.
 */
function TrendTooltip({
  active,
  payload,
  activeIndex,
  count,
  dotY,
}: {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
  activeIndex?: number | string;
  count: number;
  dotY: React.RefObject<Record<number, number>>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  const i = Number(activeIndex);
  const x = i === 0 ? '0%' : i === count - 1 ? '-100%' : '-50%';

  /* The dot's height, as the dot itself reported it. The `coordinate` Recharts
     hands the content is the reading's x and the *pointer's* y — that y is the
     number that used to make this drift — and there is no plot box in the
     props to work a percentage back into a height with. So the height comes
     from the render below and the pointer is not consulted at all. */
  const anchor = dotY.current[i];
  /* Failing that, the top of the plot: visible and out of the way, rather than
     above the panel where nothing can be seen. */
  let y = '12px';
  if (anchor !== undefined) {
    /* Above its dot, unless the reading is high enough that above would leave
       the plot — then below it, which is the same 12px the other way. */
    y = anchor > 74 ? `calc(${Math.round(anchor)}px - 100% - 12px)` : `${Math.round(anchor) + 12}px`;
  }

  return (
    <div
      className="w-max rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition-transform duration-[260ms] ease-out motion-reduce:transition-none"
      style={{ transform: `translate(${x}, ${y})` }}
    >
      <p className="text-[12px] font-bold text-gray-900">{point.sovPct}% brand knowledge</p>
      <p className="mt-0.5 text-[11px] font-medium text-gray-400">
        {shortDate(point.date)}
        {point.grade ? ` · grade ${point.grade}` : ''}
      </p>
    </div>
  );
}

export default function TrendChart({ history, brand }: { history: HistoryPoint[]; brand: string }) {
  /* Filled by the dot renderer below, read by the tooltip above: where each
     reading actually landed, in the chart's own pixels. Declared before the
     early return, because a hook after one is a hook that sometimes runs. */
  const dotY = React.useRef<Record<number, number>>({});

  /* The plot is not built until it is reached. Recharts draws a line in on
     mount and nowhere else, so a chart that mounts three screens below the
     fold has already finished its one animation by the time anybody scrolls
     to it — which is exactly what was happening: the panel arrived with a
     line already sitting there. Mounting it on arrival is what makes the
     animation the reader's, and the reserved height means nothing shifts. */
  const [plotRef, plotInView] = useInView<HTMLDivElement>();

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
      <div ref={plotRef} className="min-h-[180px] w-full flex-1">
        {plotInView && (
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
            {/* `offset` and `allowEscapeViewBox` together mean the wrapper is
                left exactly on the reading's x — no nudge, no edge flip.
                `position` takes the y away from it entirely: pinned to the top
                of the plot, so the wrapper only ever moves sideways and the
                box above owns the height. What Recharts still does is ease
                that sideways move, which is the float. */}
            <Tooltip
              content={<TrendTooltip count={history.length} dotY={dotY} />}
              cursor={{ stroke: '#e8e8e5' }}
              isAnimationActive="auto"
              animationDuration={260}
              animationEasing="ease-out"
              position={{ y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
              offset={0}
            />
            <Line
              type="monotone"
              dataKey="sovPct"
              stroke={OLIVE}
              strokeWidth={2.5}
              strokeLinecap="round"
              /* A function rather than an object, only so that each dot can
                 leave its height behind for the tooltip. It draws exactly what
                 the object drew. */
              dot={({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => {
                if (typeof index === 'number' && typeof cy === 'number') dotY.current[index] = cy;
                return (
                  <circle
                    key={index}
                    className="recharts-dot recharts-line-dot"
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill="white"
                    stroke={OLIVE}
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 5, fill: OLIVE, stroke: 'white', strokeWidth: 2 }}
              /* Drawn left to right over 900ms. It was off — reasonably, when
                 it was going to run unseen — and with the mount held until the
                 panel is on screen it is the one animation on this page that
                 is about the data: the series arriving in the order it was
                 recorded. */
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
