/**
 * The returning visitor.
 *
 * ## There is no sign-up, and no password
 *
 * An account here is not a thing somebody creates. It is the address they
 * already typed to get their report, remembered, plus a secret in their browser
 * proving they are the one who typed it. Running a scan is the whole of
 * registration: by the time the report is on screen the visitor has given us
 * everything an account needs, and asking them to fill in a second form to keep
 * work they have already done is friction bought with nothing.
 *
 * ## The token is not in this file, or in any file
 *
 * There is no token in `localStorage` and nothing here reads one. The plugin
 * sets an httpOnly cookie, which means no script on the page — ours or
 * anybody's — can read it, and the difference matters: a token in
 * `localStorage` is readable by every script the page ever loads, and the whole
 * of somebody's saved reports would be one third-party analytics tag away from
 * being copied. The client's side of this is simply to send credentials and be
 * told who it is.
 *
 * That is also why every function below takes no identifier. There is no
 * `getScansFor(email)` and there must never be one: an endpoint that answers
 * "whose reports would you like" hands a shelf to anybody who can guess an
 * address, and a company address is the least secret thing about a company.
 *
 * ## What it does not do yet
 *
 * The cookie is this browser. Clear it, or open the tool on a phone, and the
 * shelf is empty — the account is still there, and the next scan from the same
 * address finds it again along with everything on it, but there is no way to
 * say "it is me" from a device that has never run a scan. That is what a magic
 * link is for, and a magic link is an email, and outbound email is the open
 * item on this install. Building the recovery path on top of a mailer that
 * does not deliver would produce a sign-in screen that never signs anybody in,
 * which is worse than the honest limitation. See section 6 of
 * `docs/VISIBILITY-TOOL.md`.
 */

import { IS_LIVE, apiUrl } from './engine';

/** One row on the shelf. Deliberately not the report — see `loadReport`. */
export interface SavedScan {
  scanId: string;
  brand: string;
  domain: string;
  industry: string;
  status: string;
  /** MySQL UTC datetime, as stored. Rendered by `whenLabel` below. */
  scannedAt: string;
}

export interface AccountState {
  signedIn: boolean;
  email?: string;
  scans: SavedScan[];
}

/** What a visitor with no account looks like. Not an error state. */
export const NO_ACCOUNT: AccountState = { signedIn: false, scans: [] };

/**
 * Who this browser is.
 *
 * Never throws. A shelf that cannot be reached is an empty shelf as far as the
 * page is concerned: the account panel is an addition to the scan tool, not a
 * gate in front of it, and a visitor who came to run a scan should not be shown
 * an error about a feature they have not asked for. The failure that matters —
 * a scan that will not run — is reported by the scan itself.
 */
export async function loadAccount(): Promise<AccountState> {
  if (!IS_LIVE) return NO_ACCOUNT;

  try {
    const res = await fetch(apiUrl('/account'), { credentials: 'include' });
    if (!res.ok) return NO_ACCOUNT;

    const data = (await res.json()) as AccountState | null;
    if (!data || typeof data.signedIn !== 'boolean') return NO_ACCOUNT;

    return { ...data, scans: Array.isArray(data.scans) ? data.scans : [] };
  } catch {
    return NO_ACCOUNT;
  }
}

/**
 * One saved report, or null.
 *
 * The list endpoint returns dates and names only. A scan's state is every
 * answer from every model, which is large, and pulling fifty of them to render
 * a list of rows would be the slowest thing the tool does — so the report is
 * fetched when somebody opens it, and only then.
 *
 * Returns the same `ScanSession` shape the live runner produces, so the report
 * screen renders a saved scan and a fresh one with the same component.
 */
export async function loadReport(scanId: string): Promise<unknown | null> {
  if (!IS_LIVE) return null;

  try {
    const res = await fetch(apiUrl(`/account/scan/${scanId}`), { credentials: 'include' });
    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Signs this browser out.
 *
 * "Not on this machine", not "forget me". The account, the reports and the lead
 * all survive — the lead because it is the record of a real exchange, the
 * reports because they are the visitor's own and the next scan from the same
 * address will find them again. Erasure is a different request and it is
 * answered by a person, under the privacy policy the consent box links to.
 */
export async function signOut(): Promise<AccountState> {
  if (!IS_LIVE) return NO_ACCOUNT;

  try {
    await fetch(apiUrl('/account/forget'), { method: 'POST', credentials: 'include' });
  } catch {
    /* The cookie may well still be set. Reporting a failed sign-out is worse
       than letting the next `loadAccount` tell the truth about it. */
  }

  return NO_ACCOUNT;
}

/**
 * "3 days ago", and the date underneath it.
 *
 * The stored value is a UTC MySQL datetime with a space in it, which `Date`
 * parses inconsistently across browsers — Safari reads it as invalid. Making it
 * ISO first is the whole reason this is a function rather than an inline call.
 */
export function whenLabel(scannedAt: string): { relative: string; exact: string } {
  const iso = scannedAt.includes('T') ? scannedAt : `${scannedAt.replace(' ', 'T')}Z`;
  const at = new Date(iso);

  if (Number.isNaN(at.getTime())) return { relative: '', exact: scannedAt };

  const exact = at.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const days = Math.floor((Date.now() - at.getTime()) / 86_400_000);

  const relative =
    days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 30 ? `${days} days ago` : '';

  return { relative, exact };
}
