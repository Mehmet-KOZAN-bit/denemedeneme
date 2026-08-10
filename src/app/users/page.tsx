'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, Loader2, Phone, CheckCircle, Store, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  accountType?: string;
  storeStatus?: 'pending' | 'approved' | 'rejected';
  isVerifiedStore?: boolean;
  storeInfo?: {
    storeName?: string;
    storeType?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  isBanned?: boolean;
  createdAt?: string;
  photoURL?: string;
  isPhoneVerified?: boolean;
  phone?: string;
}

type FilterTab = 'all' | 'stores' | 'individual';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserRecord));
      data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const togglePhoneVerification = async (uid: string, isVerified: boolean) => {
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        isPhoneVerified: !isVerified,
      });
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const toggleBan = async (uid: string, isBanned: boolean) => {
    if (!confirm(isBanned ? 'Bu kullanıcının yasağını kaldırmak istediğinize emin misiniz?' : 'Bu kullanıcıyı banlamak istediğinize emin misiniz?')) return;
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned: !isBanned });
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (u: UserRecord) => {
    const name = u.displayName || u.storeInfo?.storeName || u.email || 'Hesap';
    if (!confirm(`"${name}" hesabını ve bu hesaba ait tüm verileri/ilanları kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }
    setUpdating(u.uid);
    try {
      // 1. Delete doc from users
      await deleteDoc(doc(db, 'users', u.uid)).catch(() => {});
      // 2. Delete doc from store_applications if exists
      await deleteDoc(doc(db, 'store_applications', u.uid)).catch(() => {});

      // 3. Delete products
      try {
        const q1 = query(collection(db, 'products'), where('sellerId', '==', u.uid));
        const s1 = await getDocs(q1);
        s1.docs.forEach(async pDoc => await deleteDoc(pDoc.ref).catch(() => {}));

        const q2 = query(collection(db, 'products'), where('userId', '==', u.uid));
        const s2 = await getDocs(q2);
        s2.docs.forEach(async pDoc => await deleteDoc(pDoc.ref).catch(() => {}));
      } catch (prodErr) {
        console.warn('Product delete note:', prodErr);
      }

      alert(`"${name}" hesabı tamamen silindi.`);
    } catch (e: any) {
      alert('Silinirken hata oluştu: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const storesCount = users.filter(u => (u.accountType === 'store' || u.isVerifiedStore) && !(u as any).targetStoreUid).length;
  const individualCount = users.length - storesCount;

  const baseFiltered = users.filter(u =>
    !(u as any).targetStoreUid &&
    (u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase()) ||
    u.storeInfo?.storeName?.toLowerCase().includes(search.toLowerCase()))
  );

  const filtered = activeTab === 'stores'
    ? baseFiltered.filter(u => u.accountType === 'store' || u.isVerifiedStore)
    : activeTab === 'individual'
    ? baseFiltered.filter(u => u.accountType !== 'store' && !u.isVerifiedStore)
    : baseFiltered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Kullanıcı & Mağaza Yönetimi</h1>
            <p className="text-xs text-slate-400 mt-0.5">Tüm kayıtlı kullanıcıları ve mağazaları yönetin, yasaklayın veya tamamen silin.</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'all', label: `Tümü (${users.length})` },
            { id: 'stores', label: `Mağazalar (${storesCount})` },
            { id: 'individual', label: `Bireysel (${individualCount})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as FilterTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="İsim, email veya telefon ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 animate-pulse">
            Kullanıcılar yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">Aramaya uygun kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Kullanıcı / İşletme</th>
                  <th className="p-4">Hesap Türü</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(u => {
                  const isStore = u.accountType === 'store' || u.isVerifiedStore;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img src={u.photoURL} className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
                              {u.displayName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white max-w-xs truncate">{u.displayName || '—'}</p>
                            <p className="text-[11px] text-slate-400 max-w-xs truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {isStore ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-emerald-400">{u.storeInfo?.storeName || u.displayName}</span>
                            <span className="text-[10px] text-slate-400">KURUMSAL MAĞAZA</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Bireysel Hesap</span>
                        )}
                      </td>

                      <td className="p-4">
                        {u.phone ? (
                          <span className="text-slate-300 font-mono">{u.phone}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          u.isBanned
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {u.isBanned ? 'YASAKLI (BAN)' : 'AKTİF'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleBan(u.uid, !!u.isBanned)}
                            disabled={updating === u.uid}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                              u.isBanned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{u.isBanned ? 'Banı Kaldır' : 'Banla'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={updating === u.uid}
                            title="Hesabı tamamen sil"
                            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sil</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
