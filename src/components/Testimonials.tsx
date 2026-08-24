import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx.

   ## The shape

   A magazine masthead: a centred label and heading, a lead piece with its
   cover above the words, and three notes indexed beside it, each with a
   thumbnail of its own.

   ## The lead is the only published post

   Only the first of these four exists. It is the post published on the
   WordPress blog on 8 August, and its link, date and excerpt are the ones the
   REST API returns. Its read time is counted from the Markdown in
   `content/blog/` at 225 words a minute rather than guessed at.

   It leads because it is the newest — a list of notes ordered by date with the
   newest not first is a broken list — and because a lead card that goes
   nowhere is the weakest thing a section like this can have.

   The other three are planned, not published, and the markup says so: a card
   without an `href` is not an anchor at all, carries a "Coming soon" badge in
   place of its date, and drops the "Read the note" line. They used to be
   `<a href="#">` with the click swallowed, which is a broken link dressed as a
   working one — the reader clicks, nothing happens, and the section that is
   meant to prove we publish proves the opposite.

   When one of them is published, give it a `href` and a real `date` and it
   becomes a live card with no other change.

   ## Two things deliberately not taken from the reference

   The reference gives every card a byline with an author's face and name.
   There is no author data here and inventing one would put a fabricated person
   on the home page, so the meta line stays category, date, read time.

   Its headings are set in a serif. Ours are not — `layout.tsx` reserves the
   serif for figures and says so. */
type Article = {
  badge: string;
  title: string;
  desc: string;
  image: string;
  /** The live URL. Absent means the post is not published yet. */
  href?: string;
  /** Publication date. Only a published post has one. */
  date?: string;
  /** Counted from the Markdown, so only a written post has one. */
  read?: string;
};

const ARTICLES: Article[] = [
  {
    badge: 'GEO',
    date:  'August 2026',
    read:  '4 min',
    title: 'Ranking first and being named are not the same thing',
    desc:  'Search used to hand your buyer ten links and let them choose. Now it hands them an answer with three companies in it. Being one of those three is a different problem from ranking, and it has different fixes.',
    /* Photographs the site already holds. None of the four appears anywhere
       else on the home page, so the section does not repeat a picture the
       reader has just scrolled past. */
    image: 'blog-lead.webp',
    href:  'https://thallodigital.com/blog/2026/08/08/ranking-first-and-being-named/',
  },
  {
    badge: 'GEO',
    title: 'What "share of answer" really measures',
    desc:  'Rankings told you where you sat on a page nobody reads anymore. Share of answer tells you how often you are the recommendation.',
    image: 'buyers-bg.webp',
  },
  {
    badge: 'Content',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate: a number only you can produce.",
    image: 'case-film-bg.webp',
  },
  {
    badge: 'Strategy',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention resets every month. Credibility you own does not.',
    image: 'measured-bg.webp',
  },
];

/**
 * Category · date · read time — the line that makes a card read as a post.
 *
 * An unpublished note has no date and no read time to state, so it says so
 * instead of borrowing a plausible-looking one. A date on a post that does not
 * exist is the same lie as a link that goes nowhere, told more quietly.
 */
function Meta({ a }: { a: Article }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
      <span className="rounded-full bg-[#39471D]/10 px-2 py-0.5 text-[#39471D]">{a.badge}</span>
      {a.href ? (
        <>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span>{a.date}</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span>{a.read} read</span>
        </>
      ) : (
        <>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="text-gray-400">Coming soon</span>
        </>
      )}
    </span>
  );
}

/* The whole card lifts and settles on hover. It used to be the photograph that
   moved, zooming inside a fixed frame while the card stayed put — which read
   as the picture reacting rather than the link. The images hold still now and
   the card is what answers to the cursor.

   Only a card that goes somewhere gets `group` and `lift`. A card that lifts
   under the cursor is promising a click, and an unpublished note has none to
   give — the hover state is how a reader finds out whether a thing is a link
   before they spend a click on it. */
const CARD =
  'flex rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';
const CARD_LINK = 'group lift';

