'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Micro, useInView } from './ui';
import type { HistoryPoint } from '@/lib/scan/types';

/**
 * Brand knowledge over time, for one brand in one market — the no-search
 * reading, which is the only one the history table keeps.
 *
 * ## The first scan draws its one reading
 *
 * Almost everyone who reaches this panel is on their first scan and has exactly
 * one point. That used to render as four lines of grey prose in place of the
 * plot, and the owner's verdict on it was that the panel arrived blank — which
 * it did: a half-width card with a paragraph in it, beside a card full of
 * figures.
 *
 * What is drawn instead is the axis with the one reading on it and no line
 * through it. The original worry was right and this does not reopen it — a line
 * is a claim about direction, and one point cannot support one — but a dot is
 * not a line. It says "this is where you are, and this is the scale", which is
 * true, is the same scale the second reading will land on, and is a great deal
 * more use than a paragraph explaining why there is nothing to look at. The
 * caption under it says what the second scan will add.
 *
 * With no readings at all there is nothing to draw and nothing to say, and the
 * report leaves the panel out entirely rather than rendering this component.
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

  /* Nothing to plot at all. The report does not render this component in that
     case; the guard is here so the component is safe on its own terms. */
  if (history.length === 0) return null;

  const single = history.length === 1;

  const first = history[0];
  const last = history[history.length - 1];
  const change = last.sovPct - first.sovPct;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  return (
    /* Full height, because the card this sits in is half of a row and takes its
       height from the panel beside it. */
    <div className="flex h-full flex-col">
      {/* The figure a trend panel exists to state — and on a first scan there
          is no such figure, so the reading itself takes the slot rather than a
          "+0 pts" that would be arithmetic on a series of one. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-5">
        <span className="text-2xl font-bold leading-none tracking-tight text-gray-900">
          {single ? (
            <>
              {last.sovPct}
              <span className="text-base">%</span>
            </>
          ) : (
            <>
              {change > 0 ? '+' : ''}
              {change}
              <span className="text-base"> pts</span>
            </>
          )}
        </span>
        <Micro className="text-gray-400">
          {single
            ? `first reading · ${shortDate(first.date)}`
            : `${direction === 'flat' ? 'no change' : direction} since ${shortDate(first.date)} · ${history.length} scans`}
        </Micro>
      </div>

      {/* A stated height, not a minimum. ResponsiveContainer asks its parent
          how tall it is and draws nothing at all if the answer is "as tall as
          my contents" — which is what a min-height on an auto-height box
          resolves to. This panel used to be half of a row and took its height
          from the card beside it; alone and full width it has to name its own,
          and 240px is about what a five-point line wants at 1,300px across. */}
      <div ref={plotRef} className="h-[200px] w-full sm:h-[240px]">
        {plotInView && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#e8e8e5" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              /* A category axis maps index 0 to the left edge, so a series of
                 one draws its dot sitting on the y-axis. The padding puts it in
                 the plot. */
              padding={single ? { left: 28, right: 28 } : undefined}
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
              /* No stroke on a series of one: there is nothing between two
                 readings to draw, and a 2.5px stub beside a lone dot reads as
                 a line that has been cut off rather than as one that does not
                 exist yet. */
              stroke={single ? 'transparent' : OLIVE}
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
                    /* Bigger and filled when it is the only thing on the plot.
                       At 3.5px hollow it is a joint in a line, and with no line
                       to join it looks like a speck of dust on the grid. */
                    r={single ? 5 : 3.5}
                    fill={single ? OLIVE : 'white'}
                    stroke={single ? 'white' : OLIVE}
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

      {/* What the second reading buys, said under the thing it will change
          rather than in place of it. */}
      {single && (
        <p className="mt-4 border-t border-gray-100 pt-4 text-[11.5px] font-medium leading-relaxed text-gray-500">
          One reading for {brand}, so there is no direction yet. Run the scan again and the second point joins this one into
          a line — which is the number that answers whether the work is landing. Model answers drift on their own, so a
          reading a month apart is worth more than five in a week.
        </p>
      )}
    </div>
  );
}
