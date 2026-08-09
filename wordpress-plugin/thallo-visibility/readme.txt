=== Thallo Visibility Engine ===
Contributors: thallodigital
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.4.1
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

= 1.0.0 =
* First release.
