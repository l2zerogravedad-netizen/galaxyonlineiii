'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await login(data.email, data.password);
      toast.success('¡Bienvenido de vuelta a DESTOCK SPACE!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.code === 'INVALID_CREDENTIALS') {
        setError('email', { message: 'Credenciales incorrectas' });
        setError('password', { message: 'Verifica tu contraseña' });
      } else if (error.code === 'ACCOUNT_LOCKED') {
        setError('email', { message: 'Cuenta bloqueada temporalmente' });
      } else if (error.code === 'ACCOUNT_NOT_VERIFIED') {
        setError('email', { message: 'Por favor verifica tu correo electrónico' });
      } else {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-secondary-900/50 backdrop-blur-sm rounded-2xl border border-secondary-700 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-secondary-400">
            Ingresa a tu cuenta de DESTOCK SPACE
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                {...register('email', {
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido',
                  },
                })}
                type="email"
                id="email"
                className={`block w-full pl-10 pr-3 py-3 bg-secondary-800 border rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-danger-500' : 'border-secondary-600'
                }`}
                placeholder="tu@correo.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center text-danger-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`block w-full pl-10 pr-10 py-3 bg-secondary-800 border rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-danger-500' : 'border-secondary-600'
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-300" />
                ) : (
                  <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 flex items-center text-danger-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-600 rounded bg-secondary-800"
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-secondary-300">
                Recordarme
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              onClick={() => router.push('/forgot-password')}
              disabled={isSubmitting}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-secondary-400">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              onClick={() => router.push('/register')}
              disabled={isSubmitting}
            >
              Regístrate gratis
            </button>
          </p>
        </div>

        {/* Server Status */}
        <div className="mt-6 pt-6 border-t border-secondary-700">
          <div className="flex items-center justify-center text-xs text-secondary-500">
            <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
            Servidor en línea • Versión 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};
