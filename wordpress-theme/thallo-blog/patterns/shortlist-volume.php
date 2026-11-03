<?php
/**
 * Title: Thallo · AI Shortlist volume
 * Slug: thallo-blog/shortlist-volume
 * Categories: featured, text
 * Block Types: core/post-content
 * Post Types: page
 * Template Types: shortlist-volume
 * Description: The whole shape of a volume of The AI Shortlist — the lede, the finding, the two shortlists, the per-model table, the firms on both surfaces, the split by question type, what the results are made of, the case, the aside, the questions and the colophon. Insert it into an empty page under /ai-shortlist/ and write over it.
 *
 * Every number and every firm name below is a placeholder in square brackets.
 * Do not publish them. The real data arrives after the study is run.
 *
 * The section order is fixed across every volume and is not a suggestion: a
 * reader of Volume 03 already knows where the comparison is. Write over the
 * brackets; do not reorder.
 *
 * ## The tables
 *
 * Every ranking on this page is a plain table block. Type the mention rate into
 * its cell as a percentage — "72%" — and the theme draws the bar from it. The
 * header row decides what each column is: "#", "Firm", a heading containing
 * "rate" or "share" for the bar, "position" or "Google rank" for the
 * right-aligned figure, and anything else becomes a note under the name.
 *
 * The one exception is the per-model table, which carries `thallo-models` and
 * opts out of the bars on purpose: three bars across three columns is a chart
 * pretending to be a table, and that table exists to be compared by eye.
 *
 * ## The two shortlists
 *
 * The side-by-side block is two of those same tables inside a columns block,
 * one marked `thallo-surface` and the other `thallo-surface thallo-surface--google`.
 * The second is what recolours its bars from olive to grey. Nothing else about
 * editing them differs, and swapping which surface is which is one class.
 *
 * @package Thallo_Blog
 */

?>
<!-- ══ The lede ════════════════════════════════════════════════════════════
     Two paragraphs. The first says what was asked and how; the second says who
     this volume is for. Everything after this assumes both. -->
<!-- wp:paragraph {"className":"thallo-lede"} -->
<p class="thallo-lede">[What was asked, and how. Example: Before anyone picks up the phone to call a firm in this category, someone on the buying side has usually already asked a model which ones to call. We put the twelve questions a real buyer would type to ChatGPT, Claude and Gemini, three times each, then asked Google the same twelve. No firm was picked ahead of time.]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"thallo-lede"} -->
<p class="thallo-lede">[Who this is for, in one sentence.]</p>
<!-- /wp:paragraph -->

<!-- ══ 1 · The finding ═════════════════════════════════════════════════════
     One number and two sentences. The number counts up on the page; write it
     the way it should be read — "54%", "2 of 12", "108". -->
<!-- wp:group {"className":"thallo-finding","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-finding">
<!-- wp:paragraph {"className":"thallo-finding__stat","textColor":"olive"} -->
<p class="thallo-finding__stat has-olive-color has-text-color">2 of 12</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"className":"thallo-finding__p","fontSize":"large","textColor":"grey-900"} -->
<p class="thallo-finding__p has-grey-900-color has-text-color has-large-font-size">[The finding, in two sentences. Example: The four firms the models name in roughly seven of every ten answers turn up in exactly two of the twelve plain Google searches, three appearances in total.]</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph -->
<p>[One more sentence, the sharpest version of the same fact. Example: One of the four does not appear in Google's organic results at all.]</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- ══ 2 · The two shortlists ══════════════════════════════════════════════ -->
<!-- wp:heading -->
<h2 class="wp-block-heading">AI and Google are building two different shortlists</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph introducing the comparison, before the reader reaches it.]</p>
<!-- /wp:paragraph -->

<!-- wp:columns {"align":"wide","className":"thallo-surfaces"} -->
<div class="wp-block-columns alignwide thallo-surfaces">

<!-- wp:column {"className":"thallo-surface"} -->
<div class="wp-block-column thallo-surface">
<!-- wp:html -->
<p class="thallo-surface__h">Named by AI</p>
<p class="thallo-surface__sub">Mention rate across 108 responses · ChatGPT, Claude, Gemini</p>
<!-- /wp:html -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-rank"} -->
<figure class="wp-block-table thallo-rank"><table><thead><tr><th>#</th><th>Firm</th><th>Mention rate</th></tr></thead><tbody><tr><td>1</td><td>[Firm name]</td><td>72%</td></tr><tr><td>2</td><td>[Firm name]</td><td>71%</td></tr><tr><td>3</td><td>[Firm name]</td><td>70%</td></tr><tr><td>4</td><td>[Firm name]</td><td>69%</td></tr><tr><td>5</td><td>[Firm name]</td><td>47%</td></tr><tr><td>6</td><td>[Firm name]</td><td>43%</td></tr></tbody></table></figure>
<!-- /wp:table -->
</div>
<!-- /wp:column -->

