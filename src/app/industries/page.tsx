import React from 'react';
import Navbar from '@/components/Navbar';
import IndustriesLanding from '@/components/IndustriesLanding';
import Footer from '@/components/Footer';

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
