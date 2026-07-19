import React from 'react';
import { Navbar } from '@/components/ui/Navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      <main style={{ flex: 1, padding: 'var(--spacing-8) 0' }}>
        {children}
      </main>
    </div>
  );
}
