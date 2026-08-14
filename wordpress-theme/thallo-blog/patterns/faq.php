<?php
/**
 * Title: Thallo · common questions
 * Slug: thallo-blog/faq
 * Categories: text
 * Description: Three or four real follow-up questions, at the end of a post. The theme turns these into FAQPage markup automatically.
 *
 * Two jobs, and only one of them is visible.
 *
 * The visible one: a reader who got to the bottom usually has one more
 * question, and answering it here is cheaper than making them ask.
 *
 * The invisible one: the theme reads this section back out of the post and
 * emits FAQPage structured data from it (see thallo_blog_faq_schema). That is
 * the markup a model uses to decide that a question on this page was answered
 * on this page — and it is one of the things Thallo's own scan awards points
 * for, which makes shipping a blog without it an awkward position to sell from.
 *
 * The parser is deliberately literal: a heading is a question, the paragraphs
 * under it are its answer, and both live inside the group below. Write real
 * questions the way somebody would type them; a heading that is not a question
 * produces structured data claiming a question was answered when none was
 * asked, which is worse than having no markup at all.
 *
 * @package Thallo_Blog
 */

?>
<!-- wp:group {"className":"thallo-faq","style":{"spacing":{"margin":{"top":"var:preset|spacing|60"},"padding":{"top":"var:preset|spacing|50"}},"border":{"top":{"color":"var:preset|color|hairline","width":"1px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group thallo-faq" style="border-top-color:var(--wp--preset--color--hairline);border-top-width:1px;margin-top:var(--wp--preset--spacing--60);padding-top:var(--wp--preset--spacing--50)">

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Common questions</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3,"fontSize":"medium","placeholder":"A question somebody would actually type"} -->
<h3 class="wp-block-heading has-medium-font-size">Is share of answer the same thing as AI visibility?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>They are related but not identical. AI visibility is the broad idea of appearing in AI-generated answers. Share of answer is one metric inside it: the percentage of a fixed question set where the brand is named.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"fontSize":"medium"} -->
<h3 class="wp-block-heading has-medium-font-size">How often is it worth measuring?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Monthly is enough for most categories. Model answers drift on their own, so measuring weekly mostly records that drift rather than anything the work changed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"fontSize":"medium"} -->
<h3 class="wp-block-heading has-medium-font-size">Does this replace search rankings?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>No. Rankings still matter wherever clicks still happen. This covers the growing share of research that ends without one, which a rank tracker cannot see at all.</p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
