import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { requireAuth, getUserName, getUserRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, salonId } = await requireAuth();

  // Fetch salon name for sidebar
  const supabase = await createClient();
  const { data: salon } = await supabase
    .from('salons')
    .select('name')
    .eq('id', salonId)
    .maybeSingle();

  const userName = await getUserName();
  const userRole = await getUserRole();

  return (
    <AuthProvider
      salonId={salonId}
      userName={userName}
      userEmail={user.email ?? ''}
      salonName={salon?.name ?? 'Мій салон'}
      userRole={userRole}
    >
      <div className="min-h-screen">
        {/* Sidebar (desktop: fixed left, mobile: bottom nav) */}
        <Sidebar />

        {/* Main content area */}
        <main className="lg:pl-[260px]">
          <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
