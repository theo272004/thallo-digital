import { ldJson } from '@/lib/schema';

/**
 * A JSON-LD block, rendered into the static HTML.
 *
 * It has to be in the HTML the server sends, not added after hydration: the
 * crawlers that feed ChatGPT, Claude and Perplexity read the page without
 * running its JavaScript, so a script tag injected on the client is one they
 * never see.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />;
}
