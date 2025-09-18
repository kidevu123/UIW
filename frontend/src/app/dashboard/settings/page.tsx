'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Settings, ArrowLeft, LogOut, User, Shield, Download } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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
          <h1 className="text-xl font-bold text-gradient">Settings</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-intimate-500" />
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <p className="text-gray-900">{user?.displayName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900">{user?.username}</p>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-intimate-500" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced privacy and security settings will be available here.
            </p>
          </div>

          {/* Backup Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-6 h-6 text-intimate-500" />
              <h2 className="text-lg font-semibold text-gray-900">Backup & Restore</h2>
            </div>
            <p className="text-gray-600 text-sm">
              Data backup and restoration features will be available here.
            </p>
          </div>

          {/* Logout */}
          <div className="card">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-red-600 hover:text-red-700 w-full"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}