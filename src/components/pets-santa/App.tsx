'use client';

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Hero from './Hero';
import Features from './Features';
import FAQ from './FAQ';
import AuthModal from './AuthModal';
import SEOSection from './SEOSection';
import AboutSection from './AboutSection';
import TestimonialSection from './TestimonialSection';
import CTASection from './CTASection';
import PricingPage from './PricingPage';
import BillingPage from './BillingPage';
import MyCreationsPage from './MyCreationsPage';
import { Page, User, Creation } from './types';
import { useSession, signOut } from '@/lib/auth/client';
import { useDarkMode } from './hooks';

function mapSessionToUser(session: any): User | null {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name || 'Pet Lover',
    email: session.user.email || '',
    plan: 'free'
  };
}

function generateCreationId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [creations, setCreations] = useState<Creation[]>([]);
  const { data: session, isPending } = useSession();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const mappedUser = mapSessionToUser(session);

  useEffect(() => {
    const saved = localStorage.getItem('pets_santa_creations');
    if (saved) {
      try {
        setCreations(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse creations from localStorage:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleNewCreation = (original: string, generated: string, style: string) => {
    const newCreation: Creation = {
      id: generateCreationId(),
      originalImage: original,
      generatedImage: generated,
      style: style,
      date: new Date().toLocaleDateString()
    };

    const updated = [newCreation, ...creations];
    setCreations(updated);
    localStorage.setItem('pets_santa_creations', JSON.stringify(updated));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-bounce text-4xl">🐾</div>
      </div>
    );
  }

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      user={mappedUser}
      onLogin={openAuthModal}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {currentPage === 'home' && (
        <>
          <Hero onGenerated={handleNewCreation} user={mappedUser} onLogin={openAuthModal} />
          <SEOSection />
          <Features />
          <AboutSection />
          <TestimonialSection />
          <FAQ />
          <CTASection onScrollToTop={scrollToTop} onGoPricing={() => setCurrentPage('pricing')} />
        </>
      )}
      {currentPage === 'pricing' && <PricingPage />}
      {currentPage === 'my-creations' && <MyCreationsPage creations={creations} />}
      {currentPage === 'billing' && <BillingPage />}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </Layout>
  );
};

export default App;
