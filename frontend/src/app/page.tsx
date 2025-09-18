'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, isLoading, checkAuth, appStatus } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <OnboardingWizard />
    </main>
  );
}