<!-- wp:column {"className":"thallo-surface thallo-surface--google"} -->
<div class="wp-block-column thallo-surface thallo-surface--google">
<!-- wp:html -->
<p class="thallo-surface__h">Ranked by Google</p>
<p class="thallo-surface__sub">Share of the 12 organic searches it appeared in</p>
<!-- /wp:html -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-rank"} -->
<figure class="wp-block-table thallo-rank"><table><thead><tr><th>#</th><th>Firm</th><th>What ranks</th><th>Share</th></tr></thead><tbody><tr><td>1</td><td>[Firm name]</td><td>Own ranking post</td><td>75%</td></tr><tr><td>2</td><td>[Firm name]</td><td>Own ranking post</td><td>50%</td></tr><tr><td>3</td><td>[Firm name]</td><td>Third-party ranking</td><td>50%</td></tr><tr><td>4</td><td>[Firm name]</td><td>Own service page</td><td>33%</td></tr></tbody></table></figure>
<!-- /wp:table -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

<!-- wp:paragraph {"className":"thallo-overlap"} -->
<p class="thallo-overlap">[The overlap, in one line. Example: One name appears on both lists above: [Firm].]</p>
<!-- /wp:paragraph -->

<!-- ══ 3 · The three models ════════════════════════════════════════════════ -->
<!-- wp:heading -->
<h2 class="wp-block-heading">The three models don't even agree with each other</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph: the combined number hides a disagreement. Split the answers back out by model and the three don't look much like each other.]</p>
<!-- /wp:paragraph -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-rank thallo-models"} -->
<figure class="wp-block-table thallo-rank thallo-models"><table><thead><tr><th>Firm</th><th>ChatGPT</th><th>Claude</th><th>Gemini</th></tr></thead><tbody><tr><td>[Firm name]</td><td>56%</td><td>61%</td><td>25%</td></tr><tr><td>[Firm name]</td><td>56%</td><td>53%</td><td>6%</td></tr><tr><td>[Firm name]</td><td>72%</td><td>14%</td><td>42%</td></tr><tr><td>[Firm name]</td><td>6%</td><td>17%</td><td>47%</td></tr></tbody></table><figcaption class="wp-element-caption">Mention rate by model, 36 responses each.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>[One paragraph on the model that leans one way, with the figures that show it.]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>[One paragraph on the model that leans the other way.]</p>
<!-- /wp:paragraph -->

<!-- ══ 4 · Named on both surfaces ══════════════════════════════════════════
     Two readings of the same firm, tagged with the two surfaces' colours. The
     tags are inline spans inside the paragraph — keep them at the front of the
     line, and keep them to these two classes. -->
<!-- wp:heading -->
<h2 class="wp-block-heading">[The firm that made both lists without publishing a ranking]</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph on why that is interesting, and what everybody else did instead.]</p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"thallo-both","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-both">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Firm name]</h3>
<!-- /wp:heading -->
<!-- wp:html -->
<p><span class="thallo-tag thallo-tag--olive">In the answers</span>[What the models did with it, with its mention rate and rank.]</p>
<p><span class="thallo-tag thallo-tag--grey">On the page</span>[What Google did with it, and through what kind of page.]</p>
<!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"thallo-both","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-both">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Firm name]</h3>
<!-- /wp:heading -->
<!-- wp:html -->
<p><span class="thallo-tag thallo-tag--olive">In the answers</span>[Mention rate and rank.]</p>
<p><span class="thallo-tag thallo-tag--grey">On the page</span>[Share of the searches, and how it got there.]</p>
<!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- ══ 5 · The split by question type ══════════════════════════════════════
     Four figures. They count up on the page; write them as they should read. -->
<!-- wp:heading -->
<h2 class="wp-block-heading">The big firms' grip is tightest on the hardest questions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph introducing the split.]</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="thallo-catgrid">
  <div><span class="thallo-cat__n">69%</span><span class="thallo-cat__l">By function<br>e.g. "hiring a CFO"</span></div>
  <div><span class="thallo-cat__n">83%</span><span class="thallo-cat__l">By sector<br>e.g. "healthcare firms"</span></div>
  <div><span class="thallo-cat__n">96%</span><span class="thallo-cat__l">By situation<br>e.g. "founder succession"</span></div>
  <div><span class="thallo-cat__n">33%</span><span class="thallo-cat__l">General<br>e.g. "best firms overall"</span></div>
</div>
<!-- /wp:html -->

