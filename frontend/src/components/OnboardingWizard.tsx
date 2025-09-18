'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Heart, Users, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { AuthForm } from './AuthForm';

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { appStatus, getAppStatus } = useAuthStore();

  useEffect(() => {
    getAppStatus();
  }, [getAppStatus]);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to UIW',
      subtitle: 'Your Private Intimate Connection Space',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto intimate-gradient rounded-full flex items-center justify-center animate-float">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              A secure, private space designed exclusively for two hearts to connect, 
              share intimate moments, and build deeper relationships.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="card text-center p-4">
                <Shield className="w-8 h-8 text-intimate-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Private & Secure</h3>
                <p className="text-xs text-gray-500 mt-1">End-to-end encryption</p>
              </div>
              <div className="card text-center p-4">
                <Users className="w-8 h-8 text-intimate-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Just for Two</h3>
                <p className="text-xs text-gray-500 mt-1">Limited to 2 users only</p>
              </div>
              <div className="card text-center p-4">
                <Sparkles className="w-8 h-8 text-intimate-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">AI Enhanced</h3>
                <p className="text-xs text-gray-500 mt-1">Intelligent features</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Intimate Features',
      subtitle: 'Everything you need for deeper connection',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '💬', title: 'Secure Chat', desc: 'Private messaging with media sharing' },
              { icon: '📅', title: 'Intimate Bookings', desc: 'Plan special moments together' },
              { icon: '📖', title: 'Fantasy Journal', desc: 'Share your deepest thoughts' },
              { icon: '🎵', title: 'TTS Erotica', desc: 'AI-generated intimate audio' },
              { icon: '🎨', title: 'Mood Themes', desc: 'Customize your intimate atmosphere' },
              { icon: '🔒', title: 'Consent Features', desc: 'Respect boundaries always' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'auth',
      title: appStatus?.userCount === 0 ? 'Create Your Account' : 'Join Your Partner',
      subtitle: appStatus?.userCount === 0 
        ? 'Be the first to set up this intimate space' 
        : `${appStatus?.userCount}/2 users registered`,
      content: <AuthForm />,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-intimate-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gradient mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-600">
                {steps[currentStep].subtitle}
              </p>
            </div>

            <div className="mb-8">
              {steps[currentStep].content}
            </div>

            {/* Navigation */}
            {currentStep < 2 && (
              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'text-intimate-600 hover:bg-intimate-50'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={nextStep}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}