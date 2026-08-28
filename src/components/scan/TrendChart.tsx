'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Micro } from './ui';
import type { HistoryPoint } from '@/lib/scan/types';

/**
 * Brand knowledge over time, for one brand in one market — the no-search
 * reading, which is the only one the history table keeps.
 *
 * ## The chart is always drawn
 *
 * It used to disappear below two points and be replaced by a paragraph, and the
 * paragraph was correct about the data and wrong about everything else. Two
 * things went badly:
 *
 *   · The report promises "run it again and this becomes a trend", and the
 *     history table keeps **one point per day per series** — so somebody who
 *     ran the same brand twice in one evening did exactly what they were told
 *     and got the same paragraph back, which reads as the feature being broken
 *     rather than as the series being daily. It was reported that way.
 *   · An empty panel is a hole. A section headed "Brand knowledge over time"
 *     with a grey box of prose under it looks like something failed to load,
 *     and a reader who thinks part of the report is broken discounts the parts
 *     that are not.
 *
 * So the axes, the grid and whatever points exist are always drawn — a single
 * run shows as a single dot, which is an honest picture of one measurement —
 * and the explanation moves underneath, where it says what would put a second
 * dot beside it and when. What is never drawn is a *line* through one point:
 * the line is the claim, and one measurement does not support it.
 *
 * Behind that dot, below two readings, sits a grey dashed **example** of the
 * shape a series makes — see `EXAMPLE`. One dot on an empty grid is still a
 * panel that reads as broken, and the example says what the panel is for
 * without pretending to be a measurement: grey against olive, dashed against
 * solid, captioned on the chart and again underneath, on an axis that draws no
 * dates while it is showing.
 *
 * ## Why the y-axis is not zoomed to the data
 *
 * It is pinned to 0–100. Share of voice is a percentage of a fixed denominator,
 * and a fitted axis would turn a two-point wobble into a cliff — the most common
 * way a chart lies without anybody deciding to lie.
 */

const OLIVE = '#39471D';
/* Grey, not a tint of the olive. Everything olive in this report is a
   measurement, and the example below is not one. */
const GHOST = '#c9cdc2';

/**
 * The shape drawn behind a series that does not exist yet.
 *
 * A panel headed "Brand knowledge over time" containing one dot and a
 * paragraph reads as something that failed to load — that was the report on it,
 * and a reader who thinks part of the report is broken discounts the rest. What
 * it should read as is a series with one reading in it, and the fastest way to
 * say that is to show the shape the next two readings would make.
 *
 * Four points, deliberately unremarkable, and never joined to the real dot: the
 * example is grey, dashed and captioned, the reading is olive and solid, and
 * the axis carries no dates in this mode, so there is nothing on screen that
 * could be mistaken for a measurement that did not happen. The numbers are not
 * a projection of anything and are never derived from the visitor's own score —
 * a line that appeared to forecast their next reading would be the one
 * genuinely dishonest way to fill this space.
 */
