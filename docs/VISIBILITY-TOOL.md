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

**Why the client ticks.** A scan is dozens of calls to other people's servers —
every question put to three models twice over, plus the direct question, plus
retrieval and a crawl. No shared host will hold a request open that long. So a
scan is a job: the client starts it and then advances it a step at a time. The
upside is that the progress bar reports real work — when Gemini is slow, the
Gemini row is the one that spins.

**Two phases, one job.** Phase 1 is the three models answering from memory;
phase 2 is the searching reading, the direct question, retrieval and the crawl.
The split is in the type definitions and still matters to the runner, but it is
no longer a paywall: the address is collected on the setup screen, before
anything runs, because the searching half is billed on its first call and there
is no free half to hand out ahead of it. A scan therefore rolls straight from
one phase into the other, and the visitor watches one continuous job.

**Two headline numbers, never one.** A brand is asked about twice — once with
the models answering from memory, once with the web open — and the report prints
both, side by side, at equal weight. They are not two views of one quantity.
*Brand knowledge* is whether a model recommends you with nothing to look at:
reputation inside the model, earned off your own site, slow to move. *AI
visibility* is whether it finds and recommends you once it searches: presence
your own pages and citations control, and which can move in weeks. A brand can
be a zero on the first and strong on the second — the ordinary shape for a good
small company — and averaging them hides the one fact that decides which work to
do.

**There is no technical scorecard any more.** There was: twelve rows of
HTTPS, robots.txt, schema markup, sitemap freshness and an `llms.txt` check,
scored out of fifty, with the score also folded into the grade. It is gone, and
both reasons matter.

*It could be confidently wrong.* When the site could not be fetched at all — a
WAF refusing our server, an outbound block on the host — the content rows
correctly reported "not scored", but the robots.txt check could not tell "there
is no robots.txt" from "we never got a reply", and its no-robots branch is a
**pass worth 25 points**. So an unreachable site collected 25/25 there, another
25 from citations, and printed **50 / 50** at the head of a panel where every
other row said NOT SCORED. It was caught on a scan of allianz.com — a site that
plainly has HTTPS and a robots.txt — and a reader who catches one panel being
confidently wrong is right to discount the rest of the report.

*It was the wrong product.* What is being sold is what the models say. A
technical audit of a website has different buyers, and keeping it meant a scan
spending a step on checks nobody here intends to act on — and, worse, a "What
to do first" panel whose top two rows were "add Organization schema" and "mark
up your FAQ" on a report about model answers.

Fixing only the first would have meant telling a failed fetch apart from a
missing file. The second is why that fix was not worth making.
`Thallo_Vis_Tech` still exists and is no longer called; `phase2_steps()` no
longer queues `technical`; `finish_phase2()` ships an empty `signals` array,
which every consumer already reads as "did not run", so the email's technical
table and the report's panel disappear on their own. The plan is now built from
the entity rows, the sources and the gap between the two readings — see
`Thallo_Vis_Analysis::actions()`, which for that reason is assembled *after*
those are attached rather than in the same statement that creates `phase2`.

**The closing panel argues from the reader's own results.** It used to end on
"Measuring it is the easy half", which is true of every report this tool has
ever produced and therefore says nothing to anybody. `closingCase()` in
`FullReport.tsx` picks one of five findings — a name resolving to another
company, absence from every source the models read, invisible both ways, a gap
between the readings in either direction, or a position worth defending — and
states it as a consequence with the reader's own numbers and hostnames in it.
The panel is drawn dark when the finding warrants it and light when it does
not, and that is set by what was found rather than by what would sell: a report
that shouts at somebody whose numbers are healthy is a report they stop
believing.

**Both indicator names are jargon on first contact, and the report now says so
where it uses them.** Naming the two readings is what stopped them being averaged, and it
is load-bearing — but "Brand knowledge · no search" is then printed as a bare
column heading six times per question in the per-question breakdown, over
somebody's own results, with nothing around it to define it. `NotedLabel` in
`ui.tsx` turns those headings into a disclosure: a small olive `?` that opens a
plain-language sentence in place. A disclosure and not a hover tooltip, because
a tooltip does not exist on a phone and a floating panel would be clipped by the
`overflow-hidden` card these sit inside.

