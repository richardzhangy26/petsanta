'use client';

import React from 'react';
import { signIn } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { Mail, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleEmailSignIn = () => {
    onClose();
    router.push('/signin');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/signup');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800 transition-colors">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
            🐾
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Log in to save and download</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Sign in to keep your creations and unlock premium quality for your pet portraits.
          </p>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm mb-4"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">or</span>
            </div>
          </div>

          <button 
            onClick={handleEmailSignIn}
            className="w-full py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm mb-3 group"
          >
            <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            Sign in with Email
          </button>

          <button 
            onClick={handleSignUp}
            className="w-full py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </button>
          
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed mt-6">
            Powered by Better Auth. By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
