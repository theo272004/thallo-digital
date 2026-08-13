import React from 'react';
import SpinFlower from '@/components/ui/SpinFlower';
// import Partners from '@/components/Partners'; ← restore with the hidden team section below
import AuditCTA from '@/components/AuditCTA';
import { BASE } from '@/lib/site';

/**
 * The About page.
 *
 * Stripe's account review wants a page that says plainly what the company does
 * and who is behind it. This carries both at length, and it is where the
 * footer's "About" points — the page is deliberately not in the top navigation,
 * which is reserved for what a buyer is shopping for.
 *
 * The copy is Cami's, from a design she supplied. What is not hers is the
 * styling: the source she handed over was a standalone page in a different
 * palette (a warm paper ground, forest #2d4a2b, Fraunces italics for emphasis),
 * and this site emphasises with colour rather than by swapping typeface
 * mid-sentence. So the words are transplanted and the surfaces are the site's —
 * white sections divided by hairlines, ink and forest panels, the same card
 * shell the rest of the site uses.
 *
 * Every claim is one the site can stand behind. An about page is exactly the
 * wrong place to introduce a founding date, a client count, or a headcount that
 * nobody has confirmed.
 */

/** The positions. Six, and the number is part of the claim. */
const BELIEFS = [
  {
    n: '01',
    title: 'Depth beats volume',
    copy: 'One piece of research worth citing does more than forty posts nobody finishes. We would rather publish less and have it matter.',
  },
  {
    n: '02',
    title: 'Measure what matters',
    /* Split around a link: this is the one belief the site can prove rather
       than assert, because the measurement is published and runnable. */
    copy: ['Traffic and rankings are proxies. We track how often the models name you against ', 'the questions your buyers actually ask', ', and report on that.'],
    href: `${BASE}/thallo-ai/`,
  },
  {
    n: '03',
    title: 'Straight answers',
    copy: 'You hear where the work stands without having to chase it, including when something is not moving the way we expected.',
  },
  {
    n: '04',
    title: 'Research over opinion',
    copy: 'Anyone can hold a position. What gets cited is the work that brings something to the table nobody else could have produced.',
  },
  {
    n: '05',
    title: 'Focus over reach',
    copy: 'A few categories, understood properly. We would rather know one market’s buying behaviour deeply than know ten of them vaguely.',
  },
  {
    n: '06',
    title: 'Build for what comes next',
    copy: 'The channels will keep changing. Being the source buyers and models trust does not. We build for the part that holds.',
  },
];

/** How an engagement actually runs. */
const HOW = [
  {
    title: 'Genuinely invested',
    copy: 'Small enough that every engagement gets real attention, not whatever is left after the bigger accounts.',
  },
  {
    title: 'You approve, we run',
    copy: 'You set direction and sign off. Execution, publishing and distribution are ours.',
  },
  {
    title: 'Few clients at a time',
    copy: 'Capacity is capped on purpose. Depth is not possible across twenty accounts.',
  },
  {
    title: 'Reporting you can read',
    copy: 'Monthly, in plain language, tied to what moved rather than what happened.',
  },
];

const FIT = [
  'Your buyers research hard before they commit',
  'You know more than your market can currently see',
  'You want an asset that keeps working, not rented attention',
  'You would rather hear the truth than be managed',
];

