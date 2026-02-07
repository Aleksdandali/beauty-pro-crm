import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

/**
 * Get current authenticated user (cached per-request for Server Components).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Get current salon_id from user metadata (cached per-request).
 * Throws if not authenticated or no salon_id.
 * Use in query functions and API routes.
 */
export const getCurrentSalonId = cache(async (): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const salonId = user.user_metadata?.salon_id as string | undefined;
  if (!salonId) throw new Error('No salon_id in user metadata');

  return salonId;
});

/**
 * Require auth for Server Components — redirects to /login if not authenticated.
 * Returns { user, salonId }.
 */
export async function requireAuth(): Promise<{ user: User; salonId: string }> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const salonId = user.user_metadata?.salon_id as string | undefined;
  if (!salonId) redirect('/login');

  return { user, salonId };
}

/**
 * Get user role from metadata.
 */
export async function getUserRole(): Promise<'owner' | 'admin' | 'master'> {
  const user = await getCurrentUser();
  return (user?.user_metadata?.role as 'owner' | 'admin' | 'master') ?? 'master';
}

/**
 * Get user display name from metadata.
 */
export async function getUserName(): Promise<string> {
  const user = await getCurrentUser();
  return (user?.user_metadata?.full_name as string) ?? user?.email ?? '';
}