<!-- wp:paragraph {"className":"thallo-cutoff","fontSize":"small"} -->
<p class="thallo-cutoff has-small-font-size">Average combined mention rate of the [four] largest firms, by question type.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>[One paragraph reading the split: what the specific questions do, what the broad ones do, and where the rest of this volume's findings live.]</p>
<!-- /wp:paragraph -->

<!-- ══ 6 · What the results are made of ════════════════════════════════════ -->
<!-- wp:heading -->
<h2 class="wp-block-heading">Most of what ranks here is written by the firms it's ranking</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One line before the breakdown.]</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ul class="thallo-mix">
  <li style="--pct:40"><span>The firm's own service or practice page</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">43</span></li>
  <li style="--pct:34"><span>The firm's own ranking, self-published</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">37</span></li>
  <li style="--pct:8"><span>Someone else's ranking</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">9</span></li>
  <li style="--pct:7"><span>Forums and community threads</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">8</span></li>
  <li style="--pct:6"><span>Independent trade press</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">7</span></li>
  <li style="--pct:2"><span>Professional association resources</span><span class="thallo-mix__track" aria-hidden="true"><span class="thallo-mix__fill"></span></span><span class="thallo-mix__n">2</span></li>
</ul>
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>[One paragraph adding the first two rows together and saying what that means.]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>[One line introducing the domains the models cited.]</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ol class="thallo-domains">
  <li><span class="thallo-d__name">[domain.com]</span><span class="thallo-d__c">27 citations</span></li>
  <li><span class="thallo-d__name">[domain.com]</span><span class="thallo-d__c">12</span></li>
  <li><span class="thallo-d__name">[domain.com]</span><span class="thallo-d__c">11</span></li>
  <li><span class="thallo-d__name">[domain.com]</span><span class="thallo-d__c">10</span></li>
  <li><span class="thallo-d__name">[domain.com]</span><span class="thallo-d__c">9</span></li>
</ol>
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>[One line on the concentration. Example: One domain accounts for more citations than the next two combined.]</p>
<!-- /wp:paragraph -->

<!-- ══ 7 · The case ════════════════════════════════════════════════════════
     One firm read at length, on the tint. The caveat at the bottom is not
     optional: it is what keeps a description of a pattern from reading as an
     accusation. -->
<!-- wp:heading -->
<h2 class="wp-block-heading">[How one firm became the most cited name in the study]</h2>
<!-- /wp:heading -->

<!-- wp:group {"className":"thallo-case","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-case">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Firm name]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One line saying what the firm is.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">What it publishes</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>[What it publishes, and how it is framed.]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[How closely those categories line up with the ones measured.]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Anything a model said about it directly, quoted exactly.]</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">What that produced</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>[Share of the organic results.]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Share of the citations.]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Its actual mention rate, and where that ranks.]</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph {"className":"thallo-case__caveat"} -->
<p class="thallo-case__caveat">[The caveat. This describes a pattern in what was published and what came back, not a judgment on the firm. Say plainly what the result genuinely is, and what is notable about the gap.]</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- ══ The aside ═══════════════════════════════════════════════════════════
     What was seen but not measured the same way. It is quieter than a section
     on purpose: a finding that was not held to the study's standard must not
     look like one that was. Delete the whole block if there is nothing. -->
<!-- wp:group {"className":"thallo-aside","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-aside">
<!-- wp:paragraph {"className":"thallo-aside__eyebrow"} -->
<p class="thallo-aside__eyebrow">Worth watching, not yet measured</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[What was noticed]</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>[What was seen, and how it differed from what the study measured.]</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph -->
<p>[Why it is not held to the same standard, and when it will be.]</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- ══ 8 · The questions ═══════════════════════════════════════════════════ -->
<!-- wp:heading -->
<h2 class="wp-block-heading">The 12 questions, so you can run them yourself</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>All twelve, exactly as they were typed, in the models and in Google. Run them and you should land somewhere close to what we found.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">By function</h4>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"className":"thallo-questions"} -->
<ol class="wp-block-list thallo-questions"><!-- wp:list-item -->
<li>[Question 1]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 2]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 3]</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">By sector</h4>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"start":4,"className":"thallo-questions"} -->
<ol start="4" class="wp-block-list thallo-questions"><!-- wp:list-item -->
<li>[Question 4]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 5]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 6]</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">By situation</h4>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"start":7,"className":"thallo-questions"} -->
<ol start="7" class="wp-block-list thallo-questions"><!-- wp:list-item -->
<li>[Question 7]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 8]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 9]</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">General</h4>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"start":10,"className":"thallo-questions"} -->
<ol start="10" class="wp-block-list thallo-questions"><!-- wp:list-item -->
<li>[Question 10]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 11]</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>[Question 12]</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- ══ The colophon ════════════════════════════════════════════════════════ -->
<!-- wp:group {"className":"thallo-colophon","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-colophon">
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">How this volume was run</h4>
<!-- /wp:heading -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-colophon__table"} -->
<figure class="wp-block-table thallo-colophon__table"><table><tbody><tr><td>Study run</td><td>[Date range]</td></tr><tr><td>Models</td><td>ChatGPT, Claude, Gemini</td></tr><tr><td>Location</td><td>[US location used for all runs]</td></tr><tr><td>AI responses</td><td>108 (12 questions × 3 models × 3 runs)</td></tr><tr><td>Google results</td><td>108 organic results (12 questions, one run each)</td></tr><tr><td>Sessions</td><td>Clean sessions, no memory, no account history</td></tr><tr><td>Not measured</td><td>[What was observed but not tracked, named plainly]</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph {"className":"thallo-colophon__honesty","fontSize":"small"} -->
<p class="thallo-colophon__honesty has-small-font-size">Model answers vary between users, locations and versions, and so do search results. This is a sample taken on the dates above and is meant as a directional read, not a definitive measurement. No firm was selected in advance: every name here came out of the responses.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
