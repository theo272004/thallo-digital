import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ContactLanding from '@/components/ContactLanding';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell us where you want to be found. One conversation is enough to know how AI describes your business today — and what it takes to become the answer it gives first.',
  alternates: { canonical: 'https://thallodigital.com/contact/' },
  openGraph: {
    title: 'Contact · Thallo Digital',
    description:
      'Tell us where you want to be found. One conversation is enough to know how AI describes your business today.',
    url: 'https://thallodigital.com/contact/',
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ContactLanding />
      </main>
      <Footer />
    </div>
  );
}
