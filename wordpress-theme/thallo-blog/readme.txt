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
