/**
 * What the scan cannot tell you.
 *
 * Shown twice: as a compact strip under the console, and in full on the method
 * page. One copy, because two would drift apart and the one that drifted would
 * be the one somebody read.
 *
 * It lives in `lib` rather than in either page so that importing it does not
 * drag a page component into the other page's bundle.
 */
export const LIMITS: readonly string[] = [
  'Models are asked once each, on the day you run it. Answers drift week to week, so a single scan is a snapshot rather than a trend.',
  'We ask in the language of the market you choose, and tell the model which country the buyer is in — but the call still comes from our servers. A model that personalises by the visitor\'s own location or account history may answer your buyers differently again.',
  'A brand sharing its name with something more famous will pick up mentions that are not about you. The audit trail is there so you can see when that has happened.',
  'Google AI Overview is read through a search-results provider, not an API Google publishes. It is reported as not measured rather than guessed at when that lookup is unavailable.',
];
