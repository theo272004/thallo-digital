/**
 * Scan engine — the one seam between the UI and the backend.
 *
 * ## Where the backend lives
 *
 * A WordPress plugin (`wordpress-plugin/thallo-visibility/`) on the same
 * Bluehost account that serves the blog. The static site sits at the domain
 * root, WordPress at `/blog/`, so the API is same-origin and there is no CORS
 * to negotiate and no second host to pay for. Crucially, the API keys sit in
 * WordPress options on the server — a static export cannot hold a secret, so
 * calling OpenAI from the browser was never an option.
 *
 * ## Why the client ticks
 *
 * Fifteen questions across three models is forty-five HTTP calls. No shared
 * host will hold a request open that long. So the backend treats a scan as a
 * job: `start` creates it, each `tick` advances it by one step and returns the
 * whole session, and the UI redraws from that. The progress bar is therefore
 * reporting real work rather than animating a guess.
 *
 * ## Configuration
 *
 * `NEXT_PUBLIC_SCAN_API` — the REST root, e.g.
 * `https://thallodigital.com/blog/wp-json/thallo/v1`. It is read at build time
 * because this is a static export. With it unset, everything below runs against
 * `demo.ts` and the UI shows a banner saying the numbers are samples.
 */

import { demoPhase1, demoPhase2 } from './demo';
import { buildQuestions } from './questions';
import {
  SCAN_STEPS,
  type ScanInput,
  type ScanSession,
  type StepStatus,
} from './types';

const API_BASE = (process.env.NEXT_PUBLIC_SCAN_API ?? '').replace(/\/$/, '');

export const IS_LIVE = API_BASE.length > 0;

/** How long we keep ticking before giving up on a stuck job. */
const MAX_TICKS = 40;
/** Breathing room between ticks so a slow provider does not get hammered. */
const TICK_PAUSE_MS = 400;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type OnUpdate = (session: ScanSession) => void;

class ScanError extends Error {
  constructor(
    message: string,
    /** Distinguishes "you have used your free scans" from "the server broke",
        so the UI can offer the right next step rather than a generic retry. */
    readonly code: string = 'scan_failed'
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ScanError('We could not reach the scanner. Check your connection and try again.', 'network');
  }

  const data = (await res.json().catch(() => null)) as (T & { code?: string; message?: string }) | null;

  if (!res.ok || !data) {
    // WordPress returns `{ code, message }` on a WP_Error, and the plugin uses
    // it for the things a visitor can actually do something about — the daily
    // limit above all — so pass the message straight through.
    throw new ScanError(
      data?.message ?? 'The scan could not be completed. Please try again in a moment.',
      data?.code ?? 'scan_failed'
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// Demo driver
// ---------------------------------------------------------------------------

/** Builds the step list at whatever point the demo has reached. */
function demoSteps(doneIds: string[], runningId: string | null, locked: boolean): StepStatus[] {
  return SCAN_STEPS.map((s) => {
    if (doneIds.includes(s.id)) return { ...s, state: 'done', detail: s.phase === 1 ? '15 asked' : 'checked' };
    if (s.id === runningId) return { ...s, state: 'running', detail: 'working…' };
    if (s.phase === 2 && locked) return { ...s, state: 'locked', detail: 'Locked' };
    return { ...s, state: 'queued' };
  });
}

async function demoRun(input: ScanInput, onUpdate: OnUpdate): Promise<ScanSession> {
  const ids = SCAN_STEPS.filter((s) => s.phase === 1).map((s) => s.id);
  const done: string[] = [];

  for (const id of ids) {
    onUpdate({ scanId: 'demo', status: 'running', demo: true, steps: demoSteps(done, id, true) });
    await wait(900);
    done.push(id);
  }

  const phase1 = demoPhase1(input);
  const session: ScanSession = {
    scanId: phase1.scanId,
    status: 'awaiting-email',
    demo: true,
    steps: demoSteps(done, null, true),
    phase1,
  };
  onUpdate(session);
  return session;
}

async function demoUnlock(session: ScanSession, onUpdate: OnUpdate): Promise<ScanSession> {
  if (!session.phase1) throw new ScanError('Nothing to unlock.');
  const done = SCAN_STEPS.filter((s) => s.phase === 1).map((s) => s.id);

  for (const s of SCAN_STEPS.filter((x) => x.phase === 2)) {
    onUpdate({ ...session, status: 'unlocking', steps: demoSteps(done, s.id, false) });
    await wait(900);
    done.push(s.id);
  }

  const next: ScanSession = {
    ...session,
    status: 'complete',
    steps: demoSteps(done, null, false),
    phase2: demoPhase2(session.phase1),
  };
  onUpdate(next);
  return next;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Starts a scan and drives it to the email gate, calling `onUpdate` after every
 * step so the progress screen can redraw. Resolves with the finished phase-1
 * session; rejects with a `ScanError` carrying a message worth showing.
 */
export async function startScan(input: ScanInput, onUpdate: OnUpdate): Promise<ScanSession> {
  if (!IS_LIVE) return demoRun(input, onUpdate);

  let session = await post<ScanSession>('/scan', input);
  onUpdate(session);

  for (let i = 0; i < MAX_TICKS && session.status === 'running'; i++) {
    await wait(TICK_PAUSE_MS);
    session = await post<ScanSession>(`/scan/${session.scanId}/tick`, {});
    onUpdate(session);
  }

  if (session.status === 'running') {
    throw new ScanError('The scan is taking longer than expected. Please try again.', 'timeout');
  }
  if (session.status === 'failed') {
    throw new ScanError(session.error ?? 'The scan could not be completed.', 'failed');
  }

  return session;
}

/**
 * Hands over the email and drives phase 2 to completion. The email is the only
 * thing exchanged for the full report, so it is sent once, to our own server,
 * and stored there.
 */
export async function unlockScan(
  session: ScanSession,
  email: string,
  onUpdate: OnUpdate
): Promise<ScanSession> {
  if (!IS_LIVE) return demoUnlock(session, onUpdate);

  let next = await post<ScanSession>(`/scan/${session.scanId}/unlock`, { email });
  onUpdate(next);

  for (let i = 0; i < MAX_TICKS && next.status === 'unlocking'; i++) {
    await wait(TICK_PAUSE_MS);
    next = await post<ScanSession>(`/scan/${next.scanId}/tick`, {});
    onUpdate(next);
  }

  if (next.status === 'failed') {
    throw new ScanError(next.error ?? 'We could not unlock the report.', 'failed');
  }
  if (next.status !== 'complete') {
    throw new ScanError('The report is taking longer than expected. Please try again.', 'timeout');
  }

  return next;
}

/** The first paint of the progress screen, before the server has said anything. */
export function initialSession(): ScanSession {
  return {
    scanId: '',
    status: 'running',
    demo: !IS_LIVE,
    steps: SCAN_STEPS.map((s) => ({ ...s, state: s.phase === 1 ? 'queued' : 'locked' })),
  };
}

export { buildQuestions };
