'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Heart, MessageCircle, Calendar, BookOpen, Mic, Palette, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, checkAuth, partner, getPartner } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      getPartner();
    }
  }, [user, getPartner]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const features = [
    {
      id: 'chat',
      icon: MessageCircle,
      title: 'Intimate Chat',
      description: 'Private messaging with your partner',
      color: 'from-pink-400 to-rose-400',
      href: '/dashboard/chat',
    },
    {
      id: 'bookings',
      icon: Calendar,
      title: 'Special Moments',
      description: 'Plan intimate dates and activities',
      color: 'from-purple-400 to-indigo-400',
      href: '/dashboard/bookings',
    },
    {
      id: 'journal',
      icon: BookOpen,
      title: 'Fantasy Journal',
      description: 'Share your deepest thoughts',
      color: 'from-amber-400 to-orange-400',
      href: '/dashboard/journal',
    },
    {
      id: 'tts',
      icon: Mic,
      title: 'Audio Stories',
      description: 'AI-generated intimate content',
      color: 'from-emerald-400 to-teal-400',
      href: '/dashboard/tts',
    },
    {
      id: 'themes',
      icon: Palette,
      title: 'Mood Themes',
      description: 'Customize your atmosphere',
      color: 'from-violet-400 to-purple-400',
      href: '/dashboard/themes',
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings',
      description: 'Privacy and preferences',
      color: 'from-gray-400 to-slate-400',
      href: '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 intimate-gradient rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">UIW</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.displayName}</p>
            </div>
          </div>
          
          {partner && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{partner.displayName}</p>
                <p className="text-xs text-gray-500">Your partner</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-intimate-400 to-passion-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {partner.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {!partner && (
          <div className="card mb-8 text-center">
            <Heart className="w-16 h-16 text-intimate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Waiting for Your Partner
            </h2>
            <p className="text-gray-600">
              Share the app with your partner so they can join your private space.
            </p>
          </div>
        )}

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                onClick={() => router.push(feature.href)}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="card">
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Start using features to see your activity here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}