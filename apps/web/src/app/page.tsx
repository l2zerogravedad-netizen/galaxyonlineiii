'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [empireName, setEmpireName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const response = await axios.post('/api/auth/register', {
          email,
          password,
          username,
          empireName,
        });
        localStorage.setItem('token', response.data.token);
      } else {
        const response = await axios.post('/api/auth/login', {
          email,
          password,
        });
        localStorage.setItem('token', response.data.token);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400">Galaxy Online III</h1>
          <p className="mt-2 text-gray-400">
            {isRegistering ? 'Crea tu imperio' : 'Ingresa a tu imperio'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
                required
                minLength={3}
              />
              <input
                type="text"
                placeholder="Nombre del Imperio"
                value={empireName}
                onChange={(e) => setEmpireName(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
                required
                minLength={3}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
            minLength={8}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
