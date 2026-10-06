/**
 * The site, as the machines read it.
 *
 * Runs after `next build` (it is the `postbuild` script, so the deploy picks it
 * up without a change to the workflow) and writes three things into `out/`:
 *
 *   /llms.txt          The index: who Thallo is, what it sells and for how much,
 *                      and every page with a one-line summary — the format
 *                      proposed at llmstxt.org.
 *   /<page>/index.md   Each page in the sitemap as clean Markdown: the content
 *                      of <main>, without the navigation, the animation markup,
 *                      the cookie banner or 100 KB of framework payload.
 *   /llms-full.txt     The index followed by every page, in one file, for an
 *                      agent that wants the whole site in one request.
 *
 * and adds a `<link rel="alternate" type="text/markdown">` to each page's
 * <head>, so an agent that lands on the HTML can find the Markdown.
 *
 * ## Why it reads the built HTML, not the source
 *
 * The copy lives in JSX, spread over forty components. A hand-written llms.txt
 * would be a second copy of it, and the first thing to go stale — the audit
 * price has changed once already, and a stale price in a file only machines
 * read is a stale price nobody notices. Read off the export, every figure here
 * is the figure the page shows, by construction.
 *
 * The same goes for the facts in the index: the description, the plans and
 * their prices, the FAQ. They come from the JSON-LD the pages already carry,
 * which is itself read from the data the pages render.
 *
 * ## Why the text is ASCII
 *
 * Bluehost serves .txt and .md as `text/plain` with no charset, and a client
 * left to guess — Python's `requests` among them — guesses Latin-1, which turns
 * every em dash into "â€”". `deploy/htaccess-agent-files.conf` fixes the header;
 * until it is pasted in, the typographic punctuation is folded to its ASCII
 * equivalent so nothing depends on it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const OUT = 'out';
const SITE_URL = 'https://thallodigital.com';
/* The same switch `next.config.ts` reads. Every href in the export carries it,
   and every URL written here is the canonical domain, so it is stripped. */
const BASE = process.env.DEPLOY_TARGET === 'bluehost' ? '' : '/thallo-digital';
const BLOG_URL = `${SITE_URL}/blog/`;
const RESEARCH_URL = `${SITE_URL}/ai-shortlist/`;

if (!fs.existsSync(path.join(OUT, 'sitemap.xml'))) {
  console.error('agent-files: no out/sitemap.xml — run `next build` first.');
  process.exit(1);
}

// ─── HTML → Markdown ─────────────────────────────────────────────────────────

const SKIP = new Set(['script', 'style', 'svg', 'noscript', 'template', 'canvas', 'video', 'audio', 'iframe', 'input', 'select', 'textarea', 'option']);
const BLOCK = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'aside', 'form', 'fieldset', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'details', 'summary', 'nav', 'label', 'blockquote', 'table', 'tr', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'pre']);

function absolute(href) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  const p = BASE && href.startsWith(BASE) ? href.slice(BASE.length) || '/' : href;
  return `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`;
}

/**
 * Hidden on purpose: aria-hidden decoration (the marquee's second copy, icon
 * glyphs), the `hidden` attribute, and anything marked `data-md="skip"` — the
 * hero's mock-up of a ChatGPT answer, which as plain text would read as a real
 * one.
 */
function skipped(el) {
  return (
    SKIP.has(el.rawTagName?.toLowerCase()) ||
    el.getAttribute?.('aria-hidden') === 'true' ||
    el.hasAttribute?.('hidden') ||
    el.getAttribute?.('data-md') === 'skip'
  );
}

function inline(nodes) {
  return nodes.map(render).join('');
}

/* Tailwind lays a page out with classes, not tags: two <span class="block">
   inside an <h1> are two lines, and three chips in a `flex` row are three
   words. Read as HTML they run together — "Become the nameyour market" — so
   the display classes are read as the layout they stand for. */
const BLOCKISH = /(^|\s)(block|flex|grid|table)(\s|$)/;
const INLINEISH = /(^|\s)inline-(block|flex|grid)(\s|$)/;

/** The page being converted, for the note that stands in for a form. */
let current = '';

