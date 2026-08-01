# Check My Visibility — how it is built and how to switch it on

The tool at `/thallo-ai/` asks ChatGPT, Claude and Gemini the questions a buyer
in your category would type, counts how often a brand is named, then checks live
retrieval and crawls the brand's own site. This document is how to get it
running for real.

Everything described here is written and working. What is missing is API keys.

---

## 1. The shape of it

```
  Static site (Next.js, output: export)          WordPress (Bluehost)
  ───────────────────────────────────────        ─────────────────────────────
  thallodigital.com/thallo-ai/                   thallodigital.com/blog/
    src/components/scan/*   the screens            wp-content/plugins/
    src/lib/scan/engine.ts  the client               thallo-visibility/
              │                                          │
              └──── POST /blog/wp-json/thallo/v1/scan ────┘
                         tick · tick · tick
```

**Why WordPress holds the API.** A static export cannot hold a secret. Calling
OpenAI from the visitor's browser would put the key in the bundle for anyone to
read, so something server-side has to make the calls. WordPress is going onto
the same Bluehost account for the blog anyway, which makes it the server we are
already paying for. It also gives a settings screen a non-developer can use and
a place for the leads to land.

**Why the client ticks.** Fifteen questions across three models is forty-five
calls to other people's servers. No shared host will hold a request open that
long. So a scan is a job: the client starts it and then advances it a step at a
time. The upside is that the progress bar reports real work — when Gemini is
slow, the Gemini row is the one that spins.

**Free half, paid half.** Phase 1 (the three models, from memory) is free and
needs no account. Phase 2 (Perplexity, Google AI Overview, the crawl) costs
money to run and is unlocked with an email. The split is in the type
definitions, so it cannot get lost in the wiring.

---

## 2. Installing the plugin

1. Zip `wordpress-plugin/thallo-visibility/` and upload it under
   **Plugins → Add New → Upload**, or copy the folder to
   `wp-content/plugins/thallo-visibility/` over FTP.
2. Activate it. Two tables are created on activation.
3. Go to **Visibility → Settings**. The screen shows a yellow "preview mode"
   notice until a key is in place, and a green "live" one after.
4. The endpoint you need is printed at the top of that screen, e.g.
   `https://thallodigital.com/blog/wp-json/thallo/v1`.

### Checking it works

Signed in as an administrator, open:

```
https://thallodigital.com/blog/wp-json/thallo/v1/status
```

It reports which models are reachable, whether AI Overview can be read, and how
many scans have run today. It never prints a key.

---

## 3. Keys — what to get, and what it costs

### The models: OpenRouter, or four separate accounts

**Recommendation: OpenRouter.** One key, one bill, one API in front of every
model. The alternative is four billing relationships, four rate limits and four
things that can quietly expire, to save fractions of a cent on a tool that
spends single digits of one.

Sign up at `openrouter.ai`, add credit, create a key, paste it in. The defaults
already in the settings are the cheap tier of each model:

| Slot | Default model id |
|---|---|
| ChatGPT | `openai/gpt-4o-mini` |
| Claude | `anthropic/claude-3.5-haiku` |
| Gemini | `google/gemini-2.0-flash-001` |
| Perplexity | `perplexity/sonar` |

Check these ids against OpenRouter's model list before going live — providers
retire model names, and a retired id returns an error rather than an answer.

**If you would rather burn down credit you already hold** with OpenAI, Anthropic
and Google: switch Provider to "Native" and fill in the four keys. Note that
ChatGPT credit bought inside a ChatGPT Plus subscription is *not* API credit —
API billing at `platform.openai.com` is separate, and the same is true of Claude
Pro versus the Anthropic Console. Gemini keys come from Google AI Studio and
have a free tier generous enough for this.

**Cost.** A scan is 45 short calls, each a couple of hundred tokens out. On the
models above that is roughly **US$0.01–0.03 per scan** — around $1–3 for a
hundred. Phase 2 adds two Perplexity calls, so a couple of cents more.

### Google AI Overview: no API exists

Google publishes no API for the AI Overview. It has to be read through a
search-results provider, and the plugin supports two:

- **SerpApi** — simplest, handles the AI Overview explicitly. Around $0.01–0.02
  per lookup on the entry plan.
- **DataForSEO** — cheaper per lookup, more setup.

**Leave it on "None" and the report says the AI Overview was not measured.**
That is deliberate. A tool whose whole proposition is telling people the truth
about their visibility must not have a component that guesses, so the number is
withheld rather than estimated, and the grade averages only the parts that were
actually measured.

---

## 4. Pointing the site at it

The API root goes into the build as `NEXT_PUBLIC_SCAN_API`. It is read at build
time — this is a static export — so changing it means rebuilding.

Local:

```bash
cp .env.example .env.local
```

In the GitHub Actions workflow, add it to the build step:

```yaml
      - name: Build for Bluehost
        run: npm run build
        env:
          DEPLOY_TARGET: bluehost
          NEXT_PUBLIC_SCAN_API: https://thallodigital.com/blog/wp-json/thallo/v1
```

With it unset the tool still works — on sample data, behind an unmissable
"preview mode" banner. That is the intended state until the keys are in.

### CORS

Not needed in the intended setup: the site is at the domain root and WordPress
at `/blog/`, so the API is same-origin. Only if the two end up on different
hosts (or when developing locally against a remote WordPress) add the site's
origin to **Allowed origins** on the settings screen, one per line, e.g.
`http://localhost:3000`.

---

## 5. Deploying to Bluehost alongside WordPress

The intended layout:

```
public_html/
  index.html, thallo-ai/, services/, _next/ …   ← the static site, from ./out
  blog/                                          ← WordPress, untouched by deploys
```

