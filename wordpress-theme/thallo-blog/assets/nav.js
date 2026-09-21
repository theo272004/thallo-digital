/**
 * The navbar's three behaviours, matched to src/components/Navbar.tsx.
 *
 * In a file rather than inline in the template part, and not only for the
 * cache: WordPress runs its content filters over the HTML in a template, and
 * `wptexturize` rewrites `&&` as `&#038;&#038;`. That is a syntax error in
 * JavaScript, so an inline script with a single boolean AND in it dies on load
 * — and it dies silently, because a script that will not parse never runs the
 * line that would have reported it. An enqueued file is not filtered.
 *
 * Everything here degrades to nothing: with the script blocked the bar is a
 * fixed pill that does not hide, which is the whole navbar minus a
 * convenience.
 */
(function () {
	var nav = document.querySelector('[data-thallo-nav]');
	if (!nav) {
		return;
	}

	/* Which tab is lit.
	 *
	 * One header part serves the blog's front page, an article, the AI
	 * Shortlist's hub and every volume of it. While "Blog" carried
	 * aria-current in the markup, it was therefore wrong on half the pages
	 * that use it — a reader on a volume was told they were in the blog, which
	 * is the one thing the series is not.
	 *
	 * Decided from the body class the theme sets in PHP, with the address as
	 * the fallback for the case where the series moves to the root. With the
	 * script blocked nothing is lit, which is the honest failure: no tab
	 * claimed is better than the wrong tab claimed. */
	var onSeries =
		document.body.classList.contains('thallo-shortlist-hub') ||
		document.body.classList.contains('thallo-shortlist-volume') ||
		window.location.pathname.indexOf('/ai-shortlist') !== -1;

	var here = document.querySelectorAll(
		onSeries ? '[data-thallo-nav-research]' : '[data-thallo-nav-blog]'
	);

	Array.prototype.forEach.call(here, function (link) {
		link.setAttribute('aria-current', 'page');
		if (link.closest('.thallo-drawer__links')) {
			link.classList.add('is-here');
		}
	});

	var burger = document.querySelector('[data-thallo-burger]');
	var drawer = document.querySelector('[data-thallo-drawer]');
	var close = document.querySelector('[data-thallo-close]');

	/* The same numbers as the real navbar: firm up past 20px, hide on a
	   downward move of more than 6px, come back on any upward move, and never
	   hide inside the first 80px — where hiding reads as the bar falling off
	   rather than as it getting out of the way. */
	var lastY = 0;

	function onScroll() {
		var y = window.scrollY;
		var delta = y - lastY;

		nav.classList.toggle('is-scrolled', y > 20);

		if (y < 80) {
			nav.classList.remove('is-hidden');
		} else if (delta > 6) {
			nav.classList.add('is-hidden');
		} else if (delta < -6) {
			nav.classList.remove('is-hidden');
		}

		lastY = y;
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	if (!burger || !drawer) {
		return;
	}

	function setOpen(open) {
		drawer.hidden = !open;
		burger.setAttribute('aria-expanded', open ? 'true' : 'false');
		/* The drawer covers the page, so the page must not scroll under it. */
		document.body.style.overflow = open ? 'hidden' : '';

		if (open) {
			nav.classList.remove('is-hidden');
		}
	}

	burger.addEventListener('click', function () {
		setOpen(true);
	});

	if (close) {
		close.addEventListener('click', function () {
			setOpen(false);
		});
	}

	document.addEventListener('keydown', function (event) {
		if (event.key !== 'Escape') {
			return;
		}
		if (!drawer.hidden) {
			setOpen(false);
		}
	});
})();
