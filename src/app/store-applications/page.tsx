'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Search, Clock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

interface StoreApp {
  id: string;
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  storeName: string;
  storeType: string;
  city: string;
  phone: string;
  taxId?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const SECTOR_LABELS: Record<string, string> = {
  real_estate: 'Emlak & Gayrimenkul',
  auto: 'Oto Galeri & Vasıta',
  electronics: 'Teknoloji & Elektronik',
  fashion: 'Giyim & Mağaza',
  home: 'Ev Eşyaları & Mobilya',
  other: 'Diğer Hizmet & Ticaret',
};

export default function StoreApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const colRef = collection(db, 'store_applications');
    const unsub = onSnapshot(colRef, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoreApp));
      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleApprove = async (app: StoreApp) => {
    if (!confirm(`${app.storeName} mağaza başvurusunu onaylamak istediğinize emin misiniz?`)) return;
    setProcessingId(app.id);
    try {
      const now = new Date().toISOString();

      // 1. Update application status
      await updateDoc(doc(db, 'store_applications', app.id), {
        status: 'approved',
        approvedAt: now,
        updatedAt: now,
      });

      // 2. Update user profile to verified store
      await setDoc(doc(db, 'users', app.userId), {
        accountType: 'store',
        storeStatus: 'approved',
        isVerifiedStore: true,
        storeInfo: {
          storeName: app.storeName,
          storeType: app.storeType,
          city: app.city,
          phone: app.phone,
          taxId: app.taxId || '',
          address: app.address || '',
        },
        updatedAt: now,
      }, { merge: true });

      alert(`${app.storeName} mağazası başarıyla onaylandı ve kurumsal hesaba yükseltildi!`);
    } catch (e: any) {
      console.error('Error approving store application:', e);
      alert('Hata oluştu: ' + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: StoreApp) => {
    if (!confirm(`${app.storeName} mağaza başvurusunu reddetmek istediğinize emin misiniz?`)) return;
    setProcessingId(app.id);
    try {
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'store_applications', app.id), {
        status: 'rejected',
        rejectedAt: now,
        updatedAt: now,
      });

      await setDoc(doc(db, 'users', app.userId), {
        storeStatus: 'rejected',
        updatedAt: now,
      }, { merge: true });

      alert('Başvuru reddedildi.');
    } catch (e: any) {
      console.error('Error rejecting store application:', e);
      alert('Hata oluştu: ' + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    const s = search.toLowerCase();
    return (
      app.storeName?.toLowerCase().includes(s) ||
      app.userDisplayName?.toLowerCase().includes(s) ||
      app.city?.toLowerCase().includes(s) ||
      app.phone?.includes(s)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Mağaza Başvuruları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            İşletmelerin kurumsal mağaza başvurularını inceleyin ve onaylayın.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl self-start">
          {[
            { id: 'pending', label: 'Bekleyenler' },
            { id: 'approved', label: 'Onaylananlar' },
            { id: 'rejected', label: 'Reddedilenler' },
            { id: 'all', label: 'Tümü' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Mağaza adı, ad soyad veya telefon ile ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {filter === 'pending' ? 'Bekleyen mağaza başvurusu bulunmuyor.' : 'Başvuru kaydı bulunamadı.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">İşletme / Mağaza</th>
                  <th className="px-6 py-3">Sektör</th>
                  <th className="px-6 py-3">Şehir / Konum</th>
                  <th className="px-6 py-3">İletişim</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white text-sm">{app.storeName}</p>
                        <p className="text-xs text-slate-400">{app.userDisplayName || 'Kullanıcı'} ({app.userEmail || 'Mail yok'})</p>
                        {app.taxId && <p className="text-[10px] text-teal-600 font-mono mt-0.5">Vergi No: {app.taxId}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {SECTOR_LABELS[app.storeType] || app.storeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.city}</span>
                      </div>
                      {app.address && <p className="text-[11px] text-slate-400 truncate max-w-xs">{app.address}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          <Clock className="w-3 h-3" /> Bekliyor
                        </span>
                      ) : app.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                          <ShieldCheck className="w-3 h-3" /> Onaylandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                          <X className="w-3 h-3" /> Reddedildi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Onayla
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Reddet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
