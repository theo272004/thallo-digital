import React, { useEffect, useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE, BLOG_URL } from '@/lib/site';
import { ScrollTrigger } from '@/lib/gsap';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx.

   ## The shape

   A magazine masthead: a centred label and heading, a lead piece with its
   cover above the words, and up to three notes indexed beside it, each with a
   thumbnail of its own.

   ## The notes come from the blog

   They are the newest posts on the WordPress blog, read from its REST API in
   the browser, so a post published there shows up here without a deploy. The
   newest leads. Until 4 October 2026 this list was written by hand and never
   followed the blog.

   The layout is always one lead and three beside it. While the blog has fewer
   than four posts, the empty places are filled from PLANNED: notes that are
   coming, shown as such — no link, no date, a "Coming soon" badge. Each one
   gives way to a real post as soon as there is one to show.

   FALLBACK is what the page ships with and what it keeps if the API cannot be
   reached: the posts that were live when it was written, with the same fields
   the API gives. It is never shown as anything but real posts.

   ## Why the slots are fixed

   `useRevealBatch` collects every `[data-reveal]` once, when the page mounts.
   A card that mounted later would never be revealed and would sit there at
   opacity 0. So there are always four slots, keyed by position: the fetch
   changes what is in them, never how many there are. A slot is always the
   same <a>: a planned note simply has no href, which is not a link at all.

   ## Pictures

   A published post shows its featured image — the same picture the blog
   itself uses as that post's cover — so the card and the post always match.
   Change the featured image in WordPress and the card follows. A planned note
   has no post to take one from, so it keeps one of the site's photographs.

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
  /** The live URL. Absent means the note is planned, not published. */
  href?: string;
  /** Publication date. Only a published post has one. */
  date?: string;
  read?: string;
  /** The post's featured image. Absent on a planned note. */
  image?: string;
};

const SLOTS = 4;

/* Photographs the site already holds, by slot — the picture for a planned
   note, which has no featured image of its own. */
const IMAGES = ['blog-lead.webp', 'buyers-bg.webp', 'case-film-bg.webp', 'measured-bg.webp'];

const FALLBACK: Article[] = [
  {
    badge: 'AI Visibility',
    date:  'October 2026',
    read:  '7 min',
    title: 'How to Find, Choose, and Track the Questions Your Buyers Ask AI',
    desc:  'Useful prompt tracking starts with the questions that shape a buying decision. Learn how to find those questions inside your business, choose which ones are worth tracking, and build a consistent set that shows where your company appears in AI recommendations over time.',
    href:  'https://thallodigital.com/blog/prompt-tracking-buyer-questions/',
    image: 'https://thallodigital.com/blog/wp-content/uploads/2026/08/bannercito-doc.jpg',
  },
  {
    badge: 'AI Visibility',
    date:  'October 2026',
    read:  '8 min',
    title: 'How to See What AI Tells Your Buyers About Your Competitors',
    desc:  'See which competitors AI recommends to your buyers, why they appear in those answers, and where your company can close the gap. AI competitor analysis helps you uncover the questions, sources, and positioning shaping AI recommendations.',
    href:  'https://thallodigital.com/blog/ai-competitor-analysis/',
    image: 'https://thallodigital.com/blog/wp-content/uploads/2026/08/bannercito-doc.jpg',
  },
  {
    badge: 'Blog',
    date:  'August 2026',
    read:  '4 min',
    title: 'Ranking first and being named are not the same thing',
    desc:  'Search used to hand your buyer ten links and let them choose. Now it hands them an answer with three companies in it. Being one of those three is a different problem from ranking, and it has different fixes.',
    href:  'https://thallodigital.com/blog/ranking-first-and-being-named/',
    image: 'https://thallodigital.com/blog/wp-content/uploads/2026/08/bannercito-doc.jpg',
  },
];

/* The notes that fill the layout while the blog has fewer than four posts. */
const PLANNED: Article[] = [
  {
    badge: 'GEO',
    title: 'What "share of answer" really measures',
    desc:  'Rankings told you where you sat on a page nobody reads anymore. Share of answer tells you how often you are the recommendation.',
  },
  {
    badge: 'Content',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate: a number only you can produce.",
  },
  {
    badge: 'Strategy',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention resets every month. Credibility you own does not.',
  },
];

type WPPost = {
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    'wp:term'?: { taxonomy: string; name: string }[][];
    'wp:featuredmedia'?: { source_url?: string }[];
  };
};

