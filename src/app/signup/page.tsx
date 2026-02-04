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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 rounded-md border border-zinc-800 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/20 rounded-md mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">
              Account Created!
            </h2>
            <p className="text-zinc-400 mb-4 text-sm">
              Redirecting to dashboard...
            </p>
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-emerald-500" viewBox="0 0 24 24">
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900 rounded-md border border-zinc-800 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center">
                <span className="text-white text-lg font-bold">💅</span>
              </div>
              <span className="text-zinc-100 font-semibold text-sm">Beauty Pro CRM</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-zinc-400">
              Start managing your salon today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-medium text-zinc-200 mb-2"
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
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-zinc-200 mb-2"
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
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-zinc-200 mb-2"
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
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-900 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link 
                href="/login"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
