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

  function count(el, again) {
    /* Once per figure, whatever reaches it — unless asked again by a click
       (the replay below).
     *
     * A figure can sit inside two observed elements at the same time — the
     * shortlists' rates are inside a ranking table that is watched in its own
     * right and inside the columns block that holds it — and both hand it to
     * this function. The second call reads the text the first one left behind,
     * which is "0%" at that moment, and dutifully counts from zero to zero.
     * The figure then stays at zero for good. */
    if (el.dataset.counted && !again) return;
    el.dataset.counted = '1';

    var text = el.dataset.text || el.textContent.trim();
    el.dataset.text = text;
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

  /* The per-model table has no bars, but its figures count — on entrance
     and on a click on the row (Cami, 2026-09-22). */
  root.querySelectorAll('.thallo-models tbody td:not(:first-child)').forEach(function (el) {
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

  /* ── Replay on click ─────────────────────────────────────────────────────
     A click on any row or card with a bar runs its entrance again — the bar
     from nothing, the figure from zero (Cami, 2026-09-22). One place for
     every kind: a ranking row, a mix row, a figure by question type, a
     reading's two stats. The bar is reset by dropping its transition,
     collapsing it, forcing a frame, and letting it grow. */
  function replay(scope) {
    var fills = scope.querySelectorAll('.thallo-rate__fill, .thallo-mix__fill');
    var figs = scope.querySelectorAll('[data-count], .thallo-both__stat b');
    /* Bars drawn as pseudo-elements — the four by type, a reading's two —
       are collapsed by a class for one frame; the track under them never
       moves. */
    var pseudo = scope.querySelectorAll('.thallo-cat__n, .thallo-both__stat');

    fills.forEach(function (f) {
      f.style.transition = 'none';
      f.style.transform = 'scaleX(0)';
    });
    pseudo.forEach(function (n) { n.classList.add('is-replaying'); });
    void scope.offsetWidth;
    fills.forEach(function (f) {
      f.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
      f.style.transform = '';
    });
    pseudo.forEach(function (n) {
      requestAnimationFrame(function () { n.classList.remove('is-replaying'); });
    });
    figs.forEach(function (fig) { count(fig, true); });
  }

  root.addEventListener('click', function (event) {
    if (event.target.closest('a, button')) return;
    var hit = event.target.closest('.thallo-rank tbody tr, .thallo-models tbody tr, .thallo-mix li, .thallo-catgrid > div, .thallo-both');
    if (hit) replay(hit);
  });
})();

/**
 * The hub's filter and its pager — the pills over the cards, the
 * "‹ 1 2 ›" under them.
 *
 * Its own closure, outside the motion above, because a reader who asked for
 * less motion still gets to filter. The cards are all in the markup; what
 * this does is decide which three show. A click on a pill narrows the set
 * to one industry and goes back to page one; a click on a number, or an
 * arrow, moves within the set. The pager is redrawn from the set each time,
 * so with three cards it reads "‹ 1 ›" with both arrows off, and with six
 * "‹ 1 2 ›". Nothing is fetched and nothing is re-rendered: without this
 * script every card shows and the pager is an empty nav.
 */
(function () {
  'use strict';

  var wrap = document.querySelector('.thallo-cards');
  if (!wrap) return;

  var filter = wrap.querySelector('.thallo-filter');
  var pager = wrap.querySelector('.thallo-pager');
  var pills = filter ? [].slice.call(filter.querySelectorAll('.thallo-filter__pill')) : [];
  var cards = [].slice.call(wrap.querySelectorAll('.thallo-cards__grid .thallo-cards__item'));
  var perPage = pager ? parseInt(pager.getAttribute('data-per-page'), 10) || 3 : 3;

  var want = '';
  var page = 1;

  var ARROW_L = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>';
  var ARROW_R = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>';

  function set() {
    return cards.filter(function (card) {
      var mine = card.getAttribute('data-industry') || '';
      return want === '' || mine === want;
    });
  }

  function draw() {
    var shown = set();
    var pages = Math.max(1, Math.ceil(shown.length / perPage));
    if (page > pages) page = pages;

    cards.forEach(function (card) {
      var i = shown.indexOf(card);
      var on = i !== -1 && Math.floor(i / perPage) === page - 1;
      card.classList.toggle('is-off', !on);
    });

    if (!pager) return;
    var html = '<button type="button" class="thallo-pager__arrow" data-go="prev" aria-label="Previous"' + (page === 1 ? ' disabled' : '') + '>' + ARROW_L + '</button>';
    for (var n = 1; n <= pages; n++) {
      html += '<button type="button" class="thallo-pager__n' + (n === page ? ' is-on' : '') + '" data-go="' + n + '"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</button>';
    }
    html += '<button type="button" class="thallo-pager__arrow" data-go="next" aria-label="Next"' + (page === pages ? ' disabled' : '') + '>' + ARROW_R + '</button>';
    pager.innerHTML = html;
  }

  if (filter) {
    filter.addEventListener('click', function (event) {
      var pill = event.target.closest('.thallo-filter__pill');
      if (!pill) return;
      want = pill.getAttribute('data-industry') || '';
      page = 1;
      pills.forEach(function (p) {
        var on = p === pill;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      draw();
    });
  }

  if (pager) {
    pager.addEventListener('click', function (event) {
      var b = event.target.closest('[data-go]');
      if (!b || b.disabled) return;
      var go = b.getAttribute('data-go');
      if (go === 'prev') page -= 1;
      else if (go === 'next') page += 1;
      else page = parseInt(go, 10) || 1;
      draw();
    });
  }

  draw();
})();

/**
 * The turning isotype under the hub's masthead, but you can grab it and
 * flick it — the same mark the site has on /results/, with the same physics.
 *
 * The rotation is a rAF loop: a drag pushes angular velocity into it and
 * friction bleeds that back down to the idle drift, so a throw spins it
 * fast, coasts, and settles into the slow turn it had before. The angle
 * lives in a closure and is written straight to the transform. Touch is left
 * alone: claiming the gesture would mean a finger that lands on the flower
 * can no longer scroll the page. A reader who asked for less motion keeps
 * the mark still — the CSS turn is off for them too — and this never runs.
 */
(function () {
  'use strict';

  var wrap = document.querySelector('.thallo-mast__flower');
  var img = wrap && wrap.querySelector('img');
  if (!wrap || !img) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var IDLE = 360 / 30;   /* deg/s at rest: one turn in thirty seconds */
  var FRICTION = 1.1;    /* how fast a throw bleeds back to IDLE */
  var MAX = 2200;        /* deg/s ceiling, so a hard flick stays legible */

  var angle = 0;
  var velocity = IDLE;
  var last = 0;

  var dragging = false;
  var pointerId = -1;
  var lastPointerAngle = 0;
  var lastMoveAt = 0;

  wrap.classList.add('is-driven');

  function angleFrom(e) {
    var r = wrap.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * (180 / Math.PI);
  }

  /* Shortest way round, so crossing the ±180 seam does not read as a jump. */
  function shortest(d) {
    return ((d + 540) % 360) - 180;
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); /* a backgrounded tab must not bank up rotation */
    last = now;

    if (!dragging) {
      velocity += (IDLE - velocity) * (1 - Math.exp(-FRICTION * dt));
      angle += velocity * dt;
      img.style.transform = 'rotate(' + angle + 'deg)';
    }

    requestAnimationFrame(frame);
  }

  wrap.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;
    dragging = true;
    pointerId = e.pointerId;
    lastPointerAngle = angleFrom(e);
    lastMoveAt = performance.now();
    velocity = 0;
    try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    wrap.classList.add('is-held');
    e.preventDefault();
  });

  wrap.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var now = performance.now();
    var current = angleFrom(e);
    var delta = shortest(current - lastPointerAngle);
    var dt = Math.max((now - lastMoveAt) / 1000, 1 / 240);

    angle += delta;
    velocity = velocity * 0.6 + (delta / dt) * 0.4; /* smoothed, or one jittery sample decides the throw */

    lastPointerAngle = current;
    lastMoveAt = now;
    img.style.transform = 'rotate(' + angle + 'deg)';
  });

  function release(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = -1;
    wrap.classList.remove('is-held');
    if (performance.now() - lastMoveAt > 120) velocity = IDLE; /* held still, then let go: no fling */
    velocity = Math.max(-MAX, Math.min(MAX, velocity));
  }
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  last = performance.now();
  requestAnimationFrame(frame);
})();

