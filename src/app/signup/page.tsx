"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    const supabase = createClient();
    
    // Step 1: Sign up with email/password
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    // Handle errors
    if (signUpError) {
      console.error("❌ Sign up error:", signUpError);
      setError(signUpError.message || "Failed to create account");
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError("No user returned");
      setIsLoading(false);
      return;
    }

    console.log("✅ Sign up successful:", data.user.email);
    
    // Step 2: Create user profile via RPC
    try {
      const { data: profile, error: profileError } = await (supabase as any).rpc('create_profile_if_not_exists', {
        p_full_name: fullName || ''
      });
      
      if (profileError) {
        console.warn("⚠️ Profile creation warning:", profileError);
      } else {
        console.log("✅ Profile created:", profile);
      }
    } catch (profileErr) {
      console.warn("⚠️ Profile creation failed (non-critical):", profileErr);
    }
    
    // Check if email confirmation is required
    if (data.session) {
      // User is automatically signed in (email confirmation disabled)
      console.log(`→ Email confirmation disabled, redirecting to /dashboard`);
      setSuccess(true);
      
      // Redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      // Email confirmation required
      console.log("→ Email confirmation required");
      setSuccess(true);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              Account Created!
            </h2>
            <p className="text-zinc-600 mb-4 text-sm">
              Redirecting to dashboard...
            </p>
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-black font-bold text-base">ShinePRO</span>
                <span className="text-[9px] text-zinc-500 tracking-wider">CRM for beauty</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight mb-3">
              Create your account
            </h1>
            <p className="text-sm text-zinc-600">
              Start managing your salon today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-lg text-black placeholder-zinc-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-lg text-black placeholder-zinc-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-lg text-black placeholder-zinc-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Minimum 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-6"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
            <p className="text-sm text-zinc-600">
              Already have an account?{" "}
              <Link 
                href="/login"
                className="text-black font-semibold hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-8">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