const EXAMPLE = [31, 38, 36, 47];

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
  const points = history ?? [];
  const trending = points.length >= 2;

  const first = points[0];
  const last = points[points.length - 1];
  const change = trending ? last.sovPct - first.sovPct : 0;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  /* Two different charts, and they share everything but their data.
   *
   * Trending, it is the series. Below two points it is the example above with
   * the one real reading — if there is one — parked in the last slot, which is
   * why the slots carry index keys rather than dates: nothing here is dated,
   * and the x-axis draws no ticks in this mode for exactly that reason. */
  const data: Array<Partial<HistoryPoint> & { date: string; ghost?: number }> = trending
    ? points
    : [
        ...EXAMPLE.map((ghost, i) => ({ date: `slot-${i}`, ghost })),
        { date: 'slot-4', ...(points.length ? { sovPct: points[0].sovPct, grade: points[0].grade } : {}) },
      ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-5">
        {trending ? (
          <>
            <span className="text-2xl font-bold leading-none tracking-tight text-gray-900">
              {change > 0 ? '+' : ''}
              {change}
              <span className="text-base"> pts</span>
            </span>
            <Micro className="text-gray-400">
              {direction === 'flat' ? 'no change' : direction} since {shortDate(first.date)} · {points.length} scans
            </Micro>
          </>
        ) : (
          <>
            {/* The reading itself, at the same size the change would be. The
                panel is not empty — there is one real measurement in it — and
                sizing it like a placeholder would say otherwise. */}
            <span className="text-2xl font-bold leading-none tracking-tight text-gray-900">
              {points.length ? `${points[0].sovPct}%` : '—'}
            </span>
            <Micro className="text-gray-400">
              {points.length ? `first reading · ${shortDate(points[0].date)}` : 'no readings recorded yet'}
            </Micro>
          </>
        )}
      </div>

      {/* Fixed height: ResponsiveContainer measures its parent, and a parent
          sized by its content would collapse to nothing on first paint. */}
      <div className="relative h-[180px] w-full">
        {/* Said on the chart, not only under it. A grey dashed line inside a
            panel of real figures has to name itself where it is, or it is a
            measurement drawn in a different colour. */}
        {!trending && (
          <span className="pointer-events-none absolute right-1 top-0 z-10 rounded-md bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-gray-400">
            Example
          </span>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#e8e8e5" vertical={false} />
            <XAxis
              dataKey="date"
              /* No ticks at all while the example is showing. The slots are not
                 dates and labelling them would be inventing four scans that
                 never ran — which is the one thing a chart in this report may
                 never do. */
              tickFormatter={trending ? shortDate : undefined}
              tick={trending ? { fontSize: 9, fontWeight: 700, fill: '#9ca3af', fontFamily: 'ui-monospace, monospace' } : false}
              axisLine={false}
              tickLine={false}
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
            {/* Only over a real series. There is nothing to say about a slot
                in the example, and a tooltip on it would be offering to
                explain a number nobody measured. */}
            {trending && <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#e8e8e5' }} />}

            {/* Drawn first so the real reading sits on top of it. */}
            {!trending && (
              <Line
                type="monotone"
                dataKey="ghost"
                stroke={GHOST}
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeLinecap="round"
                dot={{ fill: 'white', stroke: GHOST, strokeWidth: 2, r: 3 }}
                activeDot={false}
                isAnimationActive={false}
              />
            )}

            <Line
              type="monotone"
              dataKey="sovPct"
              /* No line through a single point. The line is the claim — "this
                 went that way" — and one measurement does not support it. The
                 dot does: it says "one reading, here", which is true. */
              stroke={trending ? OLIVE : 'transparent'}
              strokeWidth={2.5}
              strokeLinecap="round"
              /* Larger on its own, because a lone 3.5px dot on an empty grid
                 reads as a rendering artefact rather than as the measurement. */
              dot={{ fill: 'white', stroke: OLIVE, strokeWidth: 2, r: trending ? 3.5 : 5 }}
              activeDot={{ r: 5, fill: OLIVE, stroke: 'white', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Under the chart, not instead of it. What this says is the difference
          between a reader who comes back next month and one who concludes the
          trend feature does not work — so it has to name the actual rule: the
          series holds one point per day, and a second run this afternoon
          replaces this one rather than adding to it. */}
      {!trending && (
        <p className="mt-4 max-w-[80ch] text-[12.5px] font-medium leading-relaxed text-gray-500">
          {points.length ? (
            <>
              <strong className="font-bold text-gray-900">One reading so far.</strong> The dashed grey line is an
              example of what this panel looks like with a few scans behind it — it is not your data and it is not a
              forecast. Only the olive dot is measured. This series keeps one point per day, so running {brand}{' '}
              again this afternoon updates today&rsquo;s dot rather than adding a second one; the line appears on the first
              scan you run on a different day. Model answers drift on their own from week to week, so a reading a month
              from now is worth more than five this week.
            </>
          ) : (
            <>
              <strong className="font-bold text-gray-900">Nothing recorded yet.</strong> The dashed grey line is an
              example of what this panel looks like once there is a history to draw — none of it is your data. The
              series is kept per website and per market, and it starts on the first live scan; preview runs are
              deliberately never written to it.
            </>
          )}
        </p>
      )}
    </div>
  );
}
