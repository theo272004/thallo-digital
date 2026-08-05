import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalDoc, { Clause, P, List } from '@/components/LegalDoc';
import { LEGAL } from '@/lib/legal';
import { BASE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'The terms that govern Thallo Digital’s services: engagements, fees and payment, cancellation, intellectual property, and the limits of what an AI visibility programme can promise.',
  alternates: { canonical: `${SITE_URL}/terms/` },
  openGraph: {
    title: 'Terms and Conditions · Thallo Digital',
    description: 'The terms that govern Thallo Digital’s services.',
    url: `${SITE_URL}/terms/`,
  },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <LegalDoc
          eyebrow="Legal"
          title="Terms and Conditions"
          summary="These terms govern the services Thallo Digital provides and the free visibility scan on this site. By engaging us or using the scan, you agree to them."
        >
          <Clause n={1} heading="These terms">
            <P>
              These terms are an agreement between you (the &ldquo;Client&rdquo;) and {LEGAL.tradingName} (&ldquo;Thallo&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;), whose details are set out at the foot of this page. They apply to every
              engagement we accept and to your use of this website and the free visibility scan.
            </P>
            <P>
              Where we sign a separate proposal, statement of work or service agreement with you, that document governs
              the specifics of the engagement — scope, deliverables, dates and price. These terms apply to everything it
              does not cover, and it prevails over these terms wherever the two conflict.
            </P>
          </Clause>

          <Clause n={2} heading="What we do">
            <P>
              Thallo is a marketing agency. We build and measure brand authority so that our clients are found, cited and
              recommended in search engines and in AI answer engines. Our services are:
            </P>
            <List
              items={[
                <>
                  <strong className="font-bold text-gray-900">AI Visibility Audit</strong> — a fixed-scope, one-time
                  assessment of how AI models and search engines currently represent your brand, delivered as a report
                  with a prioritised roadmap.
                </>,
                <>
                  <strong className="font-bold text-gray-900">The Authority Engine</strong> — an ongoing monthly
                  programme of research, content production, technical work, distribution and reporting.
                </>,
                <>
                  <strong className="font-bold text-gray-900">Flagship Projects</strong> — discrete projects such as
                  original data studies, digital PR, interactive tools and industry reports, scoped and priced
                  individually.
                </>,
                <>
                  <strong className="font-bold text-gray-900">The free visibility scan</strong> — an automated,
                  self-service check available on this website, covered by clause 9.
                </>,
              ]}
            />
          </Clause>

          <Clause n={3} heading="Engaging us">
            <P>
              We scope work in a written proposal that states the deliverables, the timeline and the price. An engagement
              begins when you accept that proposal in writing and, where the proposal requires it, the first payment has
              cleared. Prices shown on this website are starting points; the price for your engagement is the one in your
              proposal.
            </P>
            <P>
              We may decline or discontinue an engagement — including where a request falls outside our expertise, where
              the work would require deceptive practice, or where fees remain unpaid under clause 4.
            </P>
          </Clause>

          <Clause n={4} heading="Fees, payment and taxes">
            <List
              items={[
                'One-time engagements (audits and projects) are invoiced in advance unless the proposal sets out a different schedule.',
                'Monthly programmes are invoiced monthly in advance. The first invoice is due before work begins.',
                'Invoices are payable within the period stated on the invoice. We may suspend work on any account that is overdue, having given you notice first.',
                'Prices are exclusive of VAT (IVA) and any other applicable taxes, withholdings or bank charges, which are added where the law requires it.',
                'Card payments are processed by our payment provider, Stripe. We do not receive or store your full card details; they are handled by the provider under its own terms and security standards.',
              ]}
            />
          </Clause>

          <Clause n={5} heading="Term, cancellation and refunds">
            <P>
              The Authority Engine is sold on a minimum term stated in your proposal (typically six months), because the
              work compounds and its results do not appear inside a single month. After the minimum term it continues
              month to month until either party gives notice.
            </P>
            <P>
              Cancellation windows, notice periods and what is and is not refundable are set out in full in our{' '}
              <a href={`${BASE}/refund-policy/`} className="font-semibold text-[#39471D] underline underline-offset-2">
                Refund Policy
              </a>
              , which forms part of these terms.
            </P>
          </Clause>

          <Clause n={6} heading="What we need from you">
            <P>
              Our work depends on access and on timely decisions. You agree to provide the access, information, approvals
              and points of contact the engagement needs, and to do so within the timeframes we agree. Where a delay on
              your side moves the schedule, dates shift accordingly and fees already invoiced remain payable.
            </P>
            <P>
              You confirm that any material you give us to publish is accurate, is yours to use, and does not infringe
              anyone else&rsquo;s rights.
            </P>
          </Clause>

          <Clause n={7} heading="Ownership of the work">
            <P>
              On full payment of the fees for an engagement, the deliverables we create specifically for you under it —
              content, reports, and the recommendations within them — become yours to use.
            </P>
            <P>
              We keep ownership of everything we bring to the work rather than create for it: our methods, frameworks,
              prompt sets, internal tooling, templates and know-how, together with any improvement to them. Nothing in
              these terms transfers that, and we remain free to use it for other clients.
            </P>
            <P>
              We may describe the work and name you as a client in our portfolio and marketing. Tell us in writing if you
              would rather we did not, and we will not.
            </P>
          </Clause>

          <Clause n={8} heading="Confidentiality">
            <P>
              Each party will keep the other&rsquo;s non-public information confidential, use it only to perform the
              engagement, and protect it with at least reasonable care. This does not apply to information that is
              already public, that was already held without a duty of confidence, or that must be disclosed by law.
            </P>
          </Clause>

          <Clause n={9} heading="The free visibility scan">
            <P>
              The scan on this website puts a fixed set of category questions to third-party AI models and reports how
              those models answered at that moment. It is provided free and as-is, for information only.
            </P>
            <List
              items={[
                'The answers come from third-party AI models we do not control. They are probabilistic: the same question can be answered differently minutes apart, and a result is a sample rather than a definitive ranking.',
                'A scan measures the models we tested, in the way described on the method page — not every AI product, surface, country or phrasing a real buyer might use.',
                'Use is subject to fair-use limits shown in the tool. We may rate-limit, suspend or withdraw the scan at any time.',
                'You may run the scan for a brand you own or are authorised to act for. Do not use it to build datasets on third parties, and do not attempt to circumvent its limits.',
                'Where a report is unlocked with an email address, that address is handled under our Privacy Policy.',
              ]}
            />
          </Clause>

          <Clause n={10} heading="What we do not promise">
            <P>
              We are engaged for professional effort and expertise, not for a guaranteed outcome. Visibility in search
              engines and AI answer engines is determined by third parties — Google, OpenAI, Anthropic, Google DeepMind,
              Perplexity and others — whose models, rankings and policies change without notice and are outside our
              control and theirs to decide.
            </P>
            <P>
              We therefore do not guarantee any specific ranking, mention, citation, share of voice, traffic volume,
              lead volume or revenue, and no figure in a proposal, report, case study or on this website should be read
              as a promise of your result. Case studies describe what happened for those clients in those conditions.
            </P>
          </Clause>

          <Clause n={11} heading="Liability">
            <P>
              Nothing in these terms excludes liability that cannot lawfully be excluded, including liability for fraud
              or for death or personal injury caused by negligence.
            </P>
            <P>
              Subject to that, neither party is liable for indirect or consequential loss, or for loss of profit,
              revenue, goodwill, business or data, however arising. Our total liability arising out of or in connection
              with an engagement is limited to the fees you paid us for that engagement in the three months before the
              event giving rise to the claim.
            </P>
            <P>
              We are not liable for any consequence of a change made by a third-party platform or model provider, nor for
              any loss arising from your use of the free visibility scan.
            </P>
          </Clause>

          <Clause n={12} heading="Personal data">
            <P>
              How we collect, use, store and delete personal data — yours, and any you share with us — is set out in our{' '}
              <a href={`${BASE}/privacy/`} className="font-semibold text-[#39471D] underline underline-offset-2">
                Privacy Policy
              </a>
              . Where we process personal data on your behalf as part of an engagement, we do so on your documented
              instructions and in line with Colombian Law 1581 of 2012 and its implementing decrees.
            </P>
          </Clause>

          <Clause n={13} heading="Changes to these terms">
            <P>
              We may update these terms as our services change. The version in force for an engagement is the one
              published when it began, and the date at the top of this page shows when this version was issued. Material
              changes affecting a live engagement will be notified to you in writing.
            </P>
          </Clause>

          <Clause n={14} heading="Governing law">
            <P>
              These terms are governed by the laws of the Republic of {LEGAL.country}. Any dispute that cannot be
              resolved between us in good faith will be submitted to the competent courts of {LEGAL.country}.
            </P>
            <P>
              Questions about these terms can be sent to{' '}
              <a
                href={`mailto:${LEGAL.email}`}
                className="font-semibold text-[#39471D] underline underline-offset-2"
              >
                {LEGAL.email}
              </a>
              .
            </P>
          </Clause>
        </LegalDoc>
      </main>
      <Footer />
    </div>
  );
}
