/**
 * The AI Shortlist — the entrance.
 *
 * What the site does with GSAP, done here with an IntersectionObserver and
 * four CSS transitions, because the blog has no build step and no reason to
 * ship a library for one page of motion. Four things happen, each once, as
 * the reader reaches them:
 *
 *   1. Sections rise in — `data-reveal`, and every block of a volume's body.
 *   2. Table rows arrive one after another (a stagger by transition-delay).
 *   3. Bars grow from nothing to their figure.
 *   4. Figures count up — the mention rates, the big finding, the method.
 *
 * The markup always ships the finished numbers and nothing is hidden until
 * this runs: a crawler, a reader with JavaScript off and anyone who asked
 * their system for less motion get the page as it is, at rest.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var root = document.querySelector('.thallo-shortlist');
  if (!root) return;

  /* ── What moves ──────────────────────────────────────────────────────────
     The header pieces, anything marked, and every top-level block of the
     study. Marked here rather than in the markup so the page renders at rest
     when this never runs. */
  var targets = [].slice.call(root.querySelectorAll('[data-reveal], .thallo-volume__head > *, .thallo-mast--series > *'));
  var body = root.querySelector('.thallo-volume__body .wp-block-post-content');
  if (body) targets = targets.concat([].slice.call(body.children));

  targets.forEach(function (el) {
    el.classList.add('thallo-reveal');
  });

  /* Rows and bars inside a ranking table are staged separately — the table
     itself rises as one block, then its rows arrive in order.

     Each table is also observed in its own right, and that is load-bearing
     rather than belt-and-braces: the two shortlists sit inside a columns
     block, so their tables are not top-level children of the body and would
     never be reached by the loop above. Marking their rows hidden without ever
     observing the table that unhides them leaves two empty grids on the page —
     which is exactly what happened the first time this ran. */
  root.querySelectorAll('.thallo-rank').forEach(function (table) {
    table.classList.add('thallo-reveal--table');
    [].slice.call(table.querySelectorAll('tbody tr')).forEach(function (tr, i) {
      tr.style.transitionDelay = 0.08 + i * 0.07 + 's';
      var fill = tr.querySelector('.thallo-rate__fill');
      if (fill) fill.style.transitionDelay = 0.16 + i * 0.07 + 's';
    });
    if (targets.indexOf(table) === -1) targets.push(table);
  });

  /* ── Counting ────────────────────────────────────────────────────────────
     A figure marked `data-count` counts from 0 to itself in the format it was
     written in — "78%", "1.4", "108". The suffix and the decimals come from
     the text, so nothing has to be declared twice. */
  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function count(el) {
    /* Once per figure, whatever reaches it.
     *
     * A figure can sit inside two observed elements at the same time — the
     * shortlists' rates are inside a ranking table that is watched in its own
     * right and inside the columns block that holds it — and both hand it to
     * this function. The second call reads the text the first one left behind,
     * which is "0%" at that moment, and dutifully counts from zero to zero.
     * The figure then stays at zero for good. */
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var text = el.textContent.trim();
    var m = text.match(/^([^0-9]*)(\d+(?:[.,]\d+)?)(.*)$/);
    if (!m) return;

    var to = parseFloat(m[2].replace(',', '.'));
    var decimals = (m[2].split(/[.,]/)[1] || '').length;
    var sep = m[2].indexOf(',') > -1 ? ',' : '.';
    var prefix = m[1];
    var suffix = m[3];
    var duration = 1100;
    var start = null;

    el.style.fontVariantNumeric = 'tabular-nums';

    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var v = to * ease(t);
      el.textContent = prefix + v.toFixed(decimals).replace('.', sep) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }

    el.textContent = prefix + (0).toFixed(decimals).replace('.', sep) + suffix;
    requestAnimationFrame(frame);
  }

  /* The big number of the finding counts too; it is not marked in the
     pattern because the writer types it, so it is found by its class. */
  root.querySelectorAll('.thallo-finding__stat').forEach(function (el) {
    el.setAttribute('data-count', '');
  });

  /* The same for the figures the writer types into the blocks that are not
     tables: the split by question type and the makeup of the results. Marked
     here rather than in the pattern for the same reason — somebody editing a
     volume should be typing "96%", not an attribute. */
  root.querySelectorAll('.thallo-cat__n, .thallo-mix__n').forEach(function (el) {
    el.setAttribute('data-count', '');
  });

  /* A bar in the mix list carries its figure twice: once as the number a
     reader sees and once as the width. Reading the width back off the number
     keeps the two from drifting apart when somebody corrects one and forgets
     the other. A count like "43" with no total means nothing as a width, so
     only percentages are read; anything else keeps the --pct it was given. */
  root.querySelectorAll('.thallo-mix__fill').forEach(function (fill) {
    var row = fill.closest('li');
    var fig = row && row.querySelector('.thallo-mix__n');
    if (!fig) return;

    var m = fig.textContent.trim().match(/^(\d+(?:[.,]\d+)?)\s*%$/);
    if (m) fill.style.setProperty('--pct', m[1].replace(',', '.'));
  });

  /* ── Arrival ─────────────────────────────────────────────────────────── */
  var seen = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        seen.unobserve(el);
        el.classList.add('is-in');

        var figures = el.matches('[data-count]') ? [el] : [].slice.call(el.querySelectorAll('[data-count]'));
        figures.forEach(function (fig) {
          /* A figure inside a staggered row starts with its row. */
          var row = fig.closest('tbody tr');
          var delay = row ? parseFloat(row.style.transitionDelay || 0) * 1000 : 0;
          window.setTimeout(function () {
            count(fig);
          }, delay);
        });
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  );

  /* Whatever is already in the window when the page opens comes in on the
     first frame — the observer reports those immediately — so the fold
     never waits for a scroll. */
  targets.forEach(function (el) {
    seen.observe(el);
  });
})();

/**
 * The hub's filter — the pills over the cards.
 *
 * Its own closure, outside the motion above, because a reader who asked for
 * less motion still gets to filter. One click: the pill pressed goes olive,
 * the cards whose industry is not the one chosen are switched off with a
 * class, and "All volumes" switches them all back. Nothing is fetched and
 * nothing is re-rendered: every card is in the markup from the start, so the
 * page without this script is the page with every card showing.
 */
(function () {
  'use strict';

  var filter = document.querySelector('.thallo-filter');
  if (!filter) return;

  var pills = [].slice.call(filter.querySelectorAll('.thallo-filter__pill'));
  var cards = [].slice.call(document.querySelectorAll('.thallo-cards__grid .thallo-cards__item'));

  filter.addEventListener('click', function (event) {
    var pill = event.target.closest('.thallo-filter__pill');
    if (!pill) return;

    var want = pill.getAttribute('data-industry') || '';

    pills.forEach(function (p) {
      var on = p === pill;
      p.classList.toggle('is-on', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    cards.forEach(function (card) {
      var mine = card.getAttribute('data-industry') || '';
      card.classList.toggle('is-off', want !== '' && mine !== want);
    });
  });
})();
