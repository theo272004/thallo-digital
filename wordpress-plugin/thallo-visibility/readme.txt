=== Thallo Visibility Engine ===
Contributors: thallodigital
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.7.0
License: GPLv2 or later

Backend for the Check My Visibility tool: asks the AI models the buying
questions in a category and counts how often a brand is named.

== Description ==

This plugin does not add anything to the front of your website. It exists to
serve a REST API to a separate static site, and to give you a screen to put the
API keys on and a screen to read the leads from.

What a scan does:

1. Puts fifteen buying questions about a category to ChatGPT, Claude and Gemini,
   with web search off. The brand's name never appears in a question, so no
   answer can be led.
2. Counts how many answers name the brand, and at what rank.
3. Tallies every other company named — the competitors being recommended instead.
4. Asks Perplexity the same category question with retrieval on, and reads the
   Google AI Overview through a search-results provider.
5. Crawls the brand's own site for crawler access, schema, named people,
   freshness and FAQ markup.

The first three steps are free to the visitor. The last two are unlocked with an
email address, which is stored as a lead.

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