/**
 * The way down to the findings — "Read the findings", the card on the
 * photograph — glides rather than jumps.
 *
 * The browser's own smooth scroll is a fixed, fairly quick ease; Cami
 * found the jump "muy brusco" (2026-09-22). This drives the scroll itself
 * over 1.1 seconds with the site's settle easing, stopping 5rem short of
 * the block so the fixed bar does not cover its label. A reader who asked
 * for less motion gets the plain jump.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var links = document.querySelectorAll('.thallo-volume__go[href^="#"], .thallo-volume__chip[href^="#"]');
  if (!links.length) return;

  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  [].forEach.call(links, function (a) {
    a.addEventListener('click', function (event) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      event.preventDefault();

      var from = window.scrollY;
      var to = target.getBoundingClientRect().top + from - 80;
      var start = null;
      var duration = 1100;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
      }
      requestAnimationFrame(step);
    });
  });
})();

/**
 * No short last lines. A paragraph whose last line carries a word or two
 * — "the list." under six full lines — has words pulled down onto it, one
 * at a time, until that line is at least a third of the measure or six
 * words have moved (Cami, 2026-09-22). Done by joining spaces at the end
 * of the text with non-breaking ones and measuring after each, so it
 * holds at any width the paragraph is given. Text nodes only: a paragraph
 * that ends in a tag is left alone rather than risk joining across it.
 * Runs again on resize, from the original text.
 */
(function () {
  'use strict';

  var ps = [].slice.call(document.querySelectorAll('.thallo-volume p, .thallo-volume li'));
  if (!ps.length) return;

  function lastLineShare(p) {
    var range = document.createRange();
    range.selectNodeContents(p);
    var rects = [].slice.call(range.getClientRects());
    if (rects.length < 2) return 1;
    var lastTop = Math.max.apply(null, rects.map(function (r) { return r.top; }));
    var lr = rects.filter(function (r) { return Math.abs(r.top - lastTop) < 2; });
    var left = Math.min.apply(null, lr.map(function (r) { return r.left; }));
    var right = Math.max.apply(null, lr.map(function (r) { return r.right; }));
    var box = p.getBoundingClientRect();
    return (right - left) / box.width;
  }

  function fix(p) {
    var last = p.lastChild;
    if (!last || last.nodeType !== 3) return;
    if (last.thalloText === undefined) last.thalloText = last.nodeValue;
    last.nodeValue = last.thalloText;

    var text = last.nodeValue;
    for (var i = 0; i < 6; i++) {
      if (lastLineShare(p) >= 0.34) break;
      /* The last ordinary space in the text becomes unbreakable. */
      var at = text.lastIndexOf(' ');
      if (at < 1) break;
      text = text.slice(0, at) + ' ' + text.slice(at + 1);
      last.nodeValue = text;
    }
  }

  function run() { ps.forEach(fix); }
  run();

  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  });
})();
