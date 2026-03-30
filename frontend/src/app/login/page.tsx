'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERPStore } from '@/store/erp.store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useERPStore(s => s.setAuth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      router.push('/dashboard');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">GW</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">Grupo Workaholic</h1>
        <p className="text-text-hint text-sm text-center mb-8">Sistema de gestión financiera</p>

        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="block text-xs text-text-hint mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-base"
              placeholder="admin@grupoworkaholic.com"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-hint mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full bg-blue-600 mt-2"
          >
            {loading ? 'Entrando…' : 'Entrar al sistema'}
          </button>
        </form>

        <p className="text-center text-xs text-text-hint mt-6">
          Grupo Workaholic · ERP v1.0
        </p>
      </div>
    </div>
  );
}
