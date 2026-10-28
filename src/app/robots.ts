import type { MetadataRoute } from 'next';
import { BLOG_URL, SITE_URL } from '@/lib/site';

// Required by `output: export` — robots.txt is baked at build time.
export const dynamic = 'force-static';

/**
 * The AI crawlers and agents, by name.
 *
 * `User-agent: *` already lets every one of them in, so naming them changes
 * nothing about what is allowed today. It is here for two other reasons.
 *
 * It states intent. An agency that sells AI visibility should say, in the one
 * file every crawler reads first, that it wants to be read — and the scan we
 * sell checks this file for exactly these names.
 *
 * And it protects them from a later edit. A crawler obeys the most specific
 * group that names it and ignores `*` entirely, so a `Disallow` added to the
 * catch-all one day — to keep a staging path out of Google, say — would not
 * reach anything listed here.
 *
 * Training crawlers are allowed on purpose, not just the ones that fetch for a
 * live answer. "Does the industry talk about you enough that a model learned
 * your name?" is half of what the scan measures, and a model cannot learn a
 * name from a site it was told not to read.
 *
 * Grouped by who runs them. Names are the product tokens each company
 * documents; a token that matches nothing costs nothing.
 */
const AI_AGENTS = [
  // OpenAI — training, ChatGPT search's index, and fetches a user asked for.
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic — the same three roles for Claude.
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  // Perplexity — its index, and live fetches during an answer.
  'PerplexityBot',
  'Perplexity-User',
  // Google — Gemini and AI Overviews read through Googlebot; this token is
  // the separate switch for training and grounding Gemini on the site.
  'Google-Extended',
  'GoogleOther',
  // Apple Intelligence, Meta AI, Amazon (Alexa, Rufus), Microsoft Copilot
  // (Bingbot, already allowed under *), DuckDuckGo's DuckAssist, Mistral.
  'Applebot',
  'Applebot-Extended',
  'meta-externalagent',
  'meta-externalfetcher',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  // Common Crawl — the open corpus most models are trained on in part.
  'CCBot',
  // Cohere, You.com.
  'cohere-ai',
  'YouBot',
];

/**
 * The domain had no robots.txt at all: thallodigital.com/robots.txt was a 404.
 *
 * WordPress normally serves a virtual one, but it only owns /blog/ here — the
 * root is the static export, and Apache answered / for a file nothing produced.
 * So nothing pointed a crawler at either sitemap.
 *
 * Generated rather than dropped in as a static file so the two URLs come from
 * `src/lib/site.ts`, the same constants every canonical tag reads. A robots.txt
 * that outlives a domain change is a robots.txt pointing at a sitemap that 404s.
 *
 * Only the Bluehost build lands at the domain root, which is the only place a
 * crawler reads this file. The GitHub Pages mirror puts it at
 * /thallo-digital/robots.txt, where it is inert — harmless, and not worth a
 * second build path to suppress.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_AGENTS, allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    // Two sitemaps, because the site is two systems on one domain: the static
    // export at the root, and WordPress at /blog/. SiteSEO names its index
    // sitemaps.xml — the plural is not a typo.
    sitemap: [`${SITE_URL}/sitemap.xml`, `${BLOG_URL}sitemaps.xml`],
  };
}
