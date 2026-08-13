import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx.

   ## The shape

   A magazine masthead: a centred label and heading, a lead piece with its
   cover above the words, and three notes indexed beside it, each with a
   thumbnail of its own.

   ## The lead is the only real post

   Three of these four are still copy written to fill the slot, with `href`
   '#' and the click swallowed. The first is not: it is the post published on
   the WordPress blog on 8 August, and its link, date and excerpt are the ones
   the REST API returns. Its read time is counted from the Markdown in
   `content/blog/` at 225 words a minute rather than guessed at.

   It leads because it is the newest — a list of notes ordered by date with the
   newest not first is a broken list — and because a lead card that goes
   nowhere is the weakest thing a section like this can have.

   When the other three become real, give each a `href` and the markup does not
   change.

   ## Two things deliberately not taken from the reference

   The reference gives every card a byline with an author's face and name.
   There is no author data here and inventing one would put a fabricated person
   on the home page, so the meta line stays category, date, read time.

   Its headings are set in a serif. Ours are not — `layout.tsx` reserves the
   serif for figures and says so. */
const ARTICLES = [
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
    date:  'June 2026',
    read:  '7 min',
    title: 'What "share of answer" really measures',
    desc:  'Rankings told you where you sat on a page nobody reads anymore. Share of answer tells you how often you are the recommendation.',
    image: 'buyers-bg.webp',
  },
  {
    badge: 'Content',
    date:  'May 2026',
    read:  '5 min',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate: a number only you can produce.",
    image: 'case-film-bg.webp',
  },
  {
    badge: 'Strategy',
    date:  'May 2026',
    read:  '6 min',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention resets every month. Credibility you own does not.',
    image: 'measured-bg.webp',
  },
];

type Article = typeof ARTICLES[number];

/** Category · date · read time — the line that makes a card read as a post. */
function Meta({ a }: { a: Article }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
      <span className="rounded-full bg-[#39471D]/10 px-2 py-0.5 text-[#39471D]">{a.badge}</span>
      <span aria-hidden="true" className="text-gray-300">·</span>
      <span>{a.date}</span>
      <span aria-hidden="true" className="text-gray-300">·</span>
      <span>{a.read} read</span>
    </span>
  );
}

/* The whole card lifts and settles on hover. It used to be the photograph that
   moved, zooming inside a fixed frame while the card stayed put — which read
   as the picture reacting rather than the link. The images hold still now and
   the card is what answers to the cursor. */
const CARD =
  'group flex rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-[#55672E]/30 hover:shadow-[0_22px_50px_-18px_rgba(23,26,16,0.3)]';

export default function Testimonials() {
  const [lead, ...rest] = ARTICLES;
  const swallow = (a: Article) => (e: React.MouseEvent) => {
    if (!a.href) e.preventDefault();
  };

  return (
    /* id="blog" is the target the navbar and footer have always pointed at. */
    <section className="bg-[#F7F8F9] py-16 2xl:py-20 border-b border-gray-100" id="blog">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Masthead, centred — the index link sits below the grid, where it
            reads as the end of the list rather than as a second heading. */}
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#39471D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#39471D]">
            Blog
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-4xl">
            Blogs &amp; guides.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_1fr]">

          {/* ── Lead note ─────────────────────────────────────────────────── */}
          <a
            href={lead.href ?? '#'}
            onClick={swallow(lead)}
            data-reveal
            className={`${CARD} flex-col p-3`}
          >
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
                  this card and the stack beside it end level. */}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[11px] font-bold text-[#39471D]">
                Read the note
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </a>

          {/* ── The rest, as an index ─────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {rest.map((a) => (
              <a
                key={a.title}
                href={a.href ?? '#'}
                onClick={swallow(a)}
                data-reveal
                className={`${CARD} flex-1 items-start gap-4 p-4`}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <Meta a={a} />

                  <span className="mt-2.5 text-base font-bold leading-snug text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D]">
                    {a.title}
                  </span>

                  <span className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-500">
                    {a.desc}
                  </span>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[11px] font-bold text-[#39471D]">
                    Read the note
                    <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
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
              </a>
            ))}
          </div>

        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="https://thallodigital.com/blog/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-bold text-[#39471D] transition-colors hover:border-[#55672E]/40 hover:bg-[#E7ECD9]"
          >
            All notes
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
