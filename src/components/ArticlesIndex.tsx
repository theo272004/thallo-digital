'use client';

/**
 * The index of everything published, in this site's language.
 *
 * The articles live in WordPress; this page does not. That is the point of the
 * split — the writing tool stays where writing is comfortable, and the page a
 * visitor lands on gets the same navbar, footer, type and motion as the rest of
 * the site, because it is the rest of the site.
 *
 * It is handed the list twice. `initial` was fetched when the site was built,
 * so the HTML that ships already contains the titles and the links: this is a
 * static export, and anything fetched only in the browser reaches a crawler as
 * an empty page. Then it refetches on mount, so a note published since the last
 * deploy appears without waiting for one.
 *
 * The refetch only ever replaces the list with a longer or newer one. A failed
 * request, an empty response, or WordPress being down leaves what was already
 * on screen — this page has no state worth losing to a flaky network.
 */

import React, { useEffect, useState } from 'react';
import { fetchNotes, type Note } from '@/lib/notes';

const CARD =
  'group flex flex-col rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lift';

/** Category · date · read time — the line that makes a card read as a post. */
function Meta({ note, tone = 'light' }: { note: Note; tone?: 'light' | 'dark' }) {
  const dim = tone === 'dark' ? 'text-white/45' : 'text-gray-400';
  const dot = tone === 'dark' ? 'text-white/25' : 'text-gray-300';
  const pill = tone === 'dark' ? 'bg-white/15 text-white' : 'bg-[#39471D]/10 text-[#39471D]';

  return (
    <span className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.12em] ${dim}`}>
      {note.category && <span className={`rounded-full px-2 py-0.5 ${pill}`}>{note.category}</span>}
      {note.category && <span aria-hidden="true" className={dot}>·</span>}
      <time dateTime={note.date}>{note.dateLabel}</time>
      <span aria-hidden="true" className={dot}>·</span>
      <span>{note.minutes} min read</span>
    </span>
  );
}

/* Where a note has no featured image. A flat tint rather than a placeholder
   graphic: an icon saying "image" is a note about the CMS, and the reader did
   not come here for one. */
function Cover({ note, className }: { note: Note; className: string }) {
  if (!note.image) {
    return <div aria-hidden="true" className={`${className} bg-[#E7ECD9]`} />;
  }
  return (
    <img
      src={note.image}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`${className} object-cover`}
    />
  );
}

export default function ArticlesIndex({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initial);

  useEffect(() => {
    const controller = new AbortController();

    fetchNotes(24, controller.signal)
      .then((fresh) => {
        if (fresh.length) setNotes(fresh);
      })
      .catch(() => {
        /* Keep what was built in. */
      });

    return () => controller.abort();
  }, []);

  const [lead, ...rest] = notes;

  return (
    <section className="bg-[#F7F8F9] pb-20 pt-32 2xl:pt-40">
      <div className="mx-auto max-w-[1440px] px-6">

        <header className="mx-auto max-w-[46rem] text-center">
          <h1 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            Articles and <span className="font-serif italic font-normal text-[#39471D]">guides.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] font-medium leading-relaxed text-gray-500">
            On search, AI visibility and building authority in categories where trust decides the sale.
          </p>
        </header>

        {!notes.length ? (
          /* Build-time fetch found nothing and the browser has not answered
             yet — or WordPress is unreachable from both. Say so plainly rather
             than showing an empty grid that looks like a broken page. */
          <p className="mx-auto mt-16 max-w-[40ch] text-center text-[15px] font-medium text-gray-500">
            The notes are not loading right now. They are all still at{' '}
            <a href="https://thallodigital.com/blog/" className="text-[#39471D] underline underline-offset-2">
              thallodigital.com/blog
            </a>
            .
          </p>
        ) : (
          <>
            {/* The newest note, at the width of the page. It leads because it
                is the newest — the same reason the archive in WordPress leads
                with it — and an index where every card is the same size makes
                no argument about what to read first. */}
            <a
              href={lead.url}
              className={`${CARD} mt-14 overflow-hidden !flex-row-reverse !rounded-[28px] !border-transparent !bg-[#171A10] max-lg:!flex-col`}
            >
              <Cover note={lead} className="h-auto w-[44%] self-stretch max-lg:h-56 max-lg:w-full" />
              <div className="flex flex-1 flex-col justify-center gap-4 p-10 max-lg:p-7">
                <Meta note={lead} tone="dark" />
                <h2 className="max-w-[20ch] font-sans text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-[38px]">
                  {lead.title}
                </h2>
                <p className="max-w-[52ch] text-[15px] font-medium leading-relaxed text-white/60">{lead.excerpt}</p>
                <span className="mt-2 text-[14px] font-semibold text-[#CBD0AC] group-hover:underline">
                  Read the article ↗
                </span>
              </div>
            </a>

            {rest.length > 0 && (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((note) => (
                  <a key={note.id} href={note.url} className={`${CARD} overflow-hidden`}>
                    <Cover note={note} className="h-44 w-full" />
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <Meta note={note} />
                      <h2 className="font-sans text-[19px] font-bold leading-[1.3] tracking-tight text-gray-900">
                        {note.title}
                      </h2>
                      <p className="flex-grow text-[14px] font-medium leading-relaxed text-gray-500">{note.excerpt}</p>
                      <span className="mt-3 border-t border-gray-100 pt-4 text-[13px] font-semibold text-[#39471D] group-hover:underline">
                        Read the article ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
