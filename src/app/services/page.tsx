import React from 'react';
import Navbar from '@/components/Navbar';
import ServicesLanding from '@/components/ServicesLanding';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ServicesLanding />
      </main>
      <Footer />
    </div>
  );
}
