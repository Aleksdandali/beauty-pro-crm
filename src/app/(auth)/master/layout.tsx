import { Sidebar } from '@/components/layout/Sidebar';

export default function MasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-[260px]">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
