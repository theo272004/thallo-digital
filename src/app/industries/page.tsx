import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import IndustriesLanding from '@/components/IndustriesLanding';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AI Visibility by Industry',
  description:
    'How AI visibility plays out for software, ecommerce, clinics, professional services and local businesses — wherever customers research before they ever contact you.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/industries/' },
  openGraph: {
    title: 'AI Visibility by Industry · Thallo Digital',
    description:
      'AI visibility for software, ecommerce, clinics, professional services and local businesses.',
    url: 'https://theo272004.github.io/thallo-digital/industries/',
  },
};

export default function IndustriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <IndustriesLanding />
      </main>
      <Footer />
    </div>
  );
}
