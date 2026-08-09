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

## 6. What is still outstanding

**1. No API key is saved.** This is the only thing between the tool as built and
the tool as a product. Checked against production on 7 August 2026: the site is
deployed, the plugin is installed, the REST namespace answers, and the built
bundle has `NEXT_PUBLIC_SCAN_API` in it — and `POST /scan` still returns
`"demo": true`, so every visitor is seeing sample data behind the banner. It is
a settings-screen task, not a code task. See section 3.

Re-check it at any time without an admin login:

```bash
curl -s -X POST https://thallodigital.com/blog/wp-json/thallo/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"brand":"x","domain":"example.com","industry":"Professional services"}'
```

**2. Outbound email.** "Send the report to the person who unlocked it" needs
working `wp_mail`, and it is now load-bearing twice over — a monitored brand's
whole value is the email that arrives without anyone asking. Bluehost's default
PHP mail lands in spam; install an SMTP plugin and send through a real mailbox
before switching either on.

**3. No SERP provider,** so the AI Overview reads as "not measured". Deliberate
and honest, but it is an empty box in a paid deliverable. See section 3.

Settled since this document was first written: the canonicals point at
`thallodigital.com`, the navbar "Blog" link points at the WordPress install, and
the consent tick links to `/privacy/`.

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

## 9. Markets, history and monitoring

These three arrived together, because they are one idea: a measurement is only
meaningful for a stated market, and only useful as a series.

### Markets

Every scan carries a **market** — a language and a country. `es-CO` and `en-US`
are different measurements of the same brand, and both can be correct.

The fifteen questions exist in English, Spanish and Portuguese, written out
rather than machine-translated on the way to the model. A translation call per
question would cost money, drift between runs, and make two scans a fortnight
apart incomparable — which would destroy the only thing a history series is for.
The category label is translated with the question, and the country goes into
the system prompt as who is asking.

Phase 2 follows the market too. Perplexity is asked in the market's language;
the AI Overview lookup uses the market's search terms, `hl`/`gl` and DataForSEO
location. There is deliberately **no site-wide search location setting any
more** — it could only ever have been right for one market and silently wrong
for the rest.

Adding a market is two edits: `MARKETS` and `TEMPLATES` in
`src/lib/scan/markets.ts` and in `includes/class-thallo-questions.php`. The
plugin's copy is authoritative; the site's exists so the setup screen can
preview the prompt before anything is spent.

### Who writes the questions

Step 2 of the setup screen is a free-text editor: the visitor writes their own
prompts, up to the `questions` setting (3–15, default 15). `POST /scan` takes an
optional `questions` array, trims and de-duplicates it, caps it at the setting,
and `Thallo_Vis_Runner::start()` stores that list on the scan. The audit trail
prints it verbatim, so a run is always traceable.

The list is optional at the REST layer on purpose — a cached front-end bundle
predating the editor sends nothing, and the right answer for it is the generated
set, not a rejected scan.

**What this costs.** The fifteen-question tables above were fixed strings so
that two brands could be compared with each other and one brand with itself next
month. Visitor-written prompts give that up: a scan is now a measurement of the
questions that visitor chose. Two consequences worth holding on to —

* the site's copy says "up to 15 questions **you write**" rather than quoting a
  count as though it were a property of the tool;
* **scheduled monitors still use the generated set.** `Monitors::run()` calls
  `Runner::start()` without a prompt list, so a weekly series keeps asking the
  same fifteen questions and stays a trend line. That is the whole reason the
  tables are still here.

### History

`wp_thallo_history` keeps a handful of numbers per run, forever. It is separate
from the scan precisely so the scan can still be pruned at fourteen days without
throwing away the trend.

- Keyed on **domain + market**, not brand. The same company gets typed
  "Ledgerly", "Ledgerly Inc" and "ledgerly" across three runs; three spellings
  would become three series with one point each.
- **One point per day per series.** Re-running four times in an afternoon does
  not turn a trend into a sawtooth; the day's last run stands.
- Written at the **end of phase 1**, so a visitor who never hands over an email
  still leaves a real measurement behind. Phase 2 fills in the grade.
- **Demo runs write nothing.** This table is the one place in the system that is
  meant to be a record; invented numbers here would outlive every banner saying
  they were invented.

