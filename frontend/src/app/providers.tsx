'use client';

import React from 'react';
import { AuthProvider } from '@/stores/authStore';
import { ThemeProvider } from '@/stores/themeStore';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}