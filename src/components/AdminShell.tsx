'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Sidebar, MobileTopBar } from '../components/Sidebar';
import { StoreSidebar } from '../components/StoreSidebar';
import { Loader2, ShieldAlert, Store, CheckCircle2 } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, loginWithEmail, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isTr, setIsTr] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const isStoreVendor = 
    profile?.accountType === 'store' || 
    profile?.storeStatus === 'approved' || 
    profile?.role === 'store' ||
    profile?.isVerifiedStore === true;

  const isSuperAdmin = profile?.role === 'admin' && profile?.accountType !== 'store';

  // Check if current page is the Public Landing Page / Website
  const isPublicWebsite = pathname === '/' || pathname === '/landing' || pathname === '/download' || pathname === '/showcase';

  // If on public website, render children directly without any sidebar frame!
  if (isPublicWebsite) {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <span className="text-sm font-bold text-slate-400 mt-3 animate-pulse">
            AdaBazar KKTC Yükleniyor...
          </span>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Redirect store vendor from any non-store admin route to store dashboard
  useEffect(() => {
    if (loading || !user || !profile) return;
    if (isStoreVendor && !isSuperAdmin && !pathname.startsWith('/store') && !isPublicWebsite) {
      router.push('/store/dashboard');
    }
  }, [loading, user, profile, isStoreVendor, isSuperAdmin, pathname, router, isPublicWebsite]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      if (!pathname.startsWith('/store')) {
        router.push('/store/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isTr ? 'Giriş yapılamadı. Bilgilerinizi kontrol edin.' : 'Login failed. Please check credentials.'));
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <span className="text-sm font-bold text-slate-400 mt-3 animate-pulse">
          {isTr ? 'AdaBazar Portalı Yükleniyor...' : 'Loading Portal...'}
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-3xl shadow-2xl mx-auto">
            AB
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">AdaBazar Kurumsal Portalı</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {isTr ? 'Mağaza veya Yönetim panelinize erişmek için giriş yapın.' : 'Sign in to access your Store or Portal dashboard.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          {errorMsg && <p className="text-xs text-rose-500 font-bold text-center">{errorMsg}</p>}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400">{isTr ? 'E-posta Adresi' : 'Email Address'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="magaza@adabazaar.com"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400">{isTr ? 'Şifre' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/40"
          >
            {loginLoading ? (isTr ? 'Giriş Yapılıyor...' : 'Logging in...') : (isTr ? 'Giriş Yap' : 'Sign In')}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 pt-1">
          <a
            href="/"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl shadow-sm"
          >
            <span>🌐 AdaBazar Web Sitesine Dön →</span>
          </a>

          <button onClick={() => setIsTr(!isTr)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1">
            {isTr ? 'Switch to English' : 'Türkçeye Geç'}
          </button>
        </div>
      </div>
    );
  }

  // If user is NOT admin AND NOT store vendor, show unauthorized block
  if (!isSuperAdmin && !isStoreVendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h1 className="text-2xl font-black text-white">Erişim Yetkisi Bulunmuyor</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Bu hesaba ait yetki tanımlanmamış. Lütfen yöneticinizle iletişime geçin.
        </p>
        <button
          onClick={logout}
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar depending on role */}
      {isStoreVendor && !isSuperAdmin ? (
        <StoreSidebar isTr={isTr} setIsTr={setIsTr} collapsed={collapsed} setCollapsed={setCollapsed} />
      ) : (
        <Sidebar isTr={isTr} setIsTr={setIsTr} collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar isTr={isTr} onMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
