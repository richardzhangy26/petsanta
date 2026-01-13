'use client';

import React, { useState } from 'react';
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
import { Page, User } from './types';
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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const mappedUser = mapSessionToUser(session);

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleGenerated = (_taskId: string, _style: string) => {
    setCurrentPage('my-creations');
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
          <Hero onGenerated={handleGenerated} user={mappedUser} onLogin={openAuthModal} />
          <SEOSection />
          <Features />
          <AboutSection />
          <TestimonialSection />
          <FAQ />
          <CTASection onScrollToTop={scrollToTop} onGoPricing={() => setCurrentPage('pricing')} />
        </>
      )}
      {currentPage === 'pricing' && <PricingPage />}
      {currentPage === 'my-creations' && <MyCreationsPage />}
      {currentPage === 'billing' && <BillingPage />}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </Layout>
  );
};

export default App;
