/**
 * The mailing list on the archive.
 *
 * The address goes to the plugin's `enquiry` endpoint — the same place the
 * contact form's messages go, with the same honeypot, the same daily cap, and
 * the same screen in wp-admin to read them. Nothing here sends mail; this
 * collects addresses, and the letter is a decision for whoever writes it.
 *
 * Written as a plain script with no build step and no dependency, because it
 * is the only JavaScript this page has and a form that needs a framework to
 * accept an email address is a form nobody should ship.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-thallo-subscribe]');
  if (!form) return;

  var note = form.querySelector('[data-thallo-subscribe-note]');
  var field = form.querySelector('input[name="email"]');
  var button = form.querySelector('button[type="submit"]');
  var resting = note ? note.textContent : '';

  function say(message, tone) {
    if (!note) return;
    note.textContent = message;
    note.className = 'thallo-sub__note' + (tone ? ' is-' + tone : '');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var email = (field.value || '').trim();

    /* The browser's own check, asked for rather than relied on: `novalidate`
       is on the form so that a bad address does not produce a native bubble in
       the middle of the page, which leaves this the only thing that tells
       somebody the address is wrong. */
    if (!field.checkValidity() || email === '') {
      say('That address does not look right. Check it and try again.', 'bad');
      field.focus();
      return;
    }

    var endpoint = (window.thalloList && window.thalloList.endpoint) || '';
    if (!endpoint) {
      say('The list is not connected yet. Write to us instead.', 'bad');
      return;
    }

    button.disabled = true;
    say('One moment…');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        /* The honeypot, forwarded exactly as the endpoint expects it: empty
           from a person, filled by anything that walks the form. */
        website_url: (form.querySelector('input[name="website_url"]') || {}).value || '',
        message: 'Subscribed from the blog.',
        plans: ['Blog newsletter']
      })
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          say(
            (result.body && result.body.message) ||
              'That did not go through. Try again in a moment.',
            'bad'
          );
          button.disabled = false;
          return;
        }

        form.reset();
        say('You are on the list. The next one goes to you.', 'good');

        /* The button stays disabled: the address is in, and a second click
           only produces a second row for somebody to deduplicate later. */
      })
      .catch(function () {
        say('That did not go through. Try again in a moment.', 'bad');
        button.disabled = false;
      });
  });

  /* Typing again after an error clears it. A message that outlives the thing
     it was about is how a form ends up shouting at somebody who already
     fixed it. */
  field.addEventListener('input', function () {
    if (note && note.classList.contains('is-bad')) {
      say(resting);
    }
  });
})();

/* The topic filter submits itself.

   The form works without this — choose a topic, press Enter — and this is the
   half a keystroke that a pointer expects. The submit button beside it is
   hidden by CSS rather than removed, because hiding it here would leave a
   keyboard user with a form they cannot send. */
(function () {
  var form = document.querySelector('.thallo-filter');
  if (!form) return;
  var select = form.querySelector('select');
  if (!select) return;
  select.addEventListener('change', function () {
    form.submit();
  });
})();
