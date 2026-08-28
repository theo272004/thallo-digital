=== Thallo Visibility Engine ===
Contributors: thallodigital
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.10.1
License: GPLv2 or later

Backend for the Check My Visibility tool: asks the AI models the buying
questions in a category and counts how often a brand is named.

== Description ==

This plugin does not add anything to the front of your website. It exists to
serve a REST API to a separate static site, and to give you a screen to put the
API keys on and a screen to read the leads from.

What a scan does:

1. Puts the visitor's own buying questions — three on the free tier — to
   ChatGPT, Claude and Gemini with web search off. The brand's name never
   appears in one of them, so no answer can be led.
2. Asks the same questions again with search on, which is a different
   measurement: the first says whether a model knows you, the second whether it
   picks you once it has looked. They are never averaged.
3. Counts how many answers name the brand, and at what rank, in each reading.
4. Tallies every other company named — the competitors being recommended
   instead — and, for the searching half, which pages the models opened before
   answering and who each page put in front of the buyer.
5. Asks each model directly, by name, what this company is and who it serves.
   This is the one question that mentions the brand, and it is what separates
   "never heard of you" from "confused you with somebody else".
6. Asks Perplexity the same category question with retrieval on, and reads the
   Google AI Overview through a search-results provider.
7. Crawls the brand's own site for crawler access, whether the content arrives
   in the HTML at all, schema, named people, freshness and FAQ markup.

A work email address is collected on the setup screen, before anything runs —
searching costs money on the first call, so there is no free half to hand out
first. The address is stored as a lead and the report is emailed as well as
shown.

== Installation ==

1. Upload the folder to `wp-content/plugins/` or install the zip through
   Plugins → Add New → Upload.
2. Activate it.
3. Visibility → Settings. Paste an OpenRouter key, or switch to Native and paste
   keys for OpenAI, Anthropic and Google.
4. Copy the endpoint shown at the top of that screen and set it as
   NEXT_PUBLIC_SCAN_API when building the website.

Until a key is present the API returns clearly-labelled sample data and the
website shows a banner saying so.

== Frequently Asked Questions ==

= Why is Google AI Overview reported as "not measured"? =

Google publishes no API for it. It has to be read through a search-results
provider — SerpApi or DataForSEO — and neither is configured. The report says so
rather than estimating, and the overall grade averages only what was measured.

= How much does a scan cost? =

Roughly US$0.01–0.03 on the default models. The site-wide daily limit on the
settings screen is the ceiling on what a bad day can cost you.

= Where does visitor data go? =

Scan working data is deleted after the retention period (14 days by default).
Leads are kept until you delete them. IP addresses are stored only as a salted
hash, used to count scans per visitor.

== Changelog ==

= 1.10.1 =
* The crawler's User-Agent pointed webmasters at `/thallo-ai/`, which the
  visibility tool no longer lives at — the scan itself moved to
  `/thallo-ai/scan/`. Cosmetic only: it changes what a site owner sees if
  they look up the bot in their own logs, not the scan, the leads, or
  anything a visitor sees.

= 1.10.0 =
* **The technical scorecard is gone.** Twelve rows of HTTPS, robots.txt, schema
  markup and sitemap dates, scored out of fifty. Two reasons. It could be
  confidently wrong: when the site could not be fetched at all, the robots.txt
  check could not tell "there is no robots.txt" from "we never got a reply", and
  its no-robots branch is a pass worth 25 points — so an unreachable site
  printed 50 / 50 above a panel in which everything else said NOT SCORED. And it
  was the wrong product: this measures what the models say, and a website audit
  has different buyers. `Thallo_Vis_Tech` remains in the tree, uncalled;
  `finish_phase2()` ships an empty signal list, which the report and the email
  already treat as "did not run".
* **The plan is built from the answers now.** `Analysis::actions()` used to open
  with the two heaviest failed technical signals, which put "add Organization
  schema" at the top of a report about model recommendations. It now leads with
  a name resolving to another company, then the third-party sources the models
  opened that do not mention the brand — named individually — then the gap
  between the memory and searching readings, which is a different instruction in
  each direction. It takes the scan state as an optional fourth argument and is
  therefore assembled after the entity rows, the sources and the grounded
  reading are attached.
