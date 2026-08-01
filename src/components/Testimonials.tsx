import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx.

   It used to be three identical centred cards showing category, title and read
   time, with a "Read →" that was an href="#" calling preventDefault. Nothing
   about it said "these are articles" and nothing about it said where to press:
   three equal boxes with no excerpt, no date and no byline read as feature
   tiles, not as writing. So the shape changed rather than the styling — a lead
   piece with the other notes indexed beside it, which is what a blog looks
   like, and every card is one link with the whole surface live.

   The destinations are still placeholders: there are no article routes yet, so
   HREF is '#' and the click is swallowed. When the posts become real, give each
   entry a `slug` and this becomes /blog/<slug>/ — the markup does not change. */
const ARTICLES = [
  {
    badge: 'GEO',
    date:  'June 2026',
    read:  '7 min',
    title: 'What "share of answer" really measures',
    desc:  'Rankings told you where you sat on a page nobody reads anymore. Share of answer tells you how often you are the recommendation — and it moves for reasons a position tracker cannot see.',
  },
  {
    badge: 'Content',
    date:  'May 2026',
    read:  '5 min',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate: a number only you can produce.",
  },
  {
    badge: 'Strategy',
    date:  'May 2026',
    read:  '6 min',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention resets every month. Credibility you own does not.',
  },
];

const HREF = '#';

/** Category · date · read time — the line that makes a card read as a post. */
function Meta({ a, tone = 'dark' }: { a: typeof ARTICLES[number]; tone?: 'dark' | 'light' }) {
  const dim = tone === 'light' ? 'text-[#CBD0AC]' : 'text-gray-400';
  return (
    <span className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${dim}`}>
      <span className={
        tone === 'light'
          ? 'rounded-full bg-white/15 px-2.5 py-1 text-white'
          : 'rounded-full bg-[#39471D]/10 px-2.5 py-1 text-[#39471D]'
      }>
        {a.badge}
      </span>
      <span aria-hidden="true" className={tone === 'light' ? 'text-white/30' : 'text-gray-300'}>·</span>
      <span>{a.date}</span>
      <span aria-hidden="true" className={tone === 'light' ? 'text-white/30' : 'text-gray-300'}>·</span>
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

        {/* Heading left, index link right — the masthead arrangement, rather
            than the centred block every other section on the page uses. The
            asymmetry is the first signal that this one is a library. */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-5">Blog</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans max-w-xl">
              Notes on getting found,<br />and trusted.
            </h2>
          </div>
          <a
            href={HREF}
            onClick={(e) => e.preventDefault()}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#39471D] transition-colors hover:text-[#55672E]"
          >
            All notes
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_1fr]">

          {/* ── Lead note ─────────────────────────────────────────────────── */}
          {/* Olive, like the featured plan card and the recommended column —
              the house way of saying "start here". It also gives the section a
              focal point, which three equal white boxes never had. */}
          <a
            href={HREF}
            onClick={(e) => e.preventDefault()}
            data-reveal
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#39471D] bg-[#39471D] p-8 sm:p-10 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(57,71,29,0.55)]"
          >
            {/* Half on the corner, half cropped by it — the same mark placement
                as the featured plan card, so the two read as one family. */}
            <img loading="lazy" decoding="async"
              src={`${BASE}/isotipo.png`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-[10.5rem] -right-[10.5rem] w-[26rem] rotate-[18deg] opacity-[0.11] select-none"
              style={{ filter: 'brightness(0) invert(1)' }}
            />

            <div className="relative flex flex-1 flex-col">
              <span className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBD0AC]">
                Latest note
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold leading-[1.15] tracking-tight text-white text-balance">
                {lead.title}
              </h3>

              <p className="mt-4 max-w-[52ch] text-[15px] font-medium leading-relaxed text-[#CBD0AC]">
                {lead.desc}
              </p>

              {/* mt-auto pins the footer to the bottom whatever the excerpt
                  runs to, so this card and the stack beside it end level. */}
              <div className="mt-auto pt-8">
                <Meta a={lead} tone="light" />
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#39471D] transition-colors group-hover:bg-[#E7ECD9]">
                  Read the note
                  <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </a>

          {/* ── The rest, as an index ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {rest.map((a, i) => (
              <a
                key={a.title}
                href={HREF}
                onClick={(e) => e.preventDefault()}
                data-reveal
                className="group flex flex-1 gap-5 rounded-3xl border border-gray-200 bg-white p-7 sm:p-8 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/30 hover:shadow-[0_16px_40px_-14px_rgba(23,26,16,0.22)]"
              >
                {/* The running number is what turns two cards into an index.
                    Counted from the lead, so the section reads 01, 02, 03. */}
                <span
                  aria-hidden="true"
                  className="mt-0.5 hidden shrink-0 font-mono text-[13px] font-bold tracking-widest text-gray-300 transition-colors duration-300 group-hover:text-[#55672E] sm:block"
                >
                  {String(i + 2).padStart(2, '0')}
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                  <Meta a={a} />

                  <span className="mt-4 text-lg font-bold leading-snug text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D]">
                    {a.title}
                  </span>

                  <span className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                    {a.desc}
                  </span>

                  <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#39471D]">
                    Read the note
                    <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
