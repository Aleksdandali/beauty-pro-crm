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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-8 shadow-sm">
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💅</span>
              </div>
              <span className="text-black font-bold text-base">Beauty Pro CRM</span>
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight mb-3">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
            <p className="text-sm text-zinc-600">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup"
                className="text-black font-semibold hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-8">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