**The line that gets the tool called broken.** A model that names nobody on the
no-search reading used to print "Named no companies — the model said it did not
know any for this question", and that is the single most disbelieved sentence in
the report: the reader can open the same model in another tab, type their brand
and watch it answer. The distinction is the entire explanation, and the moment
of disbelief is not a moment anybody spends clicking a `?`. So the sentence now
carries its own reason — the web was switched off, this is about what the model
has learned, compare it with the reading directly below — and it is a different
sentence for each reading. See `READINGS` in `AnswerLists.tsx`.

There was a single ring for a while, and it was three different things in turn:
the memory figure, then the two pooled, then the searching figure. Each move was
an attempt to fix the same complaint by choosing a different winner, when the
fault was that there was only one seat. The email says the same thing in the same
two names, because one scan contradicting itself across two surfaces is the
fastest way to lose a reader who is checking.

**Absence is not a finding, so the scan also asks directly.** Most brands come
back at 0% on the memory reading, and a zero tells its story exactly once. So
each model is also asked, by name, *what is this company and who does it serve* —
the one question in the whole scan that mentions the brand, because it is the
only one that is not about ranking. The answer separates three situations a zero
flattens into one: never heard of you, knows you and cannot say who you are for,
and resolves your name to somebody else's company. The last is checked rather
than guessed — the model is asked for the website it has in mind, and a website
that is not yours is the evidence.

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

**1. Settled — the keys are in.** Checked against production on 16 August 2026:
`POST /scan` returns `"demo": false`, a full run of fifteen calls across the
three models came back clean, and the grounded reading and Perplexity both
answered. The models in the live settings are `openai/gpt-4o-mini`,
`anthropic/claude-haiku-4.5` and `google/gemini-2.5-flash`, with
`openai/gpt-5.6-luna`, `anthropic/claude-haiku-4.5` and
`google/gemini-2.5-flash-lite` on the grounded slots.

Re-check it at any time without an admin login:

```bash
curl -s -X POST https://thallodigital.com/blog/wp-json/thallo/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"brand":"x","domain":"example.com","industry":"Professional services"}'
```

**1a. The ChatGPT column of the search reading is still blank.** Every question
put to `openai/gpt-5.6-luna:online` comes back `HTTP 400: Provider returned
error`. Reproduced on 16 August 2026 and again after the first attempted fix;
Claude and Gemini answer normally on the same run, so it is that slot, not the
route.

The first guess was `web_search_options`: OpenRouter passes it through to OpenAI
and normalises it away for Anthropic and Google, and OpenRouter's own
`supported_parameters` say Luna does not accept it. It is now sent only to the
families that do (`openai/gpt-4o*`, `perplexity/*`) — which is correct on its
own terms, since it was doing nothing for any of the three grounded defaults —
**and it was not the cause.** The 400 survived it unchanged. Ruled out since:
the system prompt does contain the word "JSON", so `response_format:
json_object` is not being rejected for that reason, and every parameter sent is
in Luna's published `supported_parameters`.

What the diagnosis was missing is the provider's own sentence. OpenRouter's
`error.message` is the generic "Provider returned error"; the useful text sits
under `error.metadata.raw` and was being discarded. It is now read and printed
into the audit trail, so the next failed run says what OpenAI actually objected
to instead of repeating eight words that fit any cause.

Two ways forward, in order of cost:

1. **Change the model.** `Grounded ChatGPT model` in Settings to an
   `openai/gpt-4o` family id, which is OpenAI's own, accepts every parameter
   this plugin sends, and is the shape known to work. Costs one settings save.
2. **Read the new error** off the next scan's audit trail and fix the request.

Check any model id against OpenRouter without a key:

```bash
curl -s https://openrouter.ai/api/v1/models | grep -o '"id":"openai/gpt-5[^"]*"'
```