* One fewer step per scan, so phase 2 finishes sooner.

= 1.9.0 =
* **The allowance can be asked about before it is spent.** `/quota` now also
  accepts POST with an address and a website, and answers exactly what `/scan`
  would — so the site can refuse beside the field instead of on the far side of
  a scan that appears to start and then does not. The address travels in the
  body rather than in a query string, because a lead in a URL is a lead in an
  access log.
* **"You have reached the limit of free scans."** The per-address refusal used
  to say "that address has used its free scans", which is the same sentence
  with instructions attached: told which counter is binding, the obvious move
  is a second address. Both the browser layer and the address layer now say the
  same thing and neither names a counter.
* **Addresses with no limit.** A new setting on the allowance screen takes a
  list of IPs that skip every counter, including the site-wide one. It is for
  the machine that demonstrates the tool — recording a walkthrough means six
  scans of six other companies in an afternoon, which to the limiter is
  indistinguishable from abuse. Exact matches only, and the screen prints the
  address you are browsing from so there is nothing to guess.

= 1.8.0 =
* **The direct question.** Each model is now asked, by name, what this company
  is and who it serves — the one question in the scan that mentions the brand,
  because it is the only one that is not about ranking. It answers what a 0%
  share of answer cannot: whether the models have never heard of you, know you
  and cannot say who you are for, or resolve your name to somebody else's
  company. The verdict is derived from the answer rather than judged by a
  second model call: a website the model names that is not yours is a
  wrong-company verdict, and the site it named is printed as the evidence.
* **Where the answers were read from.** The pages the searching models opened
  are now kept per answer and crossed against the companies that same answer
  named, so the report can say which sources carry the category and whether the
  brand is in any of them. Hosts seen once are dropped; the brand's own domain
  is kept and flagged, because "every source that mentioned you was your own
  website" is the finding.
* **Can a crawler read the page at all.** A new technical check. robots.txt says
  a crawler is allowed in; this says whether there is anything to read once it
  is. None of the crawlers these models use runs JavaScript, so a page assembled
  in the browser reaches them blank — and the report used to show a green tick
  for crawler access above a share of answer of zero with nothing connecting the
  two.
* **The free allowance is counted in four layers** — browser, address, network
  and the website being scanned — because a cookie alone is cleared in ten
  seconds and an IP alone punishes a shared office. `GET /quota` reports what is
  left so the site can print "Scan 1 of 3" before anything is spent, and no
  layer is ever reported as a technical error.
* **Free scans are for company email addresses.** Gmail, Outlook, Yahoo, iCloud
  and the disposable providers are turned down at the REST layer, with a switch
  on the settings screen. The address is now written to the scan row at creation
  rather than at unlock, so an abandoned scan still counts against the allowance.
* The report email is now the fuller document rather than a shortened copy of
  the screen: both readings side by side, the entity verdicts, the sources, the
  full technical read row by row, and the scan on record — date, market, models
  and the exact questions — so it survives being forwarded without context.
* Database: `session_hash` on the scans table, and indexes for counting by
  address and by domain.

= 1.7.5 =
* Gemini answers. Reasoning is no longer switched off — Google refuses that
  outright ("Reasoning is mandatory for this endpoint and cannot be disabled"),
  and the parameter meant to rescue the reading was what kept killing it. What
  the model needed was room: at 400 tokens it spent the budget thinking and the
  answer came back truncated. Nothing is sent about reasoning now, and the
  ceiling covers the thinking as well as the list — 1600 for a model that
  reasons, 900 for the rest, and a ceiling costs nothing when it is not reached.
* Verified against the real API rather than reasoned about: seven request shapes
  put to Gemini and to Luna, one short question each. All four models now pass
  the model check.
= 1.7.4 =
* Gemini is asked as `google/gemini-3.7-flash`, in both readings. Newer than the
  3.6 it replaces and half its price on input and output alike. The same id in
  both halves, because the finding is the gap between them and a gap measured
  across two different models is partly a difference between the models.