/** WordPress hands back HTML with entities; the cards want plain text. */
function text(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function toArticle(p: WPPost): Article {
  const category = (p._embedded?.['wp:term'] ?? [])
    .flat()
    .find((t) => t.taxonomy === 'category' && t.name !== 'Uncategorized');
  /* Read time at 225 words a minute, the rate the hand-written cards used. */
  const words = text(p.content.rendered).split(' ').filter(Boolean).length;
  return {
    badge: category ? text(category.name) : 'Blog',
    title: text(p.title.rendered),
    desc:  text(p.excerpt.rendered).replace(/\s*(\[(…|&hellip;|\.\.\.)\]|…)$/, '').trim(),
    href:  p.link,
    date:  new Date(p.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    read:  `${Math.max(1, Math.ceil(words / 225))} min`,
    image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url,
  };
}

/** The newest posts on the blog, or FALLBACK until (and unless) they arrive. */
function usePosts(): Article[] {
  const [posts, setPosts] = useState<Article[]>(FALLBACK);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${BLOG_URL}wp-json/wp/v2/posts?per_page=${SLOTS}&_embed=wp:term,wp:featuredmedia&_fields=date,link,title,excerpt,content,_links,_embedded`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: WPPost[]) => {
        if (Array.isArray(data) && data.length) setPosts(data.map(toArticle));
      })
      .catch(() => {
        /* Offline, blocked or down: the fallback stays, which is real posts. */
      });
    return () => ctrl.abort();
  }, []);

  /* A slot that appeared or vanished moves everything under it; the reveal
     triggers further down need their positions measured again. */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [posts]);

  return posts;
}

/**
 * Category · date · read time — the line that makes a card read as a post.
 *
 * A planned note has no date and no read time to state, so it says so instead
 * of borrowing a plausible-looking one.
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
   under the cursor is promising a click, and a planned note has none to give. */
const CARD =
  'flex rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';
const CARD_LINK = 'group lift';

/* A dark olive gradient over every cover — Cami, 5 October — so the
   pictures sit in the site's green whatever the blog uploads. Darkest at the
   foot, easing off towards the top, like the scrims on the dark panels. */
const PHOTO_TINT =
  'linear-gradient(to top, rgba(23,26,16,.78) 0%, rgba(57,71,29,.45) 55%, rgba(57,71,29,.15) 100%)';

/**
 * One slot. Always the same <a>, so React updates it in place when the posts
 * arrive instead of mounting a new element the reveal never saw. A planned
 * note has no href, and an <a> without one is not a link: no cursor, no focus,
 * nothing to open — see "Why the slots are fixed".
 */
function CardShell({ a, className, children }: { a: Article; className: string; children: React.ReactNode }) {
  return (
    <a href={a.href} data-reveal className={`${CARD} ${a.href ? CARD_LINK : ''} ${className}`}>
      {children}
    </a>
  );
}

export default function Testimonials() {
  const posts = usePosts();
  /* Real posts first, newest leading; planned notes fill what is left. */
  const slots = Array.from({ length: SLOTS }, (_, i) => posts[i] ?? PLANNED[(i - posts.length) % PLANNED.length]);
  const [lead, ...rest] = slots;

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
            <span className="relative block overflow-hidden rounded-2xl bg-[#39471D]">
              <img
                loading="lazy"
                decoding="async"
                src={lead.image ?? `${BASE}/${IMAGES[0]}`}
                alt=""
                aria-hidden="true"
                className="aspect-[16/9] w-full select-none object-cover"
              />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: PHOTO_TINT }} />
            </span>

            <span className="flex flex-1 flex-col p-4">
              <Meta a={lead} />

              <span className="mt-3 text-xl font-bold leading-[1.2] tracking-tight text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D] sm:text-2xl">
                {lead.title}
              </span>

              <span className="mt-2.5 max-w-[52ch] text-sm font-medium leading-relaxed text-gray-500 line-clamp-4">
                {lead.desc}
              </span>

              {/* mt-auto pins the footer down whatever the excerpt runs to, so
                  this card and the stack beside it end level. There is nothing
                  to pin on a planned note: "Read the note" is an instruction
                  that would not work if followed. */}
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
            {/* Keyed by position, not title: a new post must refill a slot,
                not replace it. */}
            {rest.map((a, i) => (
              <CardShell key={i} a={a} className="flex-1 items-start gap-4 p-4">
                <span className="flex min-w-0 flex-1 flex-col">
                  <Meta a={a} />

                  <span className="mt-2.5 text-base font-bold leading-snug text-gray-900 text-balance transition-colors duration-300 group-hover:text-[#39471D]">
                    {a.title}
                  </span>

                  {/* Only an excerpt from the blog runs long enough to need the clamp. */}
                  <span className={`mt-1.5 text-[13px] font-medium leading-relaxed text-gray-500 ${a.href ? 'line-clamp-2' : ''}`}>
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
                <span className="relative hidden shrink-0 overflow-hidden rounded-xl bg-[#39471D] sm:block">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={a.image ?? `${BASE}/${IMAGES[i + 1]}`}
                    alt=""
                    aria-hidden="true"
                    className="h-[88px] w-[104px] select-none object-cover"
                  />
                  <span aria-hidden="true" className="absolute inset-0" style={{ background: PHOTO_TINT }} />
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
            Read our blog
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
