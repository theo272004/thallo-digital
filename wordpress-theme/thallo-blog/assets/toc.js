/**
 * "On this page" — built from the post's own headings, at read time.
 *
 * Not written by hand into each post, because a hand-written contents list is
 * a second copy of the structure that stops matching it the first time a
 * section is renamed. This reads the headings that are actually on the page,
 * so it cannot be wrong.
 *
 * It also gives every h2 an id, which is worth as much as the list itself: a
 * heading with an id is a link somebody can send, and a passage a model can
 * cite by anchor rather than by quoting the whole page.
 */
(function () {
  var nav = document.querySelector('.thallo-toc');
  if (!nav) return;

  var content = document.querySelector('.entry-content') || document.querySelector('.wp-block-post-content');
  if (!content) return;

  var headings = Array.prototype.slice.call(content.querySelectorAll('h2'));

  /* Under two sections there is nothing to navigate — a contents list of one
     item is furniture, and one that says "jump to the only heading" is worse
     than none. The nav stays empty and CSS keeps it out of the flow. */
  if (headings.length < 2) return;

  var used = Object.create(null);

  function slug(text) {
    var base =
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // strip accents; ids stay ascii
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';

    /* Two sections can legitimately share a title. An id used twice makes the
       second one unreachable, so the duplicate gets a suffix. */
    if (used[base]) {
      used[base] += 1;
      return base + '-' + used[base];
    }
    used[base] = 1;
    return base;
  }

  var list = document.createElement('ol');
  list.className = 'thallo-toc__list';

  headings.forEach(function (heading) {
    if (!heading.id) heading.id = slug(heading.textContent || '');

    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = (heading.textContent || '').trim();
    item.appendChild(link);
    list.appendChild(item);
  });

  var label = document.createElement('p');
  label.className = 'thallo-toc__label';
  label.textContent = 'On this page';

  nav.appendChild(label);
  nav.appendChild(list);
  nav.hidden = false;

  /* Which section the reader is in. The bottom margin is large so a heading
     counts as current from the moment it reaches the top third of the screen
     rather than when it is about to leave — otherwise the highlight lags a
     section behind the text being read, which is worse than no highlight. */
  if (!('IntersectionObserver' in window)) return;

  var links = Array.prototype.slice.call(list.querySelectorAll('a'));

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-current', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    },
    { rootMargin: '-90px 0px -68% 0px' }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
})();