`.github/workflows/deploy-bluehost.yml` already excludes `**/blog/**` from the
FTP sync, so a site deploy cannot overwrite the WordPress install. Run it from
the Actions tab and set these repository secrets first:

- `BLUEHOST_FTP_SERVER`
- `BLUEHOST_FTP_USERNAME`
- `BLUEHOST_FTP_PASSWORD`

### The basePath, and why it mattered

The site is served from `/thallo-digital` on GitHub Pages and from the domain
root on Bluehost. `next.config.ts` switches `basePath` on `DEPLOY_TARGET` — but
Next only rewrites the paths *it* controls (`<Link>`, `next/image`), and this
codebase writes its `href` and `<img src>` values by hand. Those are plain
strings and nothing rewrites them, so a Bluehost build used to emit 83 links and
assets pointing at a `/thallo-digital/` directory that does not exist there.

They now read the prefix from `src/lib/site.ts`, which `next.config.ts` sets
from the same expression as `basePath`. Both builds have been checked:

```bash
npm run build                        # → href="/thallo-digital/services/"
DEPLOY_TARGET=bluehost npm run build # → href="/services/"
```

---

## 6. What still needs a decision before launch

These are outside the tool itself, but they block the domain going live.

1. **The canonical URL is still GitHub Pages.** `src/app/layout.tsx`,
   `src/app/sitemap.ts` and each page's metadata hardcode
   `https://theo272004.github.io/thallo-digital`. Every canonical, `og:url`, and
   the JSON-LD organisation block will point at the wrong host until that is
   changed to the real domain. It is one constant in each file.
2. **The navbar "Blog" link points at `/#blog`,** an anchor on the home page.
   Once WordPress is at `/blog/`, that should become `/blog/`
   (`src/components/Navbar.tsx`).
3. **Outbound email.** "Send the report to the person who unlocked it" needs
   working `wp_mail`. Bluehost's default PHP mail lands in spam; install an SMTP
   plugin and send through a real mailbox before switching it on.
4. **A privacy policy.** The consent tick on the forms says what the details are
   used for but has nothing to link to (`src/components/ui/ConsentCheck.tsx`
   says so in a comment). A tick without a policy behind it is a courtesy, not
   compliance.

---

## 7. Guarding the bill

The API endpoints are public and unauthenticated, because the visitor they serve
has no account and the tool would be worthless if they needed one. What stands
between them and a surprise invoice:

| Setting | Default | What it does |
|---|---|---|
| Free scans per visitor per day | 3 | Keyed on a hashed IP. Stops someone sitting on the button. |
| Scans per day, site-wide | 200 | The real ceiling. Addresses are cheap; this is not. |
| Questions per model | 15 | Lower it to spend less and measure less. |
| Keep scan data for | 14 days | Working data is pruned daily. Leads are kept. |

At the defaults, the worst a single day can cost is roughly 200 × $0.03 ≈ **$6**.
Set the site-wide limit to whatever number you would be comfortable seeing on a
bill, because that is exactly what it is.

---

## 8. Where the leads go

**Visibility → Leads** lists everyone who unlocked a report, with their brand,
domain, share of voice and grade, and exports the lot as CSV. Set **Notify this
address** to get an email each time one arrives.

The email is stored the moment it is given — before phase 2 runs, not after. A
scan that falls over halfway must not also lose the contact, because the person
handed it over in good faith and we still owe them the report.

---

## 9. Is this enough to sell as an AEO/GEO offer?

Broadly yes, with one gap and one honest caveat.

**What it covers.** Share of voice across three models with the brand's name
kept out of the questions; rank, not just presence; the competitor set that is
being recommended instead; grounded retrieval as a separate reading from memory;
and a technical scorecard weighted so that the two things that actually move
(crawler access and third-party citations) carry half the points between them.
The audit trail — every question, every result — is what makes it defensible in
a sales conversation, and it is the thing most competing tools do not show.

**The gap: it is a snapshot, not a trend.** The commercial version of this
product is a chart going up and to the right over months. That means storing
each run against a brand and scheduling repeats, which the current schema does
not do (scans are pruned after fourteen days). It is the obvious next build, and
the natural thing to charge a retainer for.

**The caveat: model answers drift.** Ask the same question a week apart and you
will get different companies. Say so — it is in the "What it does not do"
section on the page — and the drift itself becomes the argument for monitoring
rather than a one-off check.

---

## 10. File map

```
src/lib/scan/types.ts        The contract. Every shape the UI renders.
src/lib/scan/questions.ts    The 15 questions (mirrors the plugin's copy).
src/lib/scan/engine.ts       Start, tick, unlock. Falls back to demo.ts.
src/lib/scan/demo.ts         Sample data, used only when no API is configured.
src/lib/site.ts              The basePath prefix for hand-written paths.
src/components/scan/         ScanFlow → Setup → Progress → Results → FullReport.

wordpress-plugin/thallo-visibility/
  thallo-visibility.php      Bootstrap.
  includes/
    class-thallo-rest.php    Routes, validation, rate limits, CORS.
    class-thallo-runner.php  The job: start, tick, unlock, serialise.
    class-thallo-llm.php     OpenRouter / OpenAI / Anthropic / Gemini adapters.
    class-thallo-retrieval.php  Perplexity, and AI Overview via SerpApi/DataForSEO.
    class-thallo-tech.php    The crawl: robots.txt, schema, about, freshness.
    class-thallo-analysis.php  Brand matching, competitors, scoring, the plan.
    class-thallo-questions.php  The authoritative prompt set.
    class-thallo-http.php    Parallel requests, with a sequential fallback.
    class-thallo-db.php      Two tables, and the pruning.
    class-thallo-settings.php  Defaults and validation.
    class-thallo-leads.php   Storage, notification, the report email, CSV.
    class-thallo-admin.php   The two admin screens.
```
