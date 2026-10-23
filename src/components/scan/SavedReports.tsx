'use client';

import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Head, Micro, Panel, Spinner } from './ui';
import { loadAccount, loadReport, signOut, whenLabel, NO_ACCOUNT, type AccountState, type SavedScan } from '@/lib/scan/account';
import type { ScanSession } from '@/lib/scan/types';

/**
 * The shelf — every report this browser has run, on the setup screen.
 *
 * ## Why it is here and not behind a "My account" link
 *
 * The moment somebody wants an old report is the moment they arrive to run a
 * new one: they open the tool, and either they are here to scan again or they
 * are here because they remember seeing something. A navigation item would ask
 * them to know in advance which of those they are. So the shelf sits under the
 * setup form, below the fold on the first screen, where it is out of the way of
 * a first-time visitor — who has no account and never sees it at all — and one
 * scroll from a returning one.
 *
 * ## It renders nothing until it knows
 *
 * Not a skeleton, not a spinner, not a "Sign in to see your reports" card.
 * Every visitor's first visit has no account, and that is the common case: a
 * panel that flashes on load and then vanishes would be a defect on the busiest
 * path through the tool, and an empty-state card inviting people to sign in to
 * a thing with no sign-in screen would be worse. Nothing is drawn until the
 * account has come back with at least one saved scan.
 */
export default function SavedReports({ onOpen }: { onOpen: (session: ScanSession) => void }) {
  const [account, setAccount] = React.useState<AccountState>(NO_ACCOUNT);
  const [opening, setOpening] = React.useState('');
  const [failed, setFailed] = React.useState('');

  React.useEffect(() => {
    let live = true;
    loadAccount().then((next) => {
      if (live) setAccount(next);
    });
    return () => {
      live = false;
    };
  }, []);

  const open = React.useCallback(
    async (scan: SavedScan) => {
      setOpening(scan.scanId);
      setFailed('');

      const session = (await loadReport(scan.scanId)) as ScanSession | null;
      setOpening('');

      /* A row that will not open is the one failure worth naming here, because
         the visitor is looking at the evidence that it should: the row is on
         their own shelf. The likeliest cause is a scan that never finished, so
         the sentence says that rather than "something went wrong". */
      if (!session || !session.phase1) {
        setFailed(scan.scanId);
        return;
      }

      onOpen(session);
    },
    [onOpen]
  );

  if (!account.signedIn || account.scans.length === 0) return null;

  return (
    <div className="mt-5">
      <Panel>
        <Head
          badge={<FolderOpen size={18} />}
          level="section"
          title="Your saved reports"
          sub={`Every scan run from ${account.email}. They stay here — open one to read it again, or run a new scan above to add to the list.`}
        />

        <div className="mt-6 flex flex-col">
          {account.scans.map((scan) => {
            const when = whenLabel(scan.scannedAt);
            const busy = opening === scan.scanId;
            const broke = failed === scan.scanId;

            return (
              <div key={scan.scanId} className="border-b border-gray-100 py-3.5 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-gray-900">{scan.brand}</span>
                    <span className="block text-[12px] font-medium text-gray-500">
                      {scan.domain} · {scan.industry}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-4">
                    <span className="text-right">
                      {when.relative && <Micro className="block text-gray-400">{when.relative}</Micro>}
                      <span className="block text-[12px] font-medium tabular-nums text-gray-500">{when.exact}</span>
                    </span>

                    {/* A scan that never reached a report has nothing to open,
                        and a button that is going to say "not available" is
                        better not offered. */}
                    {scan.status === 'complete' ? (
                      <button
                        type="button"
                        onClick={() => open(scan)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-[12px] font-bold text-[#39471D] hover:border-[#39471D] disabled:opacity-50"
                      >
                        {busy ? <Spinner /> : null}
                        {busy ? 'Opening…' : 'Open'}
                      </button>
                    ) : (
                      <Micro className="text-gray-300">Did not finish</Micro>
                    )}
                  </span>
                </div>

                {broke && (
                  <p className="mt-2 text-[12px] font-medium text-gray-500">
                    This one could not be opened — the scan behind it did not finish. Running it again above will give you
                    a fresh report.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Sign-out is deliberately quiet and deliberately explicit about what
            it does. "Sign out" alone, on a tool with no sign-in screen, reads
            as though it might be the end of the shelf. */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => signOut().then(setAccount)}
            className="text-[12px] font-bold text-gray-400 hover:text-gray-600"
          >
            Forget me on this device
          </button>
          <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-gray-400">
            Your reports are kept. Running a scan from {account.email} again brings them back.
          </p>
        </div>
      </Panel>
    </div>
  );
}
