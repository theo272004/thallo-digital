import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ArticlesIndex from '@/components/ArticlesIndex';
import Footer from '@/components/Footer';
import { fetchNotes } from '@/lib/notes';

/**
 * The index of the writing.
 *
 * Not at /blog/, and not by preference: WordPress is installed there, and the
 * deploy excludes `**\/blog\/**` so that publishing this site can never
 * overwrite it. That exclusion is load-bearing — without it a deploy would
 * delete the articles — so this page takes its own path and links across.
 *
 * The list is fetched here, at build, so the deployed HTML carries the real
 * titles and links. `ArticlesIndex` fetches again in the browser to pick up
 * anything published since. A static export cannot do it any other way, and a
 * blog index that only exists after JavaScript runs would be unreadable to the
 * machines this whole site is about being readable to.
 */
export const metadata: Metadata = {
  title: 'Articles and guides',
  description:
    'On search, AI visibility and building authority in categories where trust decides the sale. Notes on how models decide who to name, and what actually moves it.',
  alternates: { canonical: 'https://thallodigital.com/articles/' },
  openGraph: {
    title: 'Articles and guides · Thallo Digital',
    description:
      'On search, AI visibility and building authority in categories where trust decides the sale.',
    url: 'https://thallodigital.com/articles/',
  },
};

export default async function Articles() {
  /* Twenty-four is the ceiling rather than a page size — there is no
     pagination here yet, and there will not need to be for a while. When it
     does, this is where it goes. */
  const notes = await fetchNotes(24);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <ArticlesIndex initial={notes} />
      </main>
      <Footer />
    </div>
  );
}
