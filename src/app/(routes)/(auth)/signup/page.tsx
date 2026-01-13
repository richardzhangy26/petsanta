import { type Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./form";

export const metadata: Metadata = {
  title: "Sign Up - Pets Santa",
  description: "Create your Pets Santa account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/20 dark:bg-green-900/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute top-10 right-10 text-4xl opacity-20 animate-bounce delay-300">🎁</div>
      <div className="absolute top-20 left-20 text-3xl opacity-20 animate-bounce delay-500">🎄</div>
      <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce delay-700">⭐</div>
      <div className="absolute bottom-10 left-10 text-3xl opacity-20 animate-bounce delay-1000">❄️</div>

      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative h-32 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl shadow-lg animate-in zoom-in delay-200">
            🐾
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent festive-font">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Join Pets Santa and create magical pet portraits
            </p>
          </div>

          <SignUpForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/signin"
            className="block w-full py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            Sign In
          </Link>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            🎄 Happy Holidays from Pets Santa! 🎄
          </p>
        </div>
      </div>
    </div>
  );
}