**2. Outbound email — the report is not arriving.** Reported by a client on 16
August 2026: the scan ran, the report was on screen, no email came. The sending
itself is the open item; what has been fixed is that a failure is now visible
instead of silent.

`wp_mail()` returns false when nothing was handed off, and the reason arrives
separately on the `wp_mail_failed` action. Both were being discarded, so a host
refusing every message looked exactly like a host delivering every message. Now:

- every message goes out through one wrapper that captures both;
- the outcome is written onto the lead — **sent**, **failed** with the server's
  own sentence, **not sent — the setting was off**, or **not recorded** for rows
  predating this;
- **Visibility → Leads** shows that column and carries a **Send it again**
  button per row, which rebuilds the report from the stored scan (so it stops
  working once that scan is pruned — see retention);
- **Visibility → Settings** has a **Send a test email** button. Use it first.
  It costs nothing and separates "the report is broken" from "this host does not
  send mail", which are different problems with different fixes.

Two things to set on that screen before blaming the code. **Send mail from** must
be a real, working mailbox on the domain — left empty, WordPress sends as
`wordpress@thallodigital.com`, which does not exist, and a receiving server is
entitled to bin a message from an address the domain will not vouch for. That is
the single most common cause of this exact symptom. And **Send the report** must
be ticked; it defaults on, but a save with the box clear turns it off silently,
which is why "the setting was off" is now one of the recorded outcomes rather
than an indistinguishable blank.

The real fix for delivery on Bluehost remains an SMTP plugin sending through a
real mailbox. Nothing in this plugin can substitute for it — it can only stop
the failure being invisible.

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
| Scans per browser | 3 | The offer. A session cookie, counted for its lifetime, not per day. This is the number the site prints as "Scan 1 of 3". |
| Scans per email address | 3 | The same allowance, counted so that clearing cookies does not reset it. |
| Scans per network, per day | 6 | Hashed IP. Loose on purpose — a shared office is forty people behind one address. Its job is a run of throwaway addresses from one machine. |
| Scans per website, per day | 2 | Stops one site using up the day. Usually not the owner: a competitor, or an agency pitching them. |
| Scans per day, site-wide | 200 | The real ceiling. This is the one protecting the bill. |
| Questions per model | 3 | Lower it to spend less and measure less. |
| Keep scan data for | 14 days | Working data is pruned daily. Leads are kept. |
| Addresses with no limit | *(the office)* | IPs that skip every counter above, including the site-wide one. For the machine that records walkthroughs, not for customers. |

**The allowance is four counters, and the tightest binds.** One number could not
do it: a cookie is cleared in ten seconds, an address is defeated by a second
address, and an IP on its own punishes an office. `GET /quota` reports what is
left — and mints the session cookie, which is why it is a call the setup screen
makes on load rather than something folded into `POST /scan`.

**And it is asked about before it is spent.** `/quota` also takes a POST
carrying an address and a website, and answers exactly what `/scan` would. The
setup screen asks it as soon as a plausible work address is typed, so the
refusal lands under the field rather than after the button. It used to land
after the button, and the button was also the thing that threw the form away —
a visitor filled in two screens, watched a scan appear to start, and was
returned to a blank step 1 with a sentence at the top about an address that was
no longer on screen. The address rides in the body rather than the query string
because a lead in a URL is a lead in an access log.

**One IP list is exempt from all of it.** `rate_exempt_ips` on the settings
screen. It exists for the person demonstrating the tool: recording a
walkthrough means six scans of six other companies in an afternoon, and to the
limiter that is a run of throwaway addresses scanning websites that are not
theirs. Raising the ceilings for everybody was the alternative, and that quietly
turns the free tier into an open one. Exact matches, no ranges — this is the
single hole in the thing that protects the bill, and a mistyped CIDR mask is how
a hole becomes a door. The settings screen prints the address you are browsing
from so there is nothing to guess at.

**None of them is ever shown as an error.** Somebody who has run three scans and
is reaching for a fourth is the most interested visitor of the week, and "rate
limit exceeded" is the worst possible thing to say to them. The status code is
still 429 because that is what it is; the sentence behind it is an invitation to
book the audit, and the front end prints it verbatim.