= 1.7.3 =
* The searching reading stops asking for JSON mode. The provider finally said
  why every grounded ChatGPT call had been failing: "[Azure] Web Search cannot
  be used with JSON mode." Search and `response_format` cannot be requested in
  the same call, and every one of those calls asked for both. Three previous
  attempts blamed a parameter; it was the pair. The format is still asked for in
  the prompt, and the parser already reads JSON out of a prose answer.
* Models that reason are recognised by family as well as by catalogue lookup.
  The lookup can fail — and when it does, silently — which is how Gemini spent a
  whole release with an empty column after the release that fixed it.
= 1.7.2 =
* ChatGPT is asked as `openai/gpt-5.6-luna` again — the current generation,
  the model a person typing into ChatGPT is talking to. It was pulled once for
  failing every call, and the cause turned out to be three separate parameters
  it does not take: `temperature`, `web_search_options` and a token budget
  that its reasoning spent before it could answer. All three are handled from
  the provider's published parameter list now.

= 1.7.1 =
* Reasoning is switched off for models that do it. A reasoning model is charged
  its thinking against `max_tokens` before it writes a character of the answer,
  so `google/gemini-3.6-flash` spent a 400-token budget deliberating and
  returned nothing — "Provider returned an empty response", on every question,
  while the two models that do not reason answered normally. The column read as
  Gemini having no opinion about the brand.
* Its own version number, which 1.7.0 did not get. The fix above shipped inside
  1.7.0 after 1.7.0 had already been installed, so there was no way to tell from
  the plugins screen which of the two builds was running — and the obvious
  reading of a scan that still failed was that the fix had not worked.

= 1.7.0 =
* The contact forms have a backend. Both of them had an empty endpoint, so
  submitting opened the visitor's own mail client and hoped: no row, no
  notification, and nothing at all if they had no mail client set up. They now
  post to this plugin, which records the enquiry, emails it to the notify
  address with the sender on Reply-To, and writes back to the person to say a
  human will answer within a working day. Visibility → Enquiries lists them,
  including whether that reply actually left.
* The logo is on both emails, on a white header band — the mark is dark on
  transparent and was invisible on the olive one. It is a remote image, so the
  alt text is the company name: blocked, the header still says who it is from.
* Links in emails point at the website rather than at this WordPress. With the
  blog at /blog/, `home_url( '/contact/' )` was a 404 nobody at our end would
  ever have seen.

= 1.6.0 =
* Which model stands for which assistant now lives in the plugin, dated, and
  moves when the plugin is updated. A model id typed into a settings field is
  right on the day it is typed and ages from then on with nothing on screen to
  say so — this installation was still asking `gpt-4o-mini`, a model from 2024,
  under a heading reading "what ChatGPT says". Your own ids are still there,
  under Advanced, and existing ones are kept rather than deleted.
* Settings → "Check the models": asks each configured model one real question
  and reports what came back, including which model actually answered. An id in
  the ChatGPT field belonging to another provider answers every call quite
  happily and puts the wrong name over the numbers.
* Every answer records the model the API says produced it, and the audit trail
  says so when it is not the one asked for.
* `temperature` goes only to models that accept it. OpenAI's current lineup has
  dropped it, so sending it always is what made an old id the only one that
  worked in the ChatGPT slot.
* A 200 response carrying an error object was read as "empty answer"; it now
  reports the provider's own sentence, the same one 1.5.1 taught the non-200
  path to print.
* The audit trail read each model's answers by position, but a failed call
  leaves no row — so every verdict after a failure was printed against the wrong
  question. The per-model bars, and the same line in the report email, counted
  mentions out of questions asked rather than answers received, disagreeing with
  the headline on any run where a call failed. The searching half's progress row
  counted questions it was never going to ask.
* The report email is a designed message rather than a monospaced column of
  numbers — tables and inline styles so it survives Outlook, with the plain-text
  version still sent as the alternative part.
* The free tier is three questions server-side too, and the per-visitor limit
  ships at five while the tool is being tested.

= 1.0.0 =
* First release.
