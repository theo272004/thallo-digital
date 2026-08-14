<?php
/**
 * Title: Thallo · short answer
 * Slug: thallo-blog/short-answer
 * Categories: text
 * Description: The two sentences a model would lift if it quoted this post. Goes directly under the opening, before the first heading.
 *
 * This is the highest-leverage block on the page and the easiest one to skip.
 *
 * A model answering a question does not read a post the way a person does. It
 * looks for a passage that answers the question on its own — no "as we saw
 * above", no pronoun pointing at the previous paragraph, nothing that stops
 * making sense once it is lifted out. Most posts never contain such a passage,
 * because prose written to be read in order rarely has one. So the model
 * paraphrases, or quotes somebody who did write one.
 *
 * The rules for what goes in here: answer the title's question in the first
 * sentence, name the subject rather than saying "it", and keep it under about
 * sixty words. If the box reads oddly on its own, it will read oddly in an
 * answer too — that is the test, and it is the whole point of the box.
 *
 * @package Thallo_Blog
 */

?>
<!-- wp:group {"className":"thallo-answer","backgroundColor":"olive-tint","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}},"border":{"radius":"14px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group thallo-answer has-olive-tint-background-color has-background" style="border-radius:14px;margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50);padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"className":"thallo-answer__label","fontSize":"small","textColor":"olive"} -->
<p class="thallo-answer__label has-olive-color has-text-color has-small-font-size"><strong>Short answer</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"placeholder":"Answer the title in one or two sentences. Name the subject instead of saying “it”, and make it read correctly with nothing around it."} -->
<p>Replace this with the answer itself — the passage you would want quoted back at you, written so it still makes sense with the rest of the post removed.</p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
