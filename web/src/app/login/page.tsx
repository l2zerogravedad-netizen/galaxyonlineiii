'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 flex items-center justify-center p-4 space-bg">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-success-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4 shadow-lg shadow-primary-600/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-gradient">
            DESTOCK SPACE
          </h1>
          <p className="text-secondary-400">
            Cliente Web Oficial
          </p>
        </div>

        {/* Login form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-500">
            © 2024 DESTOCK SPACE. Todos los derechos reservados.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-secondary-500">
            <a href="/privacy" className="hover:text-secondary-400 transition-colors">
              Privacidad
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-secondary-400 transition-colors">
              Términos
            </a>
            <span>•</span>
            <a href="/support" className="hover:text-secondary-400 transition-colors">
              Soporte
            </a>
          </div>
        </div>
      </div>

      {/* Server status indicator */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-secondary-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-secondary-700">
        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-secondary-300">Servidor en línea</span>
      </div>
    </div>
  );
}
