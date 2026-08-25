/*
 * Written from what the code actually does, not from a template.
 *
 * The claims below were checked against the implementation and must be kept
 * true if it changes:
 *   · no tag manager, advertising pixel, tracking cookie or localStorage in
 *     the site, and the only analytics is a cookieless Cloudflare beacon that
 *     records nothing per-person — src/components/Analytics.tsx, which renders
 *     nothing at all unless NEXT_PUBLIC_CF_BEACON_TOKEN is set at build time.
 *     If that component is ever swapped for one that sets a cookie or an
 *     identifier, clause 4 stops being true and a consent banner is owed;
 *   · the scanner stores a salted SHA-256 of the IP and never the address
 *     itself — Thallo_Vis_DB::ip_hash();
 *   · scan working data is deleted after `retention_days`, default 14 —
 *     Thallo_Vis_Settings defaults;
 *   · the free tier is capped per visitor per day — `rate_per_ip`.
 * A privacy policy that overstates what a site does is the kind of false
 * statement Stripe and the SIC both care about, so change this page in the same
 * commit as any change to the data handling.
 */

import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalDoc, { Clause, P, List } from '@/components/LegalDoc';
import { LEGAL } from '@/lib/legal';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What personal data Thallo Digital collects, why, who it is shared with, how long it is kept, and the rights you hold over it under Colombian Law 1581 of 2012.',
  alternates: { canonical: `${SITE_URL}/privacy/` },
  openGraph: {
    title: 'Privacy Policy · Thallo Digital',
    description: 'What we collect, why, how long we keep it, and your rights over it.',
    url: `${SITE_URL}/privacy/`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <LegalDoc
          title="Privacy Policy"
          summary="What we collect, why we collect it, who else sees it, how long we keep it, and how to make us delete it. Written to be read, not to be survived."
        >
          <Clause n={1} heading="Who is responsible for your data">
            <P>
              {LEGAL.tradingName} is the data controller (<em>responsable del tratamiento</em>) for the personal data
              described here. Our details are at the foot of this page, and privacy requests reach a person at{' '}
              <a href={`mailto:${LEGAL.email}`} className="font-semibold text-[#39471D] underline underline-offset-2">
                {LEGAL.email}
              </a>
              .
            </P>
            <P>
              This policy is issued under Law 1581 of 2012 and Decree 1377 of 2013 of the Republic of {LEGAL.country},
              which govern the protection of personal data (<em>habeas data</em>).
            </P>
          </Clause>

          <Clause n={2} heading="What we collect">
            <P>We only collect what a specific purpose needs. In practice that is three things.</P>
            <List
              items={[
                <>
                  <strong className="font-bold text-gray-900">When you contact us</strong> — your name, email address,
                  company and whatever you write in your message. You choose what to put in it.
                </>,
                <>
                  <strong className="font-bold text-gray-900">When you run the free visibility scan</strong> — the brand
                  name, website domain and category you enter. These are business details, not personal ones. If you
                  choose to unlock the full report, we also receive the email address you give us.
                </>,
                <>
                  <strong className="font-bold text-gray-900">When you become a client</strong> — the contact and
                  billing details needed to run and invoice the engagement, plus whatever access you grant us to do the
                  work.
                </>,
              ]}
            />
            <P>
              We do not ask for, and have no use for, sensitive personal data as Law 1581 defines it. Please do not send
              it to us. We do not knowingly collect data from children.
            </P>
          </Clause>

          <Clause n={3} heading="Your IP address is not stored">
            <P>
              The scanner has to know that one visitor is not running it a hundred times a day. It does that without
              keeping your address: the address is combined with a secret salt and hashed, and only the hash is written
              to the database. The hash cannot be reversed into an address, so the table cannot be used to work out who
              ran a scan — only that two scans came from the same visitor.
            </P>
          </Clause>

          <Clause n={4} heading="Cookies and tracking">
            <P>
              This website sets no tracking cookie, runs no tag manager and carries no advertising pixel. We do not
              build a profile of you, we do not follow you across other sites, and we do not sell or rent data to
              anyone — ever.
            </P>
            <P>
              We do count visits, using Cloudflare Web Analytics. It stores nothing on your device — no cookie, no
              identifier, nothing that persists after you close the tab — and it gives us totals rather than people:
              how many visits a page received, which site linked here, roughly which country. There is no figure in it
              that describes you, which is why this site asks you to accept no cookie banner.
            </P>
            <P>
              Our blog runs on WordPress at the /blog/ path and may set functional cookies of its own — for example if
              you leave a comment or log in. Those serve the blog&rsquo;s own operation and are not used for tracking.
            </P>
          </Clause>

          <Clause n={5} heading="Why we are allowed to use it">
            <List
              items={[
                'Your authorisation — given when you submit a form or an email address to unlock a report. You can withdraw it at any time.',
                'To perform a contract — running, supporting and invoicing an engagement you have with us.',
                'Our legitimate interest in operating the site securely, including the abuse limits described in clause 3.',
                'Legal obligations — accounting and tax records we are required to keep.',
              ]}
            />
          </Clause>

          <Clause n={6} heading="Who else sees it">
            <P>
              We share personal data only with the providers that make the service work, and only with what they need:
            </P>
            <List
              items={[
                <>
                  <strong className="font-bold text-gray-900">AI model providers</strong> — the scan sends its category
                  questions to third-party models through OpenRouter (which routes to providers such as OpenAI,
                  Anthropic and Google) and to Perplexity. The questions contain the brand, domain and category being
                  scanned. Your email address is never sent to them.
                </>,
                <>
                  <strong className="font-bold text-gray-900">Hosting</strong> — our website, blog and scan database are
                  hosted by our hosting provider, which stores the data on our behalf.
                </>,
                <>
                  <strong className="font-bold text-gray-900">Payment processing</strong> — card payments are handled by
                  Stripe under its own privacy policy. We never receive or store your full card number.
                </>,
                <>
                  <strong className="font-bold text-gray-900">Authorities</strong> — where a law or a court order
                  requires it.
                </>,
              ]}
            />
            <P>
              Some of these providers operate outside {LEGAL.country}, so using this site involves an international
              transfer of data to countries whose rules may differ. We only use providers that commit contractually to
              protecting the data to a standard comparable with Law 1581.
            </P>
          </Clause>

          <Clause n={7} heading="How long we keep it">
            <List
              items={[
                'Scan working data — the questions, the answers and the hashed visitor identifier — is deleted automatically after the retention period set in the tool, which is 14 days by default.',
                'An email address given to unlock a report is kept until you ask us to delete it, or until it is clear you are no longer interested in hearing from us.',
                'Client records are kept for the life of the engagement and afterwards for as long as accounting and tax law requires.',
                'Emails you send us are kept while they are useful to the conversation, and deleted when they are not.',
              ]}
            />
          </Clause>

          <Clause n={8} heading="Your rights">
            <P>Under Law 1581 of 2012, at any time and free of charge, you may:</P>
            <List
              items={[
                'Know what personal data of yours we hold, and where it came from.',
                'Update or correct anything that is wrong, incomplete or out of date.',
                'Delete it, where there is no legal obligation for us to keep it.',
                'Withdraw the authorisation you gave us, which we act on unless the law requires otherwise.',
                'Ask for proof of the authorisation you gave.',
                'Complain to the Superintendencia de Industria y Comercio (SIC) if you believe we have not respected these rights.',
              ]}
            />
            <P>
              Write to{' '}
              <a href={`mailto:${LEGAL.email}`} className="font-semibold text-[#39471D] underline underline-offset-2">
                {LEGAL.email}
              </a>{' '}
              and we will answer within the periods the law sets: 10 business days for a query, 15 business days for a
              complaint, extendable once where we tell you why. We may ask you to confirm your identity first, so that
              nobody else can act on your data.
            </P>
          </Clause>

          <Clause n={9} heading="Keeping it safe">
            <P>
              Data is transmitted over encrypted connections and access to it is limited to the people who need it. API
              keys and secrets are held on the server and are never exposed to the browser. No system is perfectly
              secure, but if a breach affects your personal data we will notify you and the SIC as the law requires.
            </P>
          </Clause>

          <Clause n={10} heading="Changes">
            <P>
              We update this policy when what we do with data changes. The date at the top shows when this version was
              issued; material changes are announced on this page before they take effect.
            </P>
          </Clause>
        </LegalDoc>
      </main>
      <Footer />
    </div>
  );
}
