'use client';

import React from 'react';
import { Settings, User, Shield, Globe, Database, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-slate-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Ayarlar</h1>
          <p className="text-sm text-slate-400">Admin profili ve sistem bilgileri</p>
        </div>
      </div>

      {/* Admin profile card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Admin Profili
        </h2>
        <div className="flex items-center gap-4">
          {user?.photoURL
            ? <img src={user.photoURL} className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-200 dark:border-teal-800" alt="avatar" />
            : <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center text-xl font-black">{user?.displayName?.charAt(0) || 'A'}</div>
          }
          <div>
            <p className="font-extrabold text-slate-800 dark:text-white">{profile?.displayName || user?.displayName || 'Admin'}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="text-[11px] font-black bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded-full mt-1 inline-block">
              {profile?.role === 'admin' ? '👑 Admin' : profile?.role || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Güvenlik
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Giriş Yöntemi', value: 'Google OAuth 2.0' },
            { label: 'Firebase UID', value: user?.uid || '—' },
            { label: 'Hesap Durumu', value: 'Aktif ✅' },
            { label: 'İki Faktörlü Doğrulama', value: 'Google hesabınıza bağlı' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-500 font-medium">{item.label}</span>
              <span className="text-sm font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" /> Sistem Bilgileri
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Platform', value: 'AdaBazar C2C Marketplace' },
            { label: 'Admin Panel Versiyonu', value: 'v1.2.0' },
            { label: 'Veritabanı', value: 'Firebase Firestore' },
            { label: 'Auth', value: 'Firebase Auth' },
            { label: 'Storage', value: 'Firebase Storage + Supabase' },
            { label: 'API', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1' },
            { label: 'Firebase Project', value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '—' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-500 font-medium">{item.label}</span>
              <span className="text-sm font-bold text-slate-700 dark:text-white truncate max-w-[250px]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Hızlı Bağlantılar
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Firebase Console', href: 'https://console.firebase.google.com' },
            { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard' },
            { label: 'Web Sitesi', href: 'http://localhost:3000' },
            { label: 'Backend API', href: 'http://localhost:4000/api/v1' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition-all"
            >
              <Info className="w-4 h-4 shrink-0" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
