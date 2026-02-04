"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const locale = 'uk'; // Default locale for root pages
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    
    // Step 1: Sign in with password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle errors
    if (signInError) {
      console.error("❌ Sign in error:", signInError);
      setError(signInError.message || "Invalid email or password");
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError("No user returned");
      setIsLoading(false);
      return;
    }

    console.log("✅ Sign in successful:", data.user.email);

    // Step 2: Ensure profile exists (create if missing)
    try {
      const profileName = data.user.user_metadata?.full_name || data.user.email || '';
      await (supabase as any).rpc('create_profile_if_not_exists', {
        p_full_name: profileName
      });
      console.log("✅ Profile check completed");
    } catch (profileErr) {
      console.warn("⚠️ Profile check failed (non-critical):", profileErr);
    }

    // Step 3: Redirect to dashboard (OUTSIDE try/catch)
    console.log(`→ Redirecting to /dashboard`);
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900 rounded-md border border-zinc-800 p-8">
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center">
                <span className="text-white text-lg font-bold">💅</span>
              </div>
              <span className="text-zinc-100 font-semibold text-sm">Beauty Pro CRM</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
