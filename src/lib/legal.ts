/**
 * The company's registration details, in one place.
 *
 * Stripe's account review looks for a real, identifiable business behind the
 * site: a legal name, a tax id, an address, a way to reach a human. Everything
 * here is printed on the three legal pages and nowhere else, so filling these
 * in is a single edit rather than a hunt through three documents.
 *
 * ── TO FILL IN ──────────────────────────────────────────────────────────────
 * The fields below marked `''` are the ones nobody has given me. They are
 * DELIBERATELY EMPTY rather than guessed: a made-up NIT or address on a legal
 * page is worse than an absent one — it is a false statement about a real
 * company, and Stripe verifies these against the registration documents.
 *
 * Every consumer renders them conditionally, so the pages read cleanly while
 * they are blank and simply gain a line each once they are filled.
 */

export const LEGAL = {
  /** The trading name. Real, in use, safe to print. */
  tradingName: 'Thallo Digital',

  /** Razón social — the registered legal name. e.g. 'Thallo Digital S.A.S.' */
  legalName: '',

  /** NIT (Colombian tax id), with verification digit. e.g. '901.234.567-8' */
  taxId: '',

  /** Registered address. e.g. 'Cra 43A # 1-50, Medellín, Antioquia, Colombia' */
  address: '',

  /** Where legal and privacy requests are received. Real and monitored. */
  email: 'hello@thallodigital.com',

  /** Optional. Printed only if present. e.g. '+57 300 000 0000' */
  phone: '',

  /** Country of incorporation — governs which data law the policies cite. */
  country: 'Colombia',

  /** The date printed as "last updated" on all three documents. */
  lastUpdated: '5 August 2026',
} as const;

/** True once the registration block is complete enough to print. */
export const HAS_ENTITY_DETAILS = Boolean(LEGAL.legalName && LEGAL.taxId);
