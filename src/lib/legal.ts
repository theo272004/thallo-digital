/**
 * The company's registration details, in one place.
 *
 * Stripe's account review looks for a real, identifiable business behind the
 * site: a legal name, a tax id, an address, a way to reach a human. Everything
 * here is printed on the three legal pages and nowhere else, so a change is a
 * single edit rather than a hunt through three documents.
 *
 * ── SOURCES ─────────────────────────────────────────────────────────────────
 * Every value below is copied from a registration document, not typed from
 * memory — Stripe verifies these against the filings:
 *   · Articles of Organization, Wyoming Secretary of State, filed 17 July 2026,
 *     Original ID 2026-002033685 — legal name, entity type, registered office.
 *   · IRS Notice CP575G, 21 July 2026 — the EIN.
 *
 * The company is a US entity, so there is no NIT: the EIN is its tax id.
 *
 * The address is the registered agent's (Northwest Registered Agent Service
 * Inc). The filing gives the same address as the company's mailing and
 * principal office, so it is the correct one to print — it is not where anyone
 * works. The sole member is named on the IRS notice and deliberately not
 * printed: a legal page needs the entity, not the person behind it.
 */

export const LEGAL = {
  /** The trading name. Real, in use, safe to print. */
  tradingName: 'Thallo Digital',

  /** The registered legal name, exactly as filed. */
  legalName: 'Thallo Digital LLC',

  /** What kind of entity it is, and where it was formed. */
  entity: 'Wyoming limited liability company',

  /** Wyoming Secretary of State filing number. */
  stateFilingId: '2026-002033685',

  /** US Employer Identification Number (EIN). */
  taxId: '42-3956588',

  /** Registered office. */
  address: '30 N Gould St, Ste N, Sheridan, WY 82801, United States',

  /** Where legal and privacy requests are received. Real and monitored. */
  email: 'contact@thallodigital.com',

  /** Optional. Printed only if present. */
  phone: '',

  /** The law the terms are governed by — the state the company was formed in. */
  governingLaw: 'the State of Wyoming, United States',

  /** The date printed as "last updated" on all three documents. */
  lastUpdated: '14 September 2026',
} as const;

/** True once the registration block is complete enough to print. */
export const HAS_ENTITY_DETAILS = Boolean(LEGAL.legalName && LEGAL.taxId);
