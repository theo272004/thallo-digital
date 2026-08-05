/**
 * The partners, in one place.
 *
 * Stripe's account review asks for a "Nosotros" section saying who the partners
 * are and what they do — a real business with named people behind it. This is
 * the only file that has to change to produce it.
 *
 * ── WHAT TO SEND ME (per partner) ───────────────────────────────────────────
 *   name      Full name, as they want it published.
 *   role      Their title. e.g. 'Co-founder & Head of Strategy'
 *   bio       ONE sentence on what they actually do here. Not a CV — the point
 *             is that a stranger understands who runs this company.
 *   photo     Optional. Drop the file in /public and put its filename here,
 *             e.g. 'team-camila.webp'. Square crop, at least 480×480, head and
 *             shoulders. Without one the card shows their initials instead, so
 *             a missing photo never leaves a hole.
 *   linkedin  Optional but worth having: Stripe likes a verifiable person.
 *
 * ── WHY THESE ARE EMPTY ─────────────────────────────────────────────────────
 * Names, roles and biographies of real people are not something to invent as
 * filler — published on a live company site they read as fact about identifiable
 * individuals, and Stripe checks the people against the registration documents.
 * So the section renders a clearly-marked template until the real details land.
 */

export type Partner = {
  name: string;
  role: string;
  bio: string;
  /** Filename in /public, e.g. 'team-camila.webp'. Falls back to initials. */
  photo?: string;
  linkedin?: string;
};

/**
 * Add or remove entries freely — the grid adapts to two, three or four.
 * Fill `name`, `role` and `bio` and that card goes live automatically.
 */
export const PARTNERS: Partner[] = [
  { name: '', role: '', bio: '', photo: '', linkedin: '' },
  { name: '', role: '', bio: '', photo: '', linkedin: '' },
];

/** Only the fully-filled cards are real; the rest render as the template. */
export const filledPartners = () => PARTNERS.filter((p) => p.name && p.role && p.bio);

/** True once at least one partner is complete. Flips the section out of template mode. */
export const PARTNERS_READY = filledPartners().length > 0;

/** 'Camila Restrepo' → 'CR'. Used when no photograph has been supplied. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
