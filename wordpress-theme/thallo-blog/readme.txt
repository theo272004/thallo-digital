=== Thallo Blog ===
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
License: GPL-2.0-or-later
Template: twentytwentyfive

Puts the WordPress blog in Thallo's own type and colour, and ships the post
patterns you write with.

== Installing ==

1. Zip the `thallo-blog` folder itself — so the zip contains `thallo-blog/`,
   not the loose files.
2. Appearance -> Themes -> Add New -> Upload Theme -> Activate.
3. Twenty Twenty-Five must stay installed. This is a child theme: it borrows
   every template from the parent and only changes how they look. Deleting the
   parent breaks the blog.

Nothing else to configure. There are no theme options on purpose — options are
how two people end up with two versions of the same brand.

== Writing a post ==

New post -> the + button -> Patterns -> search "Thallo".

* **Thallo · post skeleton** — the whole shape of a post: lead, sections, a
  callout, the sign-off. Insert it into an empty post and write over it. It is
  a starting point, not a form; delete what a given post does not need.
* **Thallo · callout** — the tinted box, for the one sentence you would want
  quoted back to you. Once per post.
* **Thallo · run the scan** — the dark panel that sends a reader to the free
  visibility scan. At the end, once.

== Two publications, two doors ==

The admin menu has a door for each, and the difference is the whole
instruction:

* **Blog -> New article.** A post. The article pattern is offered in the
  empty editor; the featured image, excerpt and category are the only
  choices. Everything else — the photograph as the ground of the page, the
  contents list, the sign-off, "Keep reading" — is the template.
* **AI Shortlist -> New volume.** A page under the hub, already filed there,
  already holding the volume pattern. Write over the brackets, set the
  Industry and the excerpt, choose the date, publish or schedule. "All
  volumes" lists only the series; "The hub page" opens the hub (and makes
  it, as a draft, if it does not exist yet).

== The AI Shortlist ==

The research series is pages, not posts. It does not appear in the blog's
archive or feed, and nothing about it is configured: the theme recognises it
by where the pages sit.

* **The hub** is the page whose slug is `ai-shortlist`. Its title is the
  masthead, its excerpt is the italic question under it, and its content is
  the introduction (two short paragraphs). The template
  `templates/page-ai-shortlist.html` applies itself to that slug.
* **A volume** is any page filed under the hub (Page Attributes -> Parent ->
  The AI Shortlist). Its title is the category ("Executive search firms"),
  its excerpt is the question under the title and the teaser on the hub, and
  the **Industry** box in the sidebar is the label on the hub row. The
  template `AI Shortlist · Volume` applies itself to every child page; it is
  also listed under Templates for the odd case.
* **The number** of a volume is its position in the list, by date. Nobody
  types "Volume 03". To force an order, set Page Attributes -> Order.
* **Scheduled volumes appear on the hub.** Set a future date and publish:
  the row shows in grey with "Coming soon" and the date, with no link, until
  WordPress publishes it. Drafts do not appear.
* **Writing a volume:** new page under the hub -> the + button -> Patterns
  -> "Thallo · AI Shortlist volume". It is the whole shape of a study, in
  the order every volume keeps. Write over the brackets; do not reorder.
* **The ranking tables** are ordinary table blocks. Type the mention rate
  as a percentage — "78%" — and the theme draws the bar. The header row
  decides the columns: "#", "Firm", a heading containing "rate" gets the
  bar, "position" or "Google rank" is the right-aligned figure, anything
  else is a note that drops out on a phone.
* **The address.** On the production host WordPress is at /blog/, so the
  series answers at /blog/ai-shortlist/ until the rule in
  `deploy/ai-shortlist.htaccess` is pasted into the root .htaccess. The
  theme notices the rule and moves its links to the root on its own.

== How it is styled ==

Almost entirely from `theme.json`, which WordPress applies to the editor and
the front end from the same file. That is the point of a block theme: what you
see while writing is what a reader gets, so a judgement about line length or
heading weight made in the editor is a real one.

`style.css` holds only what theme.json has no vocabulary for — the reading
measure, the space above a heading versus below it, and making wide tables
scroll inside themselves rather than widening the page.

The palette is the site's five greens and nothing else. For a ramp, use olive
at falling opacity rather than picking a new green.

== Known and deliberate ==

* **The fonts come from Google's CDN.** The main site self-hosts them. Doing
  the same here would be better — one less third party, and no request to
  Google carrying the reader's address — but it means committing six font
  files and keeping them current, and the blog has one post. Worth doing
  before it has twenty.
* **No custom templates.** Header, footer, archives and single-post layouts
  are the parent's. They are competent and this theme has no reason to
  reimplement them; when the blog needs a header that matches the main site's
  navigation, that is the next thing to add and it belongs in `templates/`.
