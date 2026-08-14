/**
 * The posts, read out of WordPress.
 *
 * The articles are written and stored in WordPress; the index that lists them
 * is this site. That split is deliberate — WordPress is a good place to write
 * and a poor place to keep a design system, and the index is the page that has
 * to look like everything else here.
 *
 * The list is fetched twice, and both times matter:
 *
 *  · **At build**, so the deployed HTML contains real titles and real links.
 *    This site is a static export with no server, so anything fetched only in
 *    the browser reaches a crawler as an empty page — and an empty index is a
 *    strange thing to ship from a company whose product measures whether
 *    machines can read you.
 *  · **On load**, so a note published since the last deploy still appears.
 *    Without it the index is only as current as the last time somebody ran the
 *    deploy, which is not a promise worth making to whoever is writing.
 *
 * Neither call is allowed to break the page. WordPress being down at build
 * time should produce a thin index, not a failed deploy.
 */

/** Where WordPress lives. Same host, so no CORS and no configuration. */
const WP = 'https://thallodigital.com/blog/wp-json/wp/v2';

export interface Note {
  id: number;
  title: string;
  excerpt: string;
  /** Absolute, because it points at WordPress rather than at this site. */
  url: string;
  /** ISO 8601, for <time dateTime>. */
  date: string;
  /** Formatted for display — done here so the server and the browser agree. */
  dateLabel: string;
  category: string;
  image: string | null;
  minutes: number;
}

/** WordPress returns titles and excerpts as rendered HTML, entities and all. */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/* 220 words a minute, the same figure the WordPress theme uses for the number
   it prints on the post itself. Two different numbers for the same article on
   two pages of the same site is the kind of small contradiction that costs
   more trust than the feature was ever worth. */
function readingMinutes(excerpt: string, content?: string): number {
  const words = (content ?? excerpt).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

interface WpPost {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<{ name?: string; taxonomy?: string }>>;
  };
}

function toNote(post: WpPost): Note {
  const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;

  /* `wp:term` is an array of taxonomies, each an array of terms. Categories
     are the first group. "Uncategorized" is WordPress's default rather than a
     decision anybody made, so it is treated as no category at all. */
  const categories = post._embedded?.['wp:term']?.find((group) =>
    group.some((term) => term.taxonomy === 'category')
  );
  const category = categories?.[0]?.name ?? '';

  const excerpt = text(post.excerpt.rendered).replace(/\s*(Read the note|\[…\]|\[&hellip;\])\s*$/i, '');

  return {
    id: post.id,
    title: text(post.title.rendered),
    excerpt,
    url: post.link,
    date: post.date,
    dateLabel: new Date(post.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    category: /^uncategori[sz]ed$/i.test(category) ? '' : category,
    image: media,
    minutes: readingMinutes(excerpt, post.content ? text(post.content.rendered) : undefined),
  };
}

/**
 * @param limit How many to ask for. WordPress caps `per_page` at 100.
 * @param signal Lets the browser call be abandoned if the reader leaves.
 */
export async function fetchNotes(limit = 12, signal?: AbortSignal): Promise<Note[]> {
  const url = `${WP}/posts?per_page=${limit}&_embed=wp%3Afeaturedmedia%2Cwp%3Aterm&orderby=date&order=desc`;

  try {
    const response = await fetch(url, {
      signal,
      /* Revalidate hourly where a cache exists. On this static export the
         build fetches once and the browser call is uncached anyway, but the
         hint costs nothing and is correct the day this stops being static. */
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const posts: unknown = await response.json();
    if (!Array.isArray(posts)) return [];

    return posts.map((post) => toNote(post as WpPost));
  } catch {
    /* Down, slow, or unreachable. The index renders with whatever it already
       had — at build that is nothing, in the browser that is the baked list,
       and in both cases a thin page beats a broken one. */
    return [];
  }
}