**And none of them names which counter is binding.** The per-address refusal
used to read "that address has used its free scans", which is the same sentence
with instructions attached — told the address is the limit, the obvious next
move is a second address, and it worked. Both the browser layer and the address
layer now say "You have reached the limit of free scans", which is true of the
visitor rather than of a counter.

**Free scans are for company email addresses.** Gmail, Outlook, Yahoo, iCloud
and the disposable providers are turned down at the REST layer, with a switch on
the settings screen (`require_work_email`, on by default). Unlike everything
else here this is about who the lead is rather than how often they come back:
the engagement this report sells starts at a monthly retainer and is approved by
somebody with a company domain in their signature. The site ships the same list
so the refusal lands beside the field, but the server's copy is the one that
binds — a static export's bundle is cached and cannot be trusted to be current.

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

**This screen is the record of who searched for what.** Since the address is
collected before the scan runs, every scan lands here: date, email, brand,
website, category, share of voice, grade, and whether the report reached them.
Lead rows are never pruned.

What *is* pruned is the report behind them. The scan row holds the questions,
every answer and both phases, and it is deleted after **Keep scan data for**
days — fourteen by default. After that the lead still says a scan happened and
what it scored, the trend table still holds its point, and the report itself is
gone: "Send it again" will say so rather than sending a reconstruction. Raise
the setting if these need to be answerable for longer; the cost is database
size, and at this volume that is nothing.

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

### The category field

Free text, offered with a short list of suggestions under it. It was a closed
dropdown and that was a bug with a menu in front of it: a business had to file
itself under the nearest wrong option, and phase 2 then searched Google for
*that*. The backend never required the list — `industry_label()` returns an
unrecognised label untouched, and only the listed ones carry translations.

**What is printed in this field is a targeting decision, not a copy one.** It is
the widest part of the funnel: whatever the placeholder says is what most people
type. It read *"pizzerias, legal tech, wedding photography"* against a service
that starts at $2,500 a month — two of those three were never going to buy, and
their scans cost exactly what a qualified one costs. The suggestions are now the
five industries Thallo actually sells to, in the order the site lists them
(fintech, health tech, legal tech, specialized software, professional services)
plus two adjacent categories that come up often enough to be worth offering. The
retired labels keep their translations: the field has always taken free text,
and somebody who types "e-commerce" should still get a question in their own
language rather than an English label dropped into a Spanish sentence.

It stays **required** even though the visitor writes their own prompts, because
phase 2 has no other source for what to look for: `serp_query()` builds the AI
Overview search from it, Perplexity's retrieval question embeds it, and the three
suggested questions are generated from it. Inferring it from the prompts would be
a paid model call to guess something the visitor knows.

### Who writes the questions

Step 2 of the setup screen is a free-text editor: the visitor writes their own
prompts, up to the `questions` setting (3–15, default 3 — the free tier). `POST
/scan` takes an optional `questions` array, trims and de-duplicates it, caps it
at the setting, and `Thallo_Vis_Runner::start()` stores that list on the scan.
The audit trail prints it verbatim, so a run is always traceable.

The list is optional at the REST layer on purpose — a cached front-end bundle
predating the editor sends nothing, and the right answer for it is the generated
set, not a rejected scan.

**The rows arrive filled, not empty.** Three suggested questions, one per
archetype, built from the category and the country and shown in the market's own
language: *category and geography*, *the buyer's problem*, *alternatives to the
leader*. The visitor edits from there, and a button restores them.

An empty field was costing an attempt at a time. A free scan is three questions
and there are three free scans, so a badly-written question is not a smaller
measurement — it is a third of the allowance spent on nothing, and the visitor
cannot tell until the report comes back thin. The failures were consistent
enough to name: questions with the brand's own name in them, questions with no
category in them at all, and questions about a different market from the one
selected. All three return a confident answer, which is what makes them
expensive.

