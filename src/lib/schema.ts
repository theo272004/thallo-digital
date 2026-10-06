import { SITE_URL } from '@/lib/site';

/**
 * Structured data, page by page.
 *
 * The root layout states who Thallo is — the Organization and the WebSite, each
 * under a stable `@id`. This file is what every other page uses to say where it
 * sits in relation to them: which site it belongs to, what it is about, and the
 * trail back to the home page.
 *
 * ## Why every page, and not just the home page
 *
 * A crawler that builds an answer rarely starts at `/`. It lands on /services/
 * from a question about pricing, or on a case study from a question about
 * results, and reads that page alone. A page that names its publisher by `@id`
 * carries the whole entity with it; a page that does not is an anonymous
 * document that happens to share a domain with one.
 *
 * Nodes refer to each other by `@id` rather than repeating themselves, so the
 * Organization is described exactly once — in `layout.tsx` — and every page
 * points at that description instead of drifting away from it.
 */

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The OfferCatalog of the three plans, described in `ServicesLanding` next to
 * the data it is read from. Declared here rather than there because the route
 * that points at it is a server component, and a value imported from a
 * 'use client' module arrives on the server as a reference, not a string.
 */
export const PLANS_ID = `${SITE_URL}/services/#plans`;

/** One step in the breadcrumb, after Home. `path` is from the domain root. */
export type Crumb = { name: string; path: string };

type Node = Record<string, unknown>;

/**
 * A page's WebPage node and its breadcrumb, as one `@graph`.
 *
 * `type` takes the more specific schema.org subtypes where one fits —
 * AboutPage, ContactPage, CollectionPage — because "this is the contact page"
 * is a fact a model can use, and "this is a web page" is not.
 *
 * `extra` is merged into the WebPage node (`mainEntity`, `about`, …) and
 * `nodes` are added to the graph beside it, so a page can describe the thing it
 * is about — a service, a case study, a tool — without a second script tag.
 */
export function pageGraph({
  type = 'WebPage',
  path,
  name,
  description,
  crumbs,
  extra = {},
  nodes = [],
}: {
  type?: string;
  path: string;
  name: string;
  description: string;
  crumbs: Crumb[];
  extra?: Node;
  nodes?: Node[];
}) {
  const url = `${SITE_URL}${path}`;
  const trail: Crumb[] = [{ name: 'Home', path: '/' }, ...crumbs];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type,
        '@id': `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
        about: { '@id': ORG_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...extra,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: trail.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: `${SITE_URL}${c.path}`,
        })),
      },
      ...nodes,
    ],
  };
}

/**
 * The text of a React node, for the places structured data has to quote what
 * the page says.
 *
 * The FAQ answers are written as JSX — they carry links and more than one
 * paragraph — and the FAQPage schema needs them as plain text. Walking the tree
 * at render keeps one copy of each answer: a second, plain-text copy kept
 * beside the first would be the one that goes stale the next time a price
 * changes, and it would go stale in the place only machines read.
 *
 * Block-level children are separated by a space so two paragraphs do not run
 * together; inline ones (a link, an emphasis) are joined as they read.
 */
export function nodeText(node: unknown): string {
  return walk(node).replace(/\s+/g, ' ').trim();
}

const BLOCK = new Set(['p', 'div', 'li', 'ul', 'ol', 'br']);

function walk(node: unknown): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(walk).join('');
  if (typeof node === 'object' && 'props' in node) {
    const { type, props } = node as { type: unknown; props: { children?: unknown; className?: string } };
    const inner = walk(props.children);
    const block =
      (typeof type === 'string' && BLOCK.has(type)) || /\bblock\b/.test(props.className ?? '');
    return block ? ` ${inner} ` : inner;
  }
  return '';
}

/**
 * Serialised for a `<script type="application/ld+json">`.
 *
 * `<` is escaped as the Next.js guide recommends: a string in the data that
 * contained `</script>` would otherwise close the tag early.
 */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