The report renders the series as a chart pinned to 0–100, and refuses to draw a
line through a single point.

### Monitoring

**Visibility → Monitoring** lists the brands being re-scanned on a schedule.
Enrol one with the button on the Leads screen; pause or remove it here.

It is **off by default** — this is the only part of the system that spends money
with nobody present — and has its own daily ceiling, separate from the
visitor-facing one. That cap protects the bill from a stranger; this one
protects it from twenty monitors falling due on the same morning.

Mechanically: an hourly sweep starts up to three due monitors, then a chain of
single cron events ticks each scan forward one step at a time. Same reason a
visitor's scan ticks — forty-five calls do not fit in one PHP request, and
WP-Cron is a PHP request like any other. A scan that stops responding for two
hours is released rather than pinning its monitor forever, and a run that fails
still moves the schedule forward so a structurally broken target is not retried
twenty-four times a day at your expense.

Note that WP-Cron fires on traffic. On a quiet blog, add a real cron job hitting
`wp-cron.php` if you want the schedule kept to the hour.

## 10. Is this enough to sell as an AEO/GEO offer?

**What it covers.** Share of voice across three models with the brand's name
kept out of the questions; rank, not just presence; the competitor set that is
being recommended instead; grounded retrieval as a separate reading from memory;
a technical scorecard weighted so that the two things that actually move
(crawler access and third-party citations) carry half the points between them;
per-market measurement; and a trend line once a brand has been scanned twice.
The audit trail — every question, every result — is what makes it defensible in
a sales conversation, and it is the thing most competing tools do not show.

**Against the market.** HubSpot's AI Search Grader is the free competitor and it
is a single English snapshot. The paid tools — Profound, Peec, Otterly — start
around $29/month and run to $499; multi-market tracking is a premium tier
everywhere it exists at all. What they have that this does not is **sentiment**
(how a model talks about you, not just whether it names you) and **citation
analytics over time** (which sources feed the answers). Sentiment is the
cheapest of those to add, because the model's answer is already being read.

**The caveat: model answers drift.** Ask the same question a week apart and you
will get different companies. Say so — it is in the "What it does not do"
section on the page — and the drift is itself the argument for monitoring rather
than a one-off check.

---

## 11. File map

```
src/lib/scan/types.ts        The contract. Every shape the UI renders.
src/lib/scan/markets.ts      The markets, and the 15 questions in each language.
src/lib/scan/questions.ts    The narrow view of markets.ts the site consumes.
src/lib/scan/engine.ts       Start, tick, unlock. Falls back to demo.ts.
src/lib/scan/demo.ts         Sample data, used only when no API is configured.
src/lib/site.ts              The basePath prefix for hand-written paths.
src/components/scan/         ScanFlow → Setup → Progress → Results → FullReport.
  TrendChart.tsx             Share of voice over time, and its empty state.

wordpress-plugin/thallo-visibility/
  thallo-visibility.php      Bootstrap, cron registration.
  includes/
    class-thallo-rest.php    Routes, validation, rate limits, CORS.
    class-thallo-runner.php  The job: start, tick, unlock, serialise.
    class-thallo-llm.php     OpenRouter / OpenAI / Anthropic / Gemini adapters.
    class-thallo-retrieval.php  Perplexity, and AI Overview via SerpApi/DataForSEO.
    class-thallo-tech.php    The crawl: robots.txt, schema, about, freshness.
    class-thallo-analysis.php  Brand matching, competitors, scoring, the plan.
    class-thallo-questions.php  The authoritative prompt set, and the markets.
    class-thallo-monitors.php   Scheduled re-scans: the sweep and the cron chain.
    class-thallo-http.php    Parallel requests, with a sequential fallback.
    class-thallo-db.php      Four tables, and the pruning.
    class-thallo-settings.php  Defaults and validation.
    class-thallo-leads.php   Storage, notification, the report email, CSV.
    class-thallo-admin.php   The three admin screens.

wordpress-plugin/tests/test-logic.php   Runs on any PHP 7.4+, no WordPress.
```

Run the plugin's tests with:

```bash
php wordpress-plugin/tests/test-logic.php
```
