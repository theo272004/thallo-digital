<?php
/**
 * Title: Thallo · AI Shortlist volume
 * Slug: thallo-blog/shortlist-volume
 * Categories: featured, text
 * Block Types: core/post-content
 * Post Types: page
 * Template Types: shortlist-volume
 * Description: The whole shape of a volume of The AI Shortlist — the finding, the ranking table, the three surprises, the sources, the patterns, the Google comparison, the questions and the colophon. Insert it into an empty page under /ai-shortlist/ and write over it.
 *
 * Every number and every firm name below is a placeholder in square
 * brackets. Do not publish them. The real data arrives after the study is run.
 *
 * The section order is fixed across every volume and is not a suggestion: a
 * reader of Volume 03 already knows where the table is. Write over the
 * brackets; do not reorder.
 *
 * The two ranking tables are plain table blocks. Type the mention rate into
 * its cell as a percentage — "78%" — and the theme draws the bar from it on
 * the page. The header row decides what each column is: "#", "Firm", a heading
 * containing "rate" for the bar, "position" or "Google rank" for the
 * right-aligned figure, and anything else is a note that drops out on a phone.
 *
 * @package Thallo_Blog
 */

?>
<!-- wp:group {"className":"thallo-finding","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-finding">
<!-- wp:paragraph {"className":"thallo-finding__stat","textColor":"olive"} -->
<p class="thallo-finding__stat has-olive-color has-text-color">54%</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"className":"thallo-finding__p","fontSize":"large","textColor":"grey-900"} -->
<p class="thallo-finding__p has-grey-900-color has-text-color has-large-font-size">[The finding, in two sentences. Example: Three firms accounted for more than half of every mention across 108 responses. The remaining mentions were split between nine firms, and four of those appeared in only one kind of question.]</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Who got named</h2>
<!-- /wp:heading -->

<!-- wp:table {"align":"wide","hasFixedLayout":false,"className":"thallo-rank"} -->
<figure class="wp-block-table alignwide thallo-rank"><table><thead><tr><th>#</th><th>Firm</th><th>Mention rate</th><th>Avg. position</th><th>Strongest in</th></tr></thead><tbody><tr><td>1</td><td>[Firm name]</td><td>78%</td><td>1.4</td><td>Generic</td></tr><tr><td>2</td><td>[Firm name]</td><td>61%</td><td>2.1</td><td>By function</td></tr><tr><td>3</td><td>[Firm name]</td><td>33%</td><td>3.0</td><td>By sector</td></tr><tr><td>4</td><td>[Firm name]</td><td>12%</td><td>4.6</td><td>By situation</td></tr></tbody></table><figcaption class="wp-element-caption">Mention rate across 108 responses. ChatGPT, Claude and Gemini, 12 buying questions, 3 runs each.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:paragraph {"className":"thallo-cutoff","fontSize":"small"} -->
<p class="thallo-cutoff has-small-font-size">[Cutoff note. Example: 31 firms were named at least once. The table shows every firm above a 10% mention rate.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Three things that surprised us</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[The large firm that barely appeared]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph. What the firm is in the market, what it was in the answers, and the most likely reason for the gap.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[The smaller firm that outperformed]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[The firm that only exists in one kind of question]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Where the answer comes from</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph on what kind of source dominates, written before the table.]</p>
<!-- /wp:paragraph -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-sources"} -->
<figure class="wp-block-table thallo-sources"><table><thead><tr><th>Source</th><th>Type</th><th>Share</th></tr></thead><tbody><tr><td>[domain.com]</td><td>[Directory / listicle / trade press / the firm itself]</td><td>24%</td></tr><tr><td>[domain.com]</td><td>[Type]</td><td>18%</td></tr><tr><td>[domain.com]</td><td>[Type]</td><td>11%</td></tr></tbody></table><figcaption class="wp-element-caption">Share of every citation across the 108 responses, by domain.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>[Closing paragraph: what this means for a firm that wants to be named.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What the named firms have in common</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Pattern 1 — presence in the sources that get cited]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph, with the supporting number. This section explains why, never what to do: no recommendations, no checklists, no playbook.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Pattern 2 — what they publish]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph, with the supporting number.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">[Pattern 3 — how clearly the models describe them]</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph, with an example of a firm the models describe wrongly or confuse with a competitor.]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"thallo-closing-note"} -->
<p class="thallo-closing-note">[Closing line. None of these signals depends on a large firm's budget, which is why [boutique name] sits where it does in the table.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Ranks on Google, missing from the answer</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[One paragraph introducing what the comparison shows. Only the four general questions are run as ordinary Google searches; the AI column reuses the mention rate from the main table. Rows sorted by the size of the gap, biggest first.]</p>
<!-- /wp:paragraph -->

<!-- wp:table {"align":"wide","hasFixedLayout":false,"className":"thallo-rank thallo-rank--gap"} -->
<figure class="wp-block-table alignwide thallo-rank thallo-rank--gap"><table><thead><tr><th>Firm</th><th>Google rank</th><th>AI mention rate</th><th>Gap</th></tr></thead><tbody><tr><td>[Firm name]</td><td>2</td><td>4%</td><td>Ranks, rarely named</td></tr><tr><td>[Firm name]</td><td>—</td><td>61%</td><td>Named, doesn't rank</td></tr><tr><td>[Firm name]</td><td>5</td><td>9%</td><td>Ranks, rarely named</td></tr></tbody></table><figcaption class="wp-element-caption">Top 10 organic results for the four general questions, against mention rate in AI answers.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>[Closing paragraph: what the overlap, or the lack of it, means.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The questions we asked</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>All twelve, exactly as they were typed. Run them yourself and you should land somewhere close.</p>
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

<!-- wp:group {"className":"thallo-colophon","layout":{"type":"default"}} -->
<div class="wp-block-group thallo-colophon">
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">How this volume was run</h4>
<!-- /wp:heading -->

<!-- wp:table {"hasFixedLayout":false,"className":"thallo-colophon__table"} -->
<figure class="wp-block-table thallo-colophon__table"><table><tbody><tr><td>Study run</td><td>[Date range]</td></tr><tr><td>Models</td><td>ChatGPT, Claude, Gemini</td></tr><tr><td>Location</td><td>[US location used for all runs]</td></tr><tr><td>Responses</td><td>108 (12 questions × 3 models × 3 runs)</td></tr><tr><td>Google check</td><td>Top 10 organic for the 4 general questions, same date and location</td></tr><tr><td>Sessions</td><td>Clean sessions, no memory, no account history</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph {"className":"thallo-colophon__honesty","fontSize":"small"} -->
<p class="thallo-colophon__honesty has-small-font-size">Model answers vary between users, locations and versions. This is a sample taken on the dates above and is meant as a directional read, not a definitive measurement. No firm was selected in advance: every name in the table came out of the responses.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