They are deliberately **not** the first three of the generated set — those are
three phrasings of one angle, which measures a phrasing. `SUGGESTION_TEMPLATES`
in `markets.ts` holds them, and `Market.inCountry` carries the country as a
prepositional phrase (`in the United States`, `en México`, `no Brasil`) because
composing that at runtime is the bug: Portuguese takes "no Brasil", not "em
Brasil", and a preposition that reads as machine translation is the first thing
that makes a visitor distrust the questions and write three of their own from
scratch.

**The form is not thrown away when a scan is refused.** `ScanFlow` unmounts the
setup card the moment a scan starts, so every field lived only as long as the
mount — and the refusals that send a visitor back here are the ones about the
address and the allowance, meaning the person most likely to lose their three
questions is the one who has just been told something they now have to act on.
`ScanSetup` writes a draft to `sessionStorage` on every change and reads it once
on mount, so a return lands on step 2 with everything still in it; it is cleared
when a scan actually starts. A rematch seed outranks the draft, because that is
a deliberate instruction about what the form should contain. Consent is
deliberately not in the draft — a tick restored from storage is a consent nobody
gave.

**The button is shut until the run would be accepted.** It used to open on the
questions alone, so a personal address, an unticked consent box and a spent
allowance were all things you found out by pressing it. The same rule that draws
the button is the one `runScan` checks, so a keyboard submit cannot get past it,
and the reason it is shut is printed beside it — or under the field that owns
it, never both.

**Category is a text field with suggestions, and now says so.** It always
accepted anything typed into it — `industry_label()` passes an unrecognised
label straight through — but a panel of seven industries under an input with a
chevron on it reads as a menu, and a business that is not one of the seven files
itself under the nearest wrong one, which is then the category the whole scan is
run against. The panel now carries a line saying the list is a shortcut, and it
stays open with that line alone when nothing matches what has been typed —
which is exactly the moment somebody needs telling their answer is acceptable.

**What visitor-written prompts cost.** The fifteen-question tables above were
fixed strings so that two brands could be compared with each other and one brand
with itself next month. Visitor-written prompts give that up: a scan is a
measurement of the questions that visitor chose. Two consequences worth holding
on to —

* the site's copy quotes `MAX_QUESTIONS` — three — everywhere it makes a promise
  about the free scan, and it must keep matching what the scan actually sends.
  The home page promised fifteen against a form that accepted three for some
  time, which is the kind of gap a reader finds by counting the rows in their own
  report; once they have found one they stop trusting the figures the report
  exists to deliver;
* **scheduled monitors still use the generated set.** `Monitors::run()` calls
  `Runner::start()` without a prompt list, so a weekly series keeps asking the
  same questions and stays a trend line. That is the whole reason the tables are
  still here.

### Scanning a competitor

The leaderboard carries a button — *"Run these same questions against
Northmark"* — that seeds the setup screen from the report being read: same
questions, same category, same market, same address, different company.

It is there because that is the moment the question occurs. A reader has just
been shown four companies being recommended in their place, and the next thought
is always *how do they score?* Answering it used to mean scrolling back to an
empty form and retyping three questions from memory, which is enough friction
that almost nobody did — the second and third free scans went unused. A rival's
report is also the most persuasive thing this tool produces, because it turns a
score into a comparison.

Three things worth keeping:

- **The competitor offered first is not the top of the memory list.** It is the
  highest-ranked company named in *both* readings — known to the models and still
  picked after they search. A name in only one column has a different problem
  from the reader, so comparing against it teaches less. See `rankRivals()`.
- **The website is the one field left blank.** The brand match keys on the domain
  root, so a domain guessed from a company name would report a rival as absent
  from answers that named them and hand back a confident, wrong 0% — the exact
  failure this whole report exists to avoid, caused by us. The only domain we
  will prefill is a host the models themselves opened whose name matches the
  competitor, which is evidence rather than a guess (`domainFor()`), and it lands
  in an editable field with a line saying where it came from.
- **The consent box is never pre-ticked**, even though the address carries over.
  Consent under Law 1581 has to be an affirmative act, and the two seconds a
  ticked box saves are not worth holding a consent we could not show was given.

