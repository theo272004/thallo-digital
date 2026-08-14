<?php
/**
 * Title: Thallo · the line
 * Slug: thallo-blog/pull-quote
 * Categories: text
 * Description: One sentence from the post, set large between rules. For the sentence the argument turns on.
 *
 * Not a quotation from somebody else — a line already in the post, repeated at
 * size. The point is emphasis, and it only works while it is rare: a post with
 * three of these has told the reader that nothing in it is more important than
 * anything else.
 *
 * Set in the serif, which nothing else in the body uses. That is what makes it
 * read as the author raising their voice rather than as another paragraph in a
 * box.
 *
 * @package Thallo_Blog
 */

?>
<!-- wp:group {"className":"thallo-line","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"},"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}},"border":{"top":{"color":"var:preset|color|hairline","width":"1px"},"bottom":{"color":"var:preset|color|hairline","width":"1px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group thallo-line" style="border-top-color:var(--wp--preset--color--hairline);border-top-width:1px;border-bottom-color:var(--wp--preset--color--hairline);border-bottom-width:1px;margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50);padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"fontFamily":"serif","placeholder":"The sentence the argument turns on, repeated at size."} -->
<p class="has-serif-font-family">Position three on a page nobody scrolls is not a worse result than position one. It is the same result.</p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
