'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthFormData {
  username?: string;
  email: string;
  password: string;
  displayName?: string;
  confirmPassword?: string;
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, appStatus } = useAuthStore();
  
  const { 
    register: registerField, 
    handleSubmit, 
    formState: { errors },
    watch,
    reset 
  } = useForm<AuthFormData>();

  const password = watch('password');

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (isLogin) {
        success = await login(data.email, data.password);
      } else {
        if (data.password !== data.confirmPassword) {
          setIsLoading(false);
          return;
        }
        
        success = await register({
          username: data.username!,
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        });
      }
      
      if (success) {
        reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  // Check if registration should be disabled
  const isRegistrationClosed = appStatus && !appStatus.registrationOpen;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto intimate-gradient rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gradient">
          {isLogin ? 'Welcome Back' : 'Join the Connection'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isLogin 
            ? 'Sign in to your intimate space' 
            : 'Create your account to begin'
          }
        </p>
      </div>

      {!isLogin && isRegistrationClosed && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="text-orange-800 text-sm text-center">
            Registration is closed. This intimate space is already complete with 2 users.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerField('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your username"
                  disabled={isRegistrationClosed}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerField('displayName')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="How should your partner see you?"
                  disabled={isRegistrationClosed}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...registerField('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="input-field pl-10"
              placeholder="Enter your email"
              disabled={!isLogin && isRegistrationClosed}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...registerField('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                ...(!isLogin && {
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                })
              })}
              type={showPassword ? 'text' : 'password'}
              className="input-field pl-10 pr-10"
              placeholder="Enter your password"
              disabled={!isLogin && isRegistrationClosed}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...registerField('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type={showPassword ? 'text' : 'password'}
                className="input-field pl-10"
                placeholder="Confirm your password"
                disabled={isRegistrationClosed}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || (!isLogin && isRegistrationClosed)}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Heart className="w-5 h-5" />
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            </>
          )}
        </motion.button>
      </form>

      {!isRegistrationClosed && (
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-intimate-600 hover:text-intimate-700 text-sm font-medium"
          >
            {isLogin 
              ? "Don't have an account? Create one" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      )}
    </div>
  );
}