Mechanically it is `Rematch` in `types.ts`, `ScanFlow.startRematch()`, and a
`key` on the setup card that changes only when a rematch starts — the seed is
read once on mount, so a remount is the whole implementation. An effect copying
the seed into state would have to decide what to do about a field the visitor had
already edited, and every answer to that is wrong.

### History

`wp_thallo_history` keeps a handful of numbers per run, forever. It is separate
from the scan precisely so the scan can still be pruned at fourteen days without
throwing away the trend.

- Keyed on **domain + market**, not brand. The same company gets typed
  "Ledgerly", "Ledgerly Inc" and "ledgerly" across three runs; three spellings
  would become three series with one point each.
- **One point per day per series.** Re-running four times in an afternoon does
  not turn a trend into a sawtooth; the day's last run stands. **Say this on the
  report.** It was left to be discovered, and a client who ran the same brand
  twice in one evening — doing exactly what "run it again and this becomes a
  trend" told them to — got the same one-point message back and reported the
  chart as broken. The panel now names the rule in its own subtitle and under the
  chart.
- Written at the **end of phase 1**, so a visitor who never hands over an email
  still leaves a real measurement behind. Phase 2 fills in the grade.
- **Demo runs write nothing.** This table is the one place in the system that is
  meant to be a record; invented numbers here would outlive every banner saying
  they were invented.

The report renders the series as a chart pinned to 0–100 — a fitted axis would
turn a two-point wobble into a cliff — and it **always draws the chart**, with
whatever points exist. What it refuses to draw is a *line* through a single
point: the line is the claim, and one measurement does not support it. A single
run therefore shows as a single dot on a real axis.

It used to replace the chart with a paragraph below two points, and that was
wrong twice over. A section headed "Brand knowledge over time" with a grey box
of prose under it looks like something failed to load, and a reader who thinks
part of the report is broken discounts the parts that are not.

One dot on an empty grid turned out to read the same way, so below two readings
the chart also draws a **grey dashed example** of the shape a series makes —
`EXAMPLE` in `TrendChart.tsx`. It is fixed, unremarkable, never derived from the
visitor's own score, and never joined to the real dot: a line that appeared to
forecast the next reading would be the one genuinely dishonest way to fill that
space. The x-axis draws no dates while it is showing, because the slots are not
days and labelling them would be inventing scans that never ran. It is
captioned "Example" on the chart and named again in the paragraph underneath.

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
the sources the searching models opened and who each of them names;
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
src/lib/scan/types.ts        The contract. Every shape the UI renders, plus
                             MAX_QUESTIONS, the industry suggestions and the
                             free-mailbox list the setup screen checks against.
src/lib/scan/markets.ts      The markets, the 15 questions in each language, and
                             the three suggested questions per archetype.
src/lib/scan/questions.ts    The narrow view of markets.ts the site consumes.
src/lib/scan/engine.ts       Start, tick, unlock. Falls back to demo.ts.
src/lib/scan/demo.ts         Sample data, used only when no API is configured.
src/lib/site.ts              The basePath prefix for hand-written paths.
src/components/scan/         ScanFlow → Setup → Progress → Results → FullReport.
  TrendChart.tsx             Share of voice over time, and its empty state.

wordpress-plugin/thallo-visibility/
  thallo-visibility.php      Bootstrap, cron registration.
  includes/
    class-thallo-rest.php    Routes, validation, the four-layer allowance and
                             the work-email rule, the session cookie, CORS.
    class-thallo-runner.php  The job: start, tick, unlock, serialise.
    class-thallo-llm.php     OpenRouter / OpenAI / Anthropic / Gemini adapters.
    class-thallo-retrieval.php  Perplexity, and AI Overview via SerpApi/DataForSEO.
    class-thallo-tech.php    The crawl: robots.txt, schema, about, freshness.
    class-thallo-analysis.php  Brand matching, competitors, the source table,
                             the entity verdicts, scoring, the plan.
    class-thallo-questions.php  The authoritative prompt set, the markets, and
                             the direct "what is this company" question.
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
