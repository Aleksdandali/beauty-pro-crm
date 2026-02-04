"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TestLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Testing...");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    testAuth();
  }, []);

  async function testAuth() {
    const supabase = createClient();

    // Проверяем текущего пользователя
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      setStatus("✅ Already logged in!");
      setUser(currentUser);
      return;
    }

    // Пытаемся создать тестового пользователя
    setStatus("Creating test user...");
    
    const testEmail = `test${Date.now()}@beautycrm.com`;
    const testPassword = "Test123456!";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test User",
        },
      },
    });

    if (signUpError) {
      setStatus(`❌ Signup Error: ${signUpError.message}`);
      return;
    }

    if (signUpData.user) {
      setStatus(`✅ User created! Email: ${testEmail}, Password: ${testPassword}`);
      setUser(signUpData.user);
      
      // Пытаемся залогиниться
      setTimeout(async () => {
        setStatus("Logging in...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (signInError) {
          setStatus(`❌ Login Error: ${signInError.message}`);
        } else {
          setStatus("✅ Login successful! Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 2000);
        }
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 border border-zinc-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <span className="text-3xl">🧪</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Test Auth</h1>
          <p className="text-zinc-600">Тестирование авторизации</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-100 rounded-lg">
            <p className="text-sm font-mono">{status}</p>
          </div>

          {user && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-bold text-green-900 mb-2">User Info:</p>
              <pre className="text-xs text-green-800 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          <button
            onClick={() => router.push("/login")}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
