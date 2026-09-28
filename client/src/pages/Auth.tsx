import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { loginWithGoogle, loginWithEmail, currentUser } = usePatchworkStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithGoogle();
      setIsLoading(false);
      setLocation('/dashboard');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      loginWithEmail(email);
      setIsLoading(false);
      setLocation('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-6">
          <PatchworkLogo size="lg" />
        </Link>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B133C]">
          {isSignUp ? 'Create your PATCHWORK account' : 'Welcome back to PATCHWORK'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#1B133C]/70">
          The Git-native visual patching platform for modern web teams.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
          {/* PRIMARY CTA: GOOGLE OAUTH */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-[#1B133C] font-semibold text-xs sm:text-sm shadow-2xs transition-all hover:shadow-sm hover:scale-[1.01]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-muted-foreground font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B133C] mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white/90 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B133C] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white/90 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create Workspace' : 'Sign in'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Switch mode */}
          <div className="text-center text-xs text-[#1B133C]/70">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                New to PATCHWORK?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Security attestation */}
        <div className="mt-6 text-center text-xs text-[#1B133C]/60 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SOC2 Type II certified • Encrypted provider tokens</span>
        </div>
      </div>
    </div>
  );
}
