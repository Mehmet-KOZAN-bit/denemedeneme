'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, ShieldAlert, Activity, Building2 } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeAds, setActiveAds] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [storeApplicationsCount, setStoreApplicationsCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub1 = onSnapshot(collection(db, 'users'), s => setTotalUsers(s.size));
    const unsub2 = onSnapshot(query(collection(db, 'products'), where('status', '==', 'active')), s => setActiveAds(s.size));
    const unsub3 = onSnapshot(query(collection(db, 'products'), where('status', '==', 'pending')), s => setPendingCount(s.size));
    const unsub4 = onSnapshot(query(collection(db, 'store_applications'), where('status', '==', 'pending')), s => setStoreApplicationsCount(s.size));

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [user]);

  const metrics = [
    { label: 'Mağaza Başvuruları', value: storeApplicationsCount, icon: Building2, color: 'emerald', sub: 'Onay bekleyen mağaza' },
    { label: 'Toplam Kullanıcı', value: totalUsers, icon: Users, color: 'blue', sub: 'Kayıtlı hesaplar' },
    { label: 'Aktif İlanlar', value: activeAds, icon: FileText, color: 'teal', sub: 'Yayındaki ilanlar' },
    { label: 'Bekleyen İlanlar', value: pendingCount, icon: ShieldAlert, color: 'amber', sub: 'İnceleme bekliyor' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Yönetim Portalı Özeti</h1>
          <p className="text-xs text-slate-400 mt-1">AdaBazar KKTC genel istatistikleri ve sistem durumu</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold px-4 py-2 rounded-2xl self-start sm:self-auto">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>SİSTEM AKTİF & CANLI</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{m.value}</p>
              <p className="text-xs font-bold text-slate-300 mt-0.5">{m.label}</p>
              <p className="text-[10px] text-slate-500">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <a href="/store-applications" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">Mağaza Başvuruları & Yönetim</span>
              <span className="text-[10px] font-bold text-emerald-400">WEB GİRİŞİ TANIMLA</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kurumsal mağaza başvurularını onaylayın ve mağaza sahiplerine özel e-posta/şifre giriş yetkisi atayın.
          </p>
          <span className="inline-block text-xs font-bold text-emerald-400 mt-4 group-hover:translate-x-1 transition-transform">
            Mağazalara Git →
          </span>
        </a>

        <a href="/listings" className="group bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-3xl p-6 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">İlan Yönetimi</span>
              <span className="text-[10px] font-bold text-teal-400">TÜM İLANLAR</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Platformdaki tüm ilanları inceleyin, düzenleyin, yayından kaldırın veya kalıcı olarak silin.
          </p>
          <span className="inline-block text-xs font-bold text-teal-400 mt-4 group-hover:translate-x-1 transition-transform">
            İlanlara Git →
          </span>
        </a>

        <a href="/users" className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">Kullanıcılar & Engelleme</span>
              <span className="text-[10px] font-bold text-blue-400">HESAPLAR</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tüm kayıtlı kullanıcı hesaplarını listeleyin ve gerektiğinde hesap engeli koyun.
          </p>
          <span className="inline-block text-xs font-bold text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
            Kullanıcılara Git →
          </span>
        </a>
      </div>
    </div>
  );
}
