import { execFileSync } from 'node:child_process';

/**
 * When the source behind a page was last changed, read from git.
 *
 * `<lastmod>` is only worth emitting if it is true. Google treats it as a hint
 * and stops trusting a sitemap whose dates say every page changed on the day of
 * the last build — which is exactly what `new Date()` produces here, since this
 * is a static export and the sitemap is baked once per deploy. So the date comes
 * from the commit history instead: the last commit that touched the files that
 * produce the page.
 *
 * Two consequences worth knowing:
 *
 *  · The deploy must check out the full history. `actions/checkout` clones one
 *    commit deep by default, and against a shallow clone `git log` can only
 *    answer for files that HEAD happened to touch — every other page would come
 *    back empty. Both workflows set `fetch-depth: 0` for this.
 *
 *  · When git cannot answer — no history, no git binary — this returns
 *    undefined and the entry ships without a `<lastmod>`. A missing date costs
 *    nothing; an invented one costs the sitemap its credibility.
 */
const cache = new Map<string, string | undefined>();

export function lastModified(...paths: string[]): Date | undefined {
  const key = paths.join('\u0000');

  if (!cache.has(key)) {
    cache.set(key, readCommitDate(paths));
  }

  const iso = cache.get(key);
  return iso ? new Date(iso) : undefined;
}

/**
 * The committer date of the most recent commit touching any of `paths`.
 *
 * Committer rather than author date (`%cI` rather than `%aI`): a rebased or
 * cherry-picked change reaches the site when it lands on main, not when it was
 * first written, and the sitemap is describing the published page.
 */
function readCommitDate(paths: string[]): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], {
      encoding: 'utf8',
      // stderr is discarded on purpose: outside a repository git writes to it
      // and the throw below is the whole signal we need.
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return out.trim() || undefined;
  } catch {
    return undefined;
  }
}