function render(node) {
  if (node.nodeType === 3) return node.text.replace(/\s+/g, ' ');
  if (node.nodeType !== 1 || skipped(node)) return '';

  const tag = node.rawTagName.toLowerCase();
  const cls = node.getAttribute('class') ?? '';
  const kids = () => inline(node.childNodes);

  switch (tag) {
    case 'br':
      return '\n';
    case 'hr':
      return '\n\n---\n\n';
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const text = clean(kids()).replace(/\s*\n\s*/g, ' ');
      return text ? `\n\n${'#'.repeat(Number(tag[1]))} ${text}\n\n` : '';
    }
    case 'a': {
      const href = absolute(node.getAttribute('href'));
      const text = clean(kids());
      if (!text) return '';
      if (!href) return text;
      // A whole card wrapped in one link: its lines become one label.
      const label = text.split(/\n+/).map((l) => l.trim()).filter(Boolean).join(' -- ');
      return /\n/.test(text) ? `\n\n[${label}](${href})\n\n` : `[${label}](${href})`;
    }
    case 'img': {
      const alt = (node.getAttribute('alt') ?? '').trim();
      return alt ? `![${alt}](${absolute(node.getAttribute('src'))})` : '';
    }
    case 'strong': case 'b': {
      const text = clean(kids());
      return text ? `**${text}**` : '';
    }
    case 'li': {
      const text = clean(kids()).replace(/\s*\n\s*/g, ' ');
      return text ? `\n- ${text}\n` : '';
    }
    case 'blockquote':
      return `\n\n${clean(kids()).split('\n').map((l) => `> ${l}`).join('\n')}\n\n`;
    case 'table': {
      // Markdown wants a divider under the header row, or it is not a table.
      const rows = clean(kids()).split('\n').filter((r) => r.startsWith('|'));
      const caption = node.querySelector('caption');
      const title = caption ? clean(inline(caption.childNodes)) : '';
      if (!rows.length) return '';
      const cols = (rows[0].match(/\|/g) ?? []).length - 1;
      const divider = `|${' --- |'.repeat(cols)}`;
      return `\n\n${title ? `${title}\n\n` : ''}${[rows[0], divider, ...rows.slice(1)].join('\n')}\n\n`;
    }
    case 'caption':
      return ''; // printed above the table, by the case above
    case 'td': case 'th':
      return ` ${clean(kids()).replace(/\s*\n\s*/g, ' ')} |`;
    case 'tr':
      return `\n|${kids()}`;
    case 'form': {
      // An agent reading Markdown cannot fill a form in, so the fields are
      // listed and the agent is sent to the page that has the real one. A
      // label's first line is its name; anything under it is a hint.
      const fields = node
        .querySelectorAll('label')
        .map((l) => clean(render(l)).split('\n')[0].trim())
        .filter((t) => t && t.length < 60);
      return `\n\n_Form on this page${fields.length ? ` (fields: ${fields.join(', ')})` : ''}. To use it, open ${current} in a browser._\n\n`;
    }
    case 'button': {
      // Tabs and accordion toggles: their label is content (an FAQ question
      // lives in one), so it is kept, as a line of its own.
      const text = clean(kids());
      return text ? `\n\n${text}\n\n` : '';
    }
    default:
      if (BLOCK.has(tag)) return `\n\n${kids()}\n\n`;
      if (INLINEISH.test(cls)) return ` ${kids()} `;
      if (BLOCKISH.test(cls)) {
        // A flex or grid container's children are laid out as separate
        // items whatever their tag: a column (or a grid) stacks them, a row
        // sets them side by side, so they need a break or at least a space.
        const sep = /(^|\s)(flex-col|grid)(\s|$)/.test(cls) ? '\n\n' : ' ';
        return `\n\n${node.childNodes.map(render).join(sep)}\n\n`;
      }
      return kids();
  }
}

function clean(s) {
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    // Two buttons side by side: "[Book an audit](…)[Check my visibility](…)".
    .replace(/\)\[/g, ') [')
    // …and a link followed straight by a word: "[See how AI describes you](…)How it works".
    .replace(/(\]\([^)\s]+\))(?=[A-Za-z])/g, '$1 ')
    .trim();
}

function toMarkdown(el) {
  const raw = render(el);
  const lines = clean(raw)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  // Carousels and tickers render their items twice to loop seamlessly; one
  // copy is aria-hidden, but not always. A block repeated back to back is
  // never something the page means to say twice.
  const out = [];
  const seen = new Set();
  for (const b of lines) {
    const key = b.toLowerCase();
    if (out[out.length - 1] === b) continue;
    if (!b.startsWith('#') && b.length > 40 && seen.has(key)) continue;
    seen.add(key);
    out.push(b);
  }
  return out.join('\n\n');
}

