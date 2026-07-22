'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, ShieldAlert, Activity, Bell, Clock, TrendingUp } from 'lucide-react';
import { useAuth, db } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeAds, setActiveAds] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayAds, setTodayAds] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub1 = onSnapshot(collection(db, 'users'), s => setTotalUsers(s.size));
    const unsub2 = onSnapshot(query(collection(db, 'products'), where('status', '==', 'active')), s => setActiveAds(s.size));
    const unsub3 = onSnapshot(query(collection(db, 'products'), where('status', '==', 'pending')), s => setPendingCount(s.size));
    const unsub4 = onSnapshot(collection(db, 'announcements'), s => setAnnouncementsCount(s.size));

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const unsub5 = onSnapshot(collection(db, 'products'), s => {
      const count = s.docs.filter(d => {
        const createdAt = d.data().createdAt;
        return createdAt && new Date(createdAt) >= todayStart;
      }).length;
      setTodayAds(count);
    });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, [user]);

  const metrics = [
    { label: 'Toplam Kullanıcı', value: totalUsers, icon: Users,       color: 'teal',   sub: 'Kayıtlı hesaplar' },
    { label: 'Aktif İlanlar',    value: activeAds,  icon: FileText,    color: 'emerald', sub: 'Canlı ilanlar' },
    { label: 'Bekleyen Onay',    value: pendingCount, icon: ShieldAlert, color: 'amber',  sub: 'İnceleme bekliyor' },
    { label: 'Bugün Eklenen',    value: todayAds,   icon: TrendingUp,  color: 'blue',   sub: 'Yeni ilanlar' },
    { label: 'Duyurular',        value: announcementsCount, icon: Bell, color: 'violet', sub: 'Toplam duyuru' },
  ];

  const colorMap: Record<string, string> = {
    teal:    'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    violet:  'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">AdaBazar platform genel durumu</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          SYSTEM STABLE
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[m.color]}`}>
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{m.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{m.label}</p>
              <p className="text-[10px] text-slate-400">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/listings" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-teal-500" />
            <span className="font-bold text-sm text-slate-700 dark:text-white">İlan Yönetimi</span>
          </div>
          <p className="text-xs text-slate-400">Bekleyen, aktif ve reddedilen tüm ilanları yönet</p>
          <p className="text-xs font-bold text-teal-500 mt-2 group-hover:underline">İlanlara git →</p>
        </a>
        <a href="/users" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-sm text-slate-700 dark:text-white">Kullanıcı Yönetimi</span>
          </div>
          <p className="text-xs text-slate-400">Kullanıcıları listele, rol ver, ban et</p>
          <p className="text-xs font-bold text-blue-500 mt-2 group-hover:underline">Kullanıcılara git →</p>
        </a>
        <a href="/announcements" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-violet-400 dark:hover:border-violet-600 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-violet-500" />
            <span className="font-bold text-sm text-slate-700 dark:text-white">Duyurular</span>
          </div>
          <p className="text-xs text-slate-400">Kullanıcılara anlık bildirim ve duyuru gönder</p>
          <p className="text-xs font-bold text-violet-500 mt-2 group-hover:underline">Duyurulara git →</p>
        </a>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-base text-slate-700 dark:text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          Son İşlemler
        </h2>
        <div className="space-y-3">
          {[
            { text: 'Sistem başlatıldı', time: 'Az önce', color: 'emerald' },
            { text: 'Admin paneli yüklendi', time: 'Az önce', color: 'teal' },
            { text: `${pendingCount} ilan onay bekliyor`, time: 'Canlı', color: pendingCount > 0 ? 'amber' : 'slate' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={`w-2 h-2 rounded-full bg-${item.color}-500 shrink-0`} />
              <span className="text-slate-600 dark:text-slate-300 flex-1">{item.text}</span>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
