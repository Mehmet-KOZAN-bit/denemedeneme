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

  const isAdmin = profile?.role === 'admin';

  // Redirect store vendor from any admin route to store dashboard
  useEffect(() => {
    if (loading || !user || !profile) return;
    if (isStoreVendor && !isAdmin && !pathname.startsWith('/store')) {
      router.push('/store/dashboard');
    }
  }, [loading, user, profile, isStoreVendor, isAdmin, pathname, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorMsg(isTr ? 'Giriş yapılamadı. Bilgilerinizi kontrol edin.' : 'Login failed. Please check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <span className="text-sm font-bold text-slate-400 mt-3 animate-pulse">
          {isTr ? 'AdaBazar Yönetim Portalı Yükleniyor...' : 'Loading Portal...'}
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
            <h1 className="text-3xl font-black text-white">AdaBazar Kurumsal & Yönetim Portalı</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {isTr ? 'Mağaza veya Admin panelinize erişmek için giriş yapın.' : 'Sign in to access your Store or Admin dashboard.'}
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

        <button onClick={() => setIsTr(!isTr)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2">
          {isTr ? 'Switch to English' : 'Türkçeye Geç'}
        </button>
      </div>
    );
  }

  // If user is NOT admin AND NOT store vendor, show unauthorized block
  if (!isAdmin && !isStoreVendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce" />
        <h1 className="text-2xl font-black text-white">{isTr ? 'Kurumsal Mağaza Onayı Bulunmuyor' : 'No Active Store Approval'}</h1>
        <p className="text-sm text-slate-400 max-w-md">
          {isTr 
            ? 'Bu panele erişmek için Onaylı Kurumsal Mağaza hesabınızın olması gerekir. Mobil uygulamadan yaptığınız başvuru henüz inceleme aşamasındadır.' 
            : 'You need an approved corporate store account to access this vendor portal.'}
        </p>
        <button onClick={logout} className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
          {isTr ? 'Çıkış Yap' : 'Log Out'}
        </button>
      </div>
    );
  }

  // RENDER STORE VENDOR SAAS SHELL
  if (isStoreVendor && !isAdmin) {
    if (!pathname.startsWith('/store')) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <span className="text-sm font-bold text-slate-400 mt-3 animate-pulse">
            Mağaza Paneline Yönlendiriliyorsunuz...
          </span>
        </div>
      );
    }

    const storeName = profile?.storeInfo?.storeName || profile?.displayName || 'Mağazam';

    return (
      <div className="min-h-screen flex bg-slate-950 text-slate-100">
        {/* Desktop Store Sidebar */}
        <StoreSidebar isTr={isTr} setIsTr={setIsTr} collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Store Header */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-200">
                {isTr ? `Hoş geldiniz, ${storeName}` : `Welcome, ${storeName}`}
              </span>
              <span className="hidden sm:flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ONAYLI MAĞAZA
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/store/add-listing"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>+ {isTr ? 'Yeni İlan Ekle' : 'Add Listing'}</span>
              </a>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // RENDER SUPER ADMIN SHELL
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar isTr={isTr} setIsTr={setIsTr} collapsed={collapsed} setCollapsed={setCollapsed} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-slate-900 h-full">
            <Sidebar isTr={isTr} setIsTr={setIsTr} collapsed={false} setCollapsed={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <MobileTopBar isTr={isTr} onMenuClick={() => setMobileOpen(true)} />

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
