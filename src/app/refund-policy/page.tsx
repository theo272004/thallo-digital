/* ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  DRAFT TERMS — CAMILA MUST CONFIRM BEFORE THIS GOES LIVE
 *
 * Nicolás said the refund policy was not decided yet, so what follows is the
 * standard professional-services position, written to be defensible in a Stripe
 * dispute rather than to be generous:
 *
 *   · Audits & projects — refundable in full before work starts; once started,
 *     not refundable (work already performed).
 *   · Monthly programme — 30 days' notice, current month not refunded, no
 *     refund of months already delivered.
 *   · Minimum term — cancelling inside it does not refund what is already paid.
 *
 * These are commitments the business is bound by, and Stripe reads this page
 * when a customer disputes a charge. Change the numbers here to whatever the
 * business actually decides — but decide, and keep this page and the signed
 * proposals saying the same thing.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalDoc, { Clause, P, List } from '@/components/LegalDoc';
import { LEGAL } from '@/lib/legal';
import { BASE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'When Thallo Digital refunds a payment, when it does not, how to request one, and how long it takes — for audits, monthly programmes and projects.',
  alternates: { canonical: `${SITE_URL}/refund-policy/` },
  openGraph: {
    title: 'Refund Policy · Thallo Digital',
    description: 'When we refund, when we do not, and how to ask.',
    url: `${SITE_URL}/refund-policy/`,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <LegalDoc
          eyebrow="Legal"
          title="Refund Policy"
          summary="We sell professional services delivered by people. This page says plainly when a payment is refundable, when it is not, and how to ask — so nobody has to guess."
        >
          <Clause n={1} heading="The principle">
            <P>
              You can cancel before we start and get your money back in full. Once we have started, the fee covers the
              time and work already spent on your account, and that part is not refundable.
            </P>
            <P>
              We would always rather fix a problem than argue about an invoice. If you are unhappy with the work, contact
              us first — most concerns are resolved by reworking a deliverable at no extra cost.
            </P>
          </Clause>

          <Clause n={2} heading="AI Visibility Audits and one-time projects">
            <List
              items={[
                <>
                  <strong className="font-bold text-gray-900">Before work begins</strong> — cancel at any time before we
                  start and you receive a 100% refund.
                </>,
                <>
                  <strong className="font-bold text-gray-900">After work begins</strong> — the fee is not refundable. The
                  research and analysis are the deliverable, and they are performed early in the engagement.
                </>,
                <>
                  <strong className="font-bold text-gray-900">If we cannot deliver</strong> — if we cancel, or cannot
                  deliver what your proposal promised, you are refunded in full for anything not delivered.
                </>,
              ]}
            />
            <P>
              &ldquo;Work begins&rdquo; means the kickoff date in your proposal, or the first day we access your systems
              or start the research — whichever is earlier. We confirm that date to you in writing.
            </P>
          </Clause>

          <Clause n={3} heading="The Authority Engine (monthly programme)">
            <List
              items={[
                'Cancel with 30 days’ written notice. Your programme runs to the end of that notice period and we deliver the work for it.',
                'The month in progress is not refunded — it is already being delivered — and months already delivered are not refunded.',
                'You are not charged for any month beginning after the notice period ends.',
                'Where your proposal sets a minimum term, cancelling inside it ends the renewal but does not refund what has already been invoiced or paid for that term.',
              ]}
            />
            <P>
              Notice can be given by email to{' '}
              <a href={`mailto:${LEGAL.email}`} className="font-semibold text-[#39471D] underline underline-offset-2">
                {LEGAL.email}
              </a>{' '}
              and takes effect on the day we receive it.
            </P>
          </Clause>

          <Clause n={4} heading="Duplicate and incorrect charges">
            <P>
              Any charge taken in error — a duplicate payment, the wrong amount, or a charge after a cancellation took
              effect — is refunded in full as soon as we confirm it, whatever else this policy says. Tell us and we will
              correct it.
            </P>
          </Clause>

          <Clause n={5} heading="What is not refundable">
            <List
              items={[
                'Work already performed and time already spent on your account.',
                'Third-party costs we have already committed on your behalf — media placements, licences, data or software — where they cannot be recovered.',
                'Results. Fees pay for professional work, not for a ranking, a mention or a revenue figure, none of which any agency controls. See clause 10 of our Terms and Conditions.',
                'The free visibility scan, which is free of charge, so there is nothing to refund.',
              ]}
            />
          </Clause>

          <Clause n={6} heading="How to request a refund">
            <P>
              Email{' '}
              <a href={`mailto:${LEGAL.email}`} className="font-semibold text-[#39471D] underline underline-offset-2">
                {LEGAL.email}
              </a>{' '}
              with the invoice number, the payment date and what you would like us to put right. A person reads it.
            </P>
            <List
              items={[
                'We acknowledge every request within 2 business days.',
                'We tell you our decision, with our reasoning, within 10 business days of receiving the request.',
                'Approved refunds are issued to the original payment method within 5 to 10 business days. How quickly the money appears after that is set by your bank or card issuer, not by us.',
                'Refunds are made in the currency of the original payment. We do not cover changes in exchange rate between the payment and the refund.',
              ]}
            />
          </Clause>

          <Clause n={7} heading="Chargebacks">
            <P>
              If you believe a charge is wrong, please contact us before raising it with your bank. We can usually
              resolve it faster directly, and a chargeback opened without contacting us first is disputed with the
              evidence of the work delivered.
            </P>
          </Clause>

          <Clause n={8} heading="This policy">
            <P>
              This policy forms part of our{' '}
              <a href={`${BASE}/terms/`} className="font-semibold text-[#39471D] underline underline-offset-2">
                Terms and Conditions
              </a>
              . The version that applies to a payment is the one published when the payment was made. Where a signed
              proposal sets different refund terms, the proposal prevails.
            </P>
            <P>
              Nothing here removes any right you have under the consumer protection law of {LEGAL.country} where it
              applies to you.
            </P>
          </Clause>
        </LegalDoc>
      </main>
      <Footer />
    </div>
  );
}
