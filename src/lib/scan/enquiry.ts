/**
 * Where an enquiry goes.
 *
 * The two forms on this site — the contact page and the plan enquiry in the
 * closing panel — used to have an empty `FORM_ENDPOINT` each, which meant they
 * opened the visitor's own mail client and hoped. That works when a mail client
 * is configured and does nothing whatsoever when one is not: no record, no
 * notification, no way to know it happened. An enquiry from somebody who read
 * three pages and asked about the flagship engagement is the most valuable
 * event on this site, and it was the one thing not being kept.
 *
 * So both now post to the same WordPress plugin that runs the scan. It already
 * holds the keys, the mailer and the leads table; an enquiry is one more row
 * and two more messages — one to us, one back to them.
 *
 * Derived from `NEXT_PUBLIC_SCAN_API` rather than configured separately: they
 * are the same plugin on the same host, and two variables that must agree are
 * one variable and a bug waiting to happen. Unset, both forms keep the mailto
 * fallback, which is what a local build without a backend should do.
 */

const API_BASE = (process.env.NEXT_PUBLIC_SCAN_API ?? '').replace(/\/$/, '');

export const ENQUIRY_ENDPOINT = API_BASE ? `${API_BASE}/enquiry` : '';

export interface EnquiryInput {
  name: string;
  company: string;
  email: string;
  message: string;
  plans: string[];
  consent: boolean;
  /** The page they were reading. Tells us which argument did the work. */
  page: string;
  /** The honeypot's value. Empty for a person; bots fill every field they find. */
  website_url?: string;
}

/**
 * Sends one enquiry. Throws on anything that is not a clean acceptance, so the
 * caller can fall back to the mail client rather than telling somebody their
 * message was received when it was not.
 */
export async function sendEnquiry(input: EnquiryInput): Promise<void> {
  if (!ENQUIRY_ENDPOINT) throw new Error('no endpoint');

  const res = await fetch(ENQUIRY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    // WordPress answers a WP_Error as { code, message }; the message is written
    // for the person reading it, so it is worth surfacing rather than a status.
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? `HTTP ${res.status}`);
  }
}
