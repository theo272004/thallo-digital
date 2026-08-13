import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx.

   ## The shape

   A magazine masthead: a centred label and heading, a lead piece with its
   cover above the words, and the other notes indexed beside it, each with a
   thumbnail of its own. Cami's reference for it was a news index, and the note
   was that the old version did not read as a blog.

   It didn't, and the reason was the lead. The words sat *on* the photograph,
   over two scrims, in white on dark olive — which is what a hero looks like,
   not what an article card looks like. A cover is a picture with the writing
   underneath it. So the image is its own block at the top of a light card now,
   and the three cards are one material rather than one dark and two white.

   ## Two things deliberately not taken from the reference

   The reference gives every card a byline with an author's face and name.
   There is no author data here and inventing one would put a fabricated person
   on the home page, so the meta line stays what it was: category, date, read
   time.

   Its headings are set in a serif. Ours are not — `layout.tsx` reserves the
   serif for figures and says so — so the heading keeps the sans it shares with
   every other section.

   ## Destinations

   Still placeholders: there are no article routes yet, so HREF is '#' and the
   click is swallowed. When the posts become real, give each entry a `slug` and
   this becomes /blog/<slug>/ — the markup does not change. */
const ARTICLES = [
  {
    badge: 'GEO',
    date:  'June 2026',
    read:  '7 min',
    title: 'What "share of answer" really measures',
    desc:  'Rankings told you where you sat on a page nobody reads anymore. Share of answer tells you how often you are the recommendation — and it moves for reasons a position tracker cannot see.',
    /* Photographs the site already holds. None of the three appears anywhere
       else on the home page, so the section does not repeat a picture the
       reader has just scrolled past. */
    image: 'blog-lead.webp',
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

const HREF = '#';

/** Category · date · read time — the line that makes a card read as a post. */
function Meta({ a }: { a: typeof ARTICLES[number] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
      <span className="rounded-full bg-[#39471D]/10 px-2.5 py-1 text-[#39471D]">{a.badge}</span>
      <span aria-hidden="true" className="text-gray-300">·</span>
      <span>{a.date}</span>
      <span aria-hidden="true" className="text-gray-300">·</span>
      <span>{a.read} read</span>
    </span>
  );
}

export default function Testimonials() {
  const [lead, ...rest] = ARTICLES;

  return (
    /* id="blog" is the target the navbar and footer have always pointed at. */
    <section className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100" id="blog">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Masthead, centred. The old arrangement put the heading left and the
            index link right; centred is what the reference does and it is what
            the rest of the page already does, so this section stops being the
            one exception. The index link moves below the grid, where it reads
            as the end of the list rather than as a second heading. */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#39471D]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#39471D]">
            Blog
          </span>
          <h2 className="mt-5 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            Blogs &amp; guides.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_1fr]">

          {/* ── Lead note ─────────────────────────────────────────────────── */}
          <a
            href={HREF}
            onClick={(e) => e.preventDefault()}
            data-reveal
            className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/30 hover:shadow-[0_24px_60px_-20px_rgba(23,26,16,0.28)] sm:p-5"
          >
            {/* The cover. Its own block above the words, not a ground beneath
                them — that difference is most of what makes this read as an
                article rather than a banner. Scale on the image inside a fixed
                frame, so the card's corners stay put. */}
            <span className="block overflow-hidden rounded-2xl bg-[#39471D]">
              <img
                loading="lazy"
                decoding="async"
                src={`${BASE}/${lead.image}`}
                alt=""
                aria-hidden="true"
                className="aspect-[16/10] w-full select-none object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </span>

            <span className="flex flex-1 flex-col p-4 sm:p-5">
              <Meta a={lead} />

              <span className="mt-4 text-2xl font-bold leading-[1.15] tracking-tight text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D] sm:text-[1.75rem]">
                {lead.title}
              </span>

              <span className="mt-3 max-w-[52ch] text-[15px] font-medium leading-relaxed text-gray-500">
                {lead.desc}
              </span>

              {/* mt-auto pins the footer down whatever the excerpt runs to, so
                  this card and the stack beside it end level. */}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-xs font-bold text-[#39471D]">
                Read the note
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </a>

          {/* ── The rest, as an index ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {rest.map((a) => (
              <a
                key={a.title}
                href={HREF}
                onClick={(e) => e.preventDefault()}
                data-reveal
                className="group flex flex-1 items-start gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/30 hover:shadow-[0_16px_40px_-14px_rgba(23,26,16,0.22)] sm:p-6"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <Meta a={a} />

                  <span className="mt-3.5 text-lg font-bold leading-snug text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D]">
                    {a.title}
                  </span>

                  <span className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                    {a.desc}
                  </span>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-bold text-[#39471D]">
                    Read the note
                    <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>

                {/* Hidden on the narrowest screens: at full width the card is
                    already a column of text, and a 120px thumbnail beside it
                    leaves the title three words to a line. */}
                <span className="hidden shrink-0 overflow-hidden rounded-2xl bg-[#39471D] sm:block">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={`${BASE}/${a.image}`}
                    alt=""
                    aria-hidden="true"
                    className="h-[112px] w-[132px] select-none object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </span>
              </a>
            ))}
          </div>

        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={HREF}
            onClick={(e) => e.preventDefault()}
            className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-[#39471D] transition-colors hover:border-[#55672E]/40 hover:bg-[#E7ECD9]"
          >
            All notes
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
