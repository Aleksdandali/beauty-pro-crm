import type { ReactNode } from 'react';

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#08080d] px-4 py-12">
      {/* Gradient mesh background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,.6) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, rgba(217,70,239,.5) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 left-1/2 h-[400px] w-[400px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,.5) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