// ─── ASCII ───────────────────────────────────────────────────────────────────

const FOLD = [
  [/[\u2014]/g, '--'], [/[\u2013\u2212]/g, '-'], [/[\u2018\u2019\u2032]/g, "'"], [/[\u201C\u201D\u2033]/g, '"'],
  [/\u2026/g, '...'], [/\u00B7/g, '-'], [/\u2022/g, '-'], [/\u00D7/g, 'x'], [/\u2192/g, '->'], [/\u2190/g, '<-'],
  [/\u00A0/g, ' '], [/[\u200B-\u200D\uFEFF]/g, ''], [/\u2122/g, '(TM)'], [/\u00AE/g, '(R)'], [/\u00A9/g, '(c)'],
  [/\u2713|\u2714/g, ''], [/\u25B7|\u25B6/g, ''], [/\u2197/g, ''],
];
function ascii(s) {
  let t = s;
  for (const [re, to] of FOLD) t = t.replace(re, to);
  // Accented letters keep their base letter rather than becoming '?'.
  return t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Pages ───────────────────────────────────────────────────────────────────

/* The sitemap decides which pages get a Markdown twin: it is already the list
   of what we want indexed, and a page left out of it on purpose (the legacy
   /thallo-ai/ demo) should stay out of this too. */
const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const pages = urls.map((url) => {
  const route = new URL(url).pathname; // '/services/'
  const file = path.join(OUT, route, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const root = parse(html, { comment: false });

  const title = root.querySelector('title')?.text.trim() ?? '';
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const schema = root
    .querySelectorAll('script[type="application/ld+json"]')
    .flatMap((s) => {
      try {
        const data = JSON.parse(s.text);
        return data['@graph'] ?? [data];
      } catch {
        return [];
      }
    });

  const main = root.querySelector('main');
  current = url;
  const body = main ? toMarkdown(main) : '';

  return { url, route, file, html, title, description, schema, body, md: `${url}index.md` };
});

// ─── Facts, from the structured data ─────────────────────────────────────────

const all = pages.flatMap((p) => p.schema);
const org = all.find((n) => [].concat(n['@type']).includes('Organization')) ?? {};
const catalog = all.find((n) => n['@type'] === 'OfferCatalog' && n['@id']?.endsWith('#plans'));
const homeFaq = pages.find((p) => p.route === '/')?.schema.find((n) => n['@type'] === 'FAQPage');

const money = (n) => `$${Number(n).toLocaleString('en-US')}`;

function planLine(offer) {
  const s = offer.itemOffered ?? {};
  const spec = offer.priceSpecification ?? {};
  let price = 'priced by scope (fixed quote before work starts)';
  if (offer.price !== undefined) {
    const amount = money(spec.minPrice ?? offer.price);
    const from = spec.minPrice !== undefined ? 'from ' : '';
    const unit = spec.unitText ? ` per ${spec.unitText}` : ' one-time';
    price = `${from}${amount} USD${unit}`;
  }
  return `- **${s.name}** (${s.serviceType}) -- ${price}. ${s.description} ${offer.description ?? ''}`.trim();
}

// ─── llms.txt ────────────────────────────────────────────────────────────────

const label = (p) => p.route === '/' ? 'Home' : p.title.replace(/\s*·\s*Thallo Digital$/, '').replace(/^Thallo · /, '');
const pageLine = (p) => `- [${label(p)}](${p.md}): ${p.description}`;

const LEGAL = new Set(['/terms/', '/refund-policy/', '/privacy/']);
const main = pages.filter((p) => !LEGAL.has(p.route));
const legal = pages.filter((p) => LEGAL.has(p.route));

/* The summary is the Organization's description, turned into a sentence about
   the company ("The AI visibility agency for…" → "Thallo Digital is the AI
   visibility agency for…"), so an agent that reads one line reads who we are,
   who for, and what changes. The disambiguation — which Thallo this is not —
   follows on its own: its first sentence would only repeat the summary. */
const summary = org.description
  ? `${org.name} is ${org.description[0].toLowerCase()}${org.description.slice(1)}`
  : org.name;
const notThat = (org.disambiguatingDescription ?? '').split(/(?<=\.)\s+/).slice(1);

/* The rest of the key facts, each read from the page that states it. */
const industries = all.find((n) => n['@type'] === 'ItemList' && n['@id']?.endsWith('/industries/#list'));
const cases =
  pages.find((p) => p.route === '/results/')?.schema.find((n) => n['@type'] === 'CollectionPage')?.mainEntity
    ?.itemListElement ?? [];
// The home page's first paragraph, under the h1: how the work is done.
const how = pages.find((p) => p.route === '/')?.body.split('\n\n').find((b, i, all) => i > 0 && all[i - 1].startsWith('# '));

const index = [
  `# ${org.name ?? 'Thallo Digital'}`,
  '',
  `> ${summary}`,
  '',
  notThat.join(' '),
  '',
  'Every page below links to a Markdown copy of itself (`index.md`); the HTML is at the same address without it. The whole site in one file: ' +
    `${SITE_URL}/llms-full.txt`,
  '',
  '## Key facts',
  '',
  `- Company: ${org.legalName ?? org.name}. Website: ${SITE_URL}/. Serves clients worldwide, in English.`,
  ...(org.audience
    ? [
        `- Who it is for: ${org.audience.audienceType}${
          industries ? ` -- ${industries.itemListElement.map((i) => i.name).join(', ')}` : ''
        }. Details: ${SITE_URL}/industries/`,
      ]
    : []),
  ...(how ? [`- How: ${how}`] : []),
  `- Disciplines: ${(org.knowsAbout ?? []).join(', ')}.`,
  // The order the site sells in, and the FAQ's answer that none is required.
  `- How to start: a free AI visibility scan (${SITE_URL}/thallo-ai/scan/), then the AI Visibility Audit, then the Authority Engine. The plans are independent; most clients start with the audit. Method behind the scan: ${SITE_URL}/thallo-ai/method/`,
  ...(cases.length ? [`- Published results: ${cases.map((c) => `${c.name} (${c.url})`).join('; ')}.`] : []),
  `- Contact: ${org.email} or ${SITE_URL}/contact/.`,
  ...(org.sameAs?.length ? [`- Official profiles: ${org.sameAs.join(', ')}.`] : []),
  '',
  ...(catalog
    ? ['## Plans and pricing', '', `Source: ${SITE_URL}/services/`, '', ...catalog.itemListElement.map(planLine), '']
    : []),
  ...(homeFaq
    ? [
        '## Frequently asked',
        '',
        ...homeFaq.mainEntity.map((q) => `- **${q.name}** ${q.acceptedAnswer.text}`),
        '',
      ]
    : []),
  '## Pages',
  '',
  ...main.map(pageLine),
  '',
  '## Research and writing',
  '',
  `- [The AI Shortlist Series](${RESEARCH_URL}): Thallo's research on which firms AI assistants recommend, category by category.`,
  `- [Blog](${BLOG_URL}): articles on AI visibility and generative engine optimization. Sitemap: ${BLOG_URL}sitemaps.xml`,
  '',
  '## Optional',
  '',
  ...legal.map(pageLine),
  `- [Sitemap](${SITE_URL}/sitemap.xml)`,
  '',
]
  .filter((l) => l !== undefined)
  .join('\n');

// ─── Write ───────────────────────────────────────────────────────────────────

const write = (rel, text) => fs.writeFileSync(path.join(OUT, rel), ascii(text).replace(/\n{3,}/g, '\n\n'), 'utf8');

for (const p of pages) {
  const doc = [
    '---',
    `title: ${JSON.stringify(p.title)}`,
    `description: ${JSON.stringify(p.description)}`,
    `url: ${p.url}`,
    '---',
    '',
    p.body,
    '',
  ].join('\n');
  write(path.join(p.route, 'index.md'), doc);

  // The pointer from the HTML to its Markdown twin. Into <head>, once.
  const link = `<link rel="alternate" type="text/markdown" href="${BASE}${p.route}index.md" title="Markdown"/>`;
  if (!p.html.includes('type="text/markdown"')) {
    fs.writeFileSync(p.file, p.html.replace('</head>', `${link}</head>`), 'utf8');
  }
}

write('llms.txt', index);
write(
  'llms-full.txt',
  [index, ...pages.map((p) => `\n---\n\n<!-- ${p.url} -->\n\n${p.body}\n`)].join('\n'),
);

console.log(`agent-files: llms.txt, llms-full.txt and ${pages.length} Markdown pages written to ${OUT}/`);
