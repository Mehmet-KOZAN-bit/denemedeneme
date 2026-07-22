'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar, MobileTopBar } from '../components/Sidebar';
import { Globe, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, loginWithEmail, logout } = useAuth();
  const [isTr, setIsTr] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorMsg(isTr ? 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.' : 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <span className="text-sm font-bold text-slate-400 mt-3 animate-pulse">
          {isTr ? 'Yönetici Paneli Yükleniyor...' : 'Loading Admin Portal...'}
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-3xl shadow-2xl mx-auto">
            AB
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">AdaBazar Admin</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {isTr ? 'Yönetim paneline erişmek için giriş yapın.' : 'Sign in to access the admin panel.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
          {errorMsg && <p className="text-xs text-rose-500 font-bold text-center">{errorMsg}</p>}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400">{isTr ? 'E-posta Adresi' : 'Email Address'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400">{isTr ? 'Şifre' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg"
          >
            {loginLoading ? (isTr ? 'Giriş Yapılıyor...' : 'Logging in...') : (isTr ? 'Giriş Yap' : 'Sign In')}
          </button>
        </form>

        <button onClick={() => setIsTr(!isTr)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2">
          {isTr ? 'Switch to English' : 'Türkçeye Geç'}
        </button>
      </div>
    );
  }

  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce" />
        <h1 className="text-2xl font-black text-white">{isTr ? 'Yetkisiz Erişim' : 'Unauthorized'}</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          {isTr ? 'Bu bölüme girmek için yönetici yetkisi gereklidir.' : 'You need admin privileges to access this panel.'}
        </p>
        <button onClick={logout} className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
          {isTr ? 'Çıkış Yap' : 'Log Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar isTr={isTr} setIsTr={setIsTr} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-slate-900 h-full">
            <Sidebar isTr={isTr} setIsTr={setIsTr} collapsed={false} setCollapsed={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <MobileTopBar isTr={isTr} onMenuClick={() => setMobileOpen(true)} />

        {/* Top header bar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 hidden md:flex items-center justify-between shadow-xs shrink-0">
          <span className="text-xs text-slate-400 font-bold">
            {isTr ? `Hoş geldin, ${profile?.displayName || 'Admin'} 👋` : `Welcome back, ${profile?.displayName || 'Admin'} 👋`}
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="text-xs font-bold text-slate-400">SYSTEM STABLE</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
