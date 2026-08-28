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
  type ScanQuota,
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

export class ScanError extends Error {
  constructor(
    message: string,
    /** Distinguishes "you have used your free scans" from "the server broke",
        so the UI can offer the right next step rather than a generic retry. */
    readonly code: string = 'scan_failed',
    /** The allowance as the server sees it, when the refusal was about the
        allowance. It travels with the refusal so the counter on screen cannot
        keep saying "scan 3 of 3" beside a message explaining there are none
        left. */
    readonly quota?: ScanQuota
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      /* The free allowance is counted against a session cookie, and `fetch`
         omits credentials cross-origin by default. Same-origin in the intended
         setup — the site at the root, WordPress at /blog/ — so this is a no-op
         there, and it is what makes local development against a remote
         WordPress count the same way production does. */
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ScanError('We could not reach the scanner. Check your connection and try again.', 'network');
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { code?: string; message?: string; data?: { quota?: ScanQuota } })
    | null;

  if (!res.ok || !data) {
    // WordPress returns `{ code, message, data }` on a WP_Error, and the plugin
    // uses it for the things a visitor can actually do something about — the
    // free allowance above all — so pass the message straight through, and the
    // allowance with it when one came back.
    throw new ScanError(
      data?.message ?? 'The scan could not be completed. Please try again in a moment.',
      data?.code ?? 'scan_failed',
      data?.data?.quota
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// Demo driver
// ---------------------------------------------------------------------------

/** Builds the step list at whatever point the demo has reached. */
function demoSteps(doneIds: string[], runningId: string | null, locked: boolean, asked = 0): StepStatus[] {
  return SCAN_STEPS.map((s) => {
    if (doneIds.includes(s.id)) return { ...s, state: 'done', detail: s.phase === 1 ? `${asked} asked` : 'checked' };
    if (s.id === runningId) return { ...s, state: 'running', detail: 'working…' };
    if (s.phase === 2 && locked) return { ...s, state: 'locked', detail: 'Locked' };
    return { ...s, state: 'queued' };
  });
}

async function demoRun(input: ScanInput, onUpdate: OnUpdate): Promise<ScanSession> {
  const ids = SCAN_STEPS.filter((s) => s.phase === 1).map((s) => s.id);
  const done: string[] = [];
  const asked = input.questions.length;

  for (const id of ids) {
    onUpdate({ scanId: 'demo', status: 'running', demo: true, steps: demoSteps(done, id, true, asked) });
    await wait(900);
    done.push(id);
  }

  const phase1 = demoPhase1(input);
  const session: ScanSession = {
    scanId: phase1.scanId,
    status: 'awaiting-email',
    demo: true,
    steps: demoSteps(done, null, true, asked),
    phase1,
  };
  onUpdate(session);

  /* The address came in with the setup, so the sample run does not stop to ask
     for it either. Preview mode exists to show the shape of the real thing, and
     a gate here that the live path no longer has would be showing the wrong
     shape. */
  if (input.email) return demoUnlock(session, onUpdate);

  return session;
}

async function demoUnlock(session: ScanSession, onUpdate: OnUpdate): Promise<ScanSession> {
  if (!session.phase1) throw new ScanError('Nothing to unlock.');
  const done = SCAN_STEPS.filter((s) => s.phase === 1).map((s) => s.id);
  const asked = session.phase1.questions.length;

  for (const s of SCAN_STEPS.filter((x) => x.phase === 2)) {
    onUpdate({ ...session, status: 'unlocking', steps: demoSteps(done, s.id, false, asked) });
    await wait(900);
    done.push(s.id);
  }

  const next: ScanSession = {
    ...session,
    status: 'complete',
    steps: demoSteps(done, null, false, asked),
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

  /* Through 'unlocking' as well as 'running'. When the address was given on the
     setup screen the server does not stop to ask for it: phase 1 rolls straight
     into phase 2 and the whole report arrives as one job. Stopping this loop at
     'running' would leave that scan paid for and half-driven, with the browser
     waiting for a gate the server had already opened. */
  for (let i = 0; i < MAX_TICKS && (session.status === 'running' || session.status === 'unlocking'); i++) {
    await wait(TICK_PAUSE_MS);
    session = await post<ScanSession>(`/scan/${session.scanId}/tick`, {});
    onUpdate(session);
  }

  if (session.status === 'running' || session.status === 'unlocking') {
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

/**
 * How many free scans this visitor has left, asked before they start one.
 *
 * Two reasons it is a call of its own rather than something folded into
 * `/scan`. First, the counter has to be on screen *before* the button is
 * pressed — the allowance used to be discoverable only by hitting it, which
 * meant a visitor learned there had been a limit from a refusal. Second, this
 * is the request that mints the session cookie the allowance is counted
 * against, and a cookie can only be set before a response body is written.
 *
 * Resolves to `null` rather than throwing on any failure, and the caller treats
 * `null` as "do not print a counter". A quota lookup that fell over must never
 * stand between somebody and a scan the server would happily have run — the
 * server checks again at `/scan` and is the only copy that binds.
 *
 * In preview mode the number is invented like everything else, and it travels
 * with the same banner.
 */
export async function fetchQuota(): Promise<ScanQuota | null> {
  if (!IS_LIVE) return { remaining: 3, limit: 3 };

  try {
    const res = await fetch(`${API_BASE}/quota`, {
      method: 'GET',
      /* The cookie is the point of this call, and `fetch` omits credentials on
         cross-origin requests by default. Same-origin in the intended setup, so
         this changes nothing there and makes local development against a remote
         WordPress behave the same way. */
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as ScanQuota;
    return typeof data?.remaining === 'number' && typeof data?.limit === 'number' ? data : null;
  } catch {
    return null;
  }
}

/**
 * The allowance **for a particular address**, asked before the button.
 *
 * `fetchQuota` above answers for the browser and the network, which is all
 * there is to answer for on page load. This asks the harder question the
 * server used to answer only once money was about to be spent: has this
 * address, and this website, got a run left?
 *
 * It exists because of how the refusal used to arrive. A visitor filled in two
 * screens, pressed Run scan, watched the progress screen appear — and was then
 * returned to an empty form with a sentence at the top explaining the address
 * had no scans left. The scan never started, the form was gone, and the only
 * way to read the message was to have already lost the three questions it was
 * about. Asking here means the refusal appears beside the field that caused
 * it, with everything else still on screen.
 *
 * POST, not a query string: the address is a lead, and a lead in a URL is a
 * lead in an access log.
 *
 * Returns `null` on any failure, and the caller treats that as "no opinion".
 * A lookup that cannot be completed must not stand between a visitor and a
 * scan the server would have allowed — `/scan` still enforces the real rule.
 */
export async function checkAllowance(email: string, domain: string): Promise<ScanQuota | null> {
  if (!IS_LIVE) return { remaining: 3, limit: 3 };

  try {
    const res = await fetch(`${API_BASE}/quota`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, domain }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as ScanQuota;
    return typeof data?.remaining === 'number' && typeof data?.limit === 'number' ? data : null;
  } catch {
    return null;
  }
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
