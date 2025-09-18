'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="glass-effect border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-intimate-600 hover:text-intimate-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold text-gradient">Special Moments</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="card text-center py-16">
          <Calendar className="w-16 h-16 text-intimate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Booking Feature Coming Soon
          </h2>
          <p className="text-gray-600">
            Plan intimate dates and special moments together.
          </p>
        </div>
      </main>
    </div>
  );
}