export default function AboutLanding() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-6 text-center">
          <h1 className="mb-6 max-w-[17ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            We built Thallo for a <span className="text-[#39471D]">market that changed.</span>
          </h1>
          <p className="mb-10 max-w-[56ch] text-base font-medium leading-relaxed text-gray-500">
            Search stopped sending buyers to websites. The playbook most agencies still sell was designed for a world
            that no longer exists. This is what we think replaced it.
          </p>
          <SpinFlower alt="Thallo" className="block h-20 w-20 opacity-80" />
        </div>
      </section>

      {/* ── The belief the business rests on ──────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#171A10] p-9 sm:p-14">
            {/* The one flourish the source panel had: a soft olive bloom off the
                top-right corner, so a large block of dark is not a flat slab. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[8%] -top-[35%] h-[460px] w-[460px]"
              style={{ background: 'radial-gradient(circle, rgba(203,208,172,.15), transparent 68%)' }}
            />
            {/* Stretch rather than centre: the photograph is a column of this
                panel, not an ornament floating in the middle of one. Centred, it
                sat 224px tall beside 377px of prose and left a band of bare dark
                above and below it. */}
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-14">
              <div>
                <h2 className="mb-6 max-w-[18ch] font-sans text-3xl font-bold leading-[1.07] tracking-tight text-white sm:text-4xl">
                  Authority is the one asset <span className="text-[#CBD0AC]">that appreciates.</span>
                </h2>
                <div className="flex flex-col gap-4">
                  <p className="max-w-[60ch] text-[15px] font-medium leading-relaxed text-white/65">
                    Ads stop the day you stop paying. Rankings move with every update.{' '}
                    <strong className="font-semibold text-white">Authority compounds.</strong> Every study you publish,
                    every citation you earn, every room where your name comes up makes the next one easier.
                  </p>
                  <p className="max-w-[60ch] text-[15px] font-medium leading-relaxed text-white/65">
                    That mattered before. It matters more now that anyone can generate a thousand articles in an
                    afternoon. When content becomes infinite, the only thing that carries weight is the work a machine
                    could not have produced: research nobody else could run, judgment earned in a specific field, a point
                    of view somebody is willing to sign.
                  </p>
                  <p className="max-w-[60ch] text-[15px] font-medium leading-relaxed text-white/65">
                    That is the whole business. We build that for companies where the decision is expensive enough that
                    buyers do their homework first.
                  </p>
                </div>
              </div>

              {/* A photograph rather than the source's dashed "Image" box. The
                  site holds this one already and it is otherwise unused.

                  Fixed 4:3 while the panel is stacked, then full height once it
                  is a column — the source photograph is landscape, so a portrait
                  frame at every width would have cropped it to a stripe of desk. */}
              <div className="aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE}/notebook-desk.webp`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why the company exists ────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-[#F7F8F9] py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <h2 className="max-w-[14ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
              Why Thallo <span className="text-[#39471D]">exists.</span>
            </h2>
            <div className="flex flex-col gap-5">
              <p className="max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
                There is a gap in this market, and it is a strange one. At one end, agencies producing content so generic
                that a language model now does it faster and free. At the other, firms charging ten thousand a month and
                up, working only with companies that already have the budget to be everywhere.
              </p>
              <p className="max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
                In between sits a large group of good companies in serious categories.{' '}
                <strong className="font-semibold text-gray-900">
                  They have the expertise. They do not have the visibility.
                </strong>{' '}
                Their buyers are researching right now and finding somebody else.
              </p>
              <p className="max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
                Thallo was built for that middle. Senior thinking and original work, at a price a growing company can
                defend to its board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The positions ─────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
              What we <span className="text-[#39471D]">believe.</span>
            </h2>
            <p className="mx-auto max-w-[54ch] text-base font-medium leading-relaxed text-gray-500">
              Six positions that decide how we work, who we take on, and what we refuse to do.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BELIEFS.map((b) => (
              <div
                key={b.n}
                data-reveal
                className="rounded-3xl border border-gray-200 bg-white p-8 lift transition-all duration-300"
              >
                <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{b.n}</span>
                <h3 className="mb-2.5 font-sans text-xl font-semibold tracking-tight text-gray-900">{b.title}</h3>
                <p className="text-[15px] font-medium leading-relaxed text-gray-500">
                  {Array.isArray(b.copy) ? (
                    <>
                      {b.copy[0]}
                      <a href={b.href} className="font-semibold text-[#39471D] underline underline-offset-2">
                        {b.copy[1]}
                      </a>
                      {b.copy[2]}
                    </>
                  ) : (
                    b.copy
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How an engagement runs ────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-[#F7F8F9] py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
            <div>
              <h2 className="mb-4 max-w-[15ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
                How we <span className="text-[#39471D]">work.</span>
              </h2>
              <p className="max-w-[52ch] text-base font-medium leading-relaxed text-gray-500">
                Thallo is deliberately small. The people who scope your engagement are the people who do it, and there is
                no account layer between you and the work.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {HOW.map((h) => (
                <div key={h.title} data-reveal className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-2 font-sans text-base font-semibold tracking-tight text-gray-900">{h.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-500">{h.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who this is for ───────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="rounded-3xl bg-[#39471D] p-9 sm:p-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14">
              <h2 className="max-w-[12ch] font-sans text-3xl font-bold leading-[1.07] tracking-tight text-white sm:text-4xl">
                We are a good fit <span className="text-[#CBD0AC]">if.</span>
              </h2>
              <ul className="flex flex-col">
                {FIT.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3.5 border-b border-white/15 py-4 text-[15px] font-medium leading-snug text-white/90 last:border-b-0"
                  >
                    <span aria-hidden className="mt-0.5 shrink-0 text-sm text-[#CBD0AC]">
                      &rarr;
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIDDEN: who runs it ───────────────────────────────────────────────
          <Partners /> — the team section — is not in the design this page was
          rewritten from, and that design is the text of the page.

          Two things it took with it, both worth knowing before this stays off
          for good:

           · it was the only place the site names the people behind the company,
             which is what a payment processor's account review looks for on an
             about page. That is why it was put here.
           · the footer's "The partners" link pointed at its #team anchor, so
             that link is commented out too. Restoring one means restoring both.

          <Partners />
       ─────────────────────────────────────────────────────────────────────── */}

      <AuditCTA
        image={`${BASE}/cta-bg.webp`}
        heading="Find out where you actually stand."
        copy="An AI visibility audit shows how your category looks today, where the authority sits, and what it takes to move. Fixed scope, and a roadmap you keep either way."
      />
    </>
  );
}
