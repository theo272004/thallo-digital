import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScanFlow from '@/components/scan/ScanFlow';

export const metadata: Metadata = {
  title: 'Free AI visibility scan · Thallo',
  description:
    'See whether ChatGPT, Claude and Gemini recommend your company to B2B buyers — and which competitors they name instead.',
};

export default function ScanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ScanFlow />
      </main>
      <Footer />
    </div>
  );
}