/**
 * A card is an anchor when the post exists and a plain box when it does not.
 *
 * The three unpublished notes used to be `<a href="#">` with the click
 * swallowed in JS: a link by every signal a browser gives — cursor, focus
 * ring, status bar, "open in new tab" — that did nothing when clicked. This
 * renders them as what they are, so nothing offers a click there in the first
 * place.
 */
function CardShell({ a, className, children }: { a: Article; className: string; children: React.ReactNode }) {
  if (!a.href) {
    return (
      <div data-reveal className={`${CARD} ${className}`}>
        {children}
      </div>
    );
  }
  return (
    <a href={a.href} data-reveal className={`${CARD} ${CARD_LINK} ${className}`}>
      {children}
    </a>
  );
}

export default function Testimonials() {
  const [lead, ...rest] = ARTICLES;

  return (
    /* id="blog" is the target the navbar and footer have always pointed at. */
    <section className="bg-[#F7F8F9] pt-6 pb-16 2xl:pt-8 2xl:pb-20 border-b border-gray-100" id="blog">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Masthead, centred — the index link sits below the grid, where it
            reads as the end of the list rather than as a second heading.

            No label pill above the heading. The reference has one, but its
            heading is "Our recent news & insights" and the pill is what tells
            you the section is a newspaper; ours already says "Blogs & guides"
            in type twice the size, so the pill was the same word said quieter
            directly above itself.

            The heading is `text-4xl sm:text-5xl`, which is what every other h2
            on the site is. It briefly was not, and a section heading set a step
            smaller than its neighbours does not read as restraint — it reads as
            a mistake. */}
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            Blogs &amp; guides.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_1fr]">

          {/* ── Lead note ─────────────────────────────────────────────────── */}
          <CardShell a={lead} className="flex-col p-3">
            {/* The cover: its own block above the words, not a ground beneath
                them. 16:9 rather than 16:10 — with three notes beside it now
                instead of two, the taller crop pushed the lead's own text past
                the bottom of the stack. */}
            <span className="block overflow-hidden rounded-2xl bg-[#39471D]">
              <img
                loading="lazy"
                decoding="async"
                src={`${BASE}/${lead.image}`}
                alt=""
                aria-hidden="true"
                className="aspect-[16/9] w-full select-none object-cover"
              />
            </span>

            <span className="flex flex-1 flex-col p-4">
              <Meta a={lead} />

              <span className="mt-3 text-xl font-bold leading-[1.2] tracking-tight text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D] sm:text-2xl">
                {lead.title}
              </span>

              <span className="mt-2.5 max-w-[52ch] text-sm font-medium leading-relaxed text-gray-500">
                {lead.desc}
              </span>

              {/* mt-auto pins the footer down whatever the excerpt runs to, so
                  this card and the stack beside it end level. There is nothing
                  to pin on an unpublished note: "Read the note" is an
                  instruction that would not work if followed. */}
              {lead.href && (
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[11px] font-bold text-[#39471D]">
                  Read the note
                  <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              )}
            </span>
          </CardShell>

          {/* ── The rest, as an index ─────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {rest.map((a) => (
              <CardShell key={a.title} a={a} className="flex-1 items-start gap-4 p-4">
                <span className="flex min-w-0 flex-1 flex-col">
                  <Meta a={a} />

                  <span className="mt-2.5 text-base font-bold leading-snug text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D]">
                    {a.title}
                  </span>

                  <span className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-500">
                    {a.desc}
                  </span>

                  {a.href && (
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[11px] font-bold text-[#39471D]">
                      Read the note
                      <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  )}
                </span>

                {/* Hidden on the narrowest screens: at full width the card is
                    already a column of text, and a thumbnail beside it leaves
                    the title three words to a line. */}
                <span className="hidden shrink-0 overflow-hidden rounded-xl bg-[#39471D] sm:block">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={`${BASE}/${a.image}`}
                    alt=""
                    aria-hidden="true"
                    className="h-[88px] w-[104px] select-none object-cover"
                  />
                </span>
              </CardShell>
            ))}
          </div>

        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="https://thallodigital.com/blog/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#39471D] bg-[#39471D] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-[#55672E] hover:bg-[#55672E]"
          >
            All notes
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
