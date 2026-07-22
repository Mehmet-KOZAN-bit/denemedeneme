'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Ban, Crown, Loader2, Phone, Check, Clock, AlertTriangle, X, CheckCircle, Store, Building2 } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

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
    storePhone?: string;
    storeWhatsapp?: string;
    storeCity?: string;
    storeAddress?: string;
    storeLogo?: string;
    storeBanner?: string;
    appliedAt?: string;
  };
  isBanned?: boolean;
  createdAt?: string;
  photoURL?: string;
  isPhoneVerified?: boolean;
  phone?: string;
}

type FilterTab = 'all' | 'unverified_phones' | 'store_applications';

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

  const approveStore = async (uid: string) => {
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        accountType: 'store',
        storeStatus: 'approved',
        isVerifiedStore: true,
      });
    } catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const rejectStore = async (uid: string) => {
    if (!confirm('Bu mağaza başvurusunu reddetmek istediğinize emin misiniz?')) return;
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        accountType: 'individual',
        storeStatus: 'rejected',
        isVerifiedStore: false,
      });
    } catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const approvePhone = async (uid: string) => {
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        isPhoneVerified: true,
      });
    } catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const togglePhoneVerification = async (uid: string, isVerified: boolean) => {
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        isPhoneVerified: !isVerified,
      });
    }
    catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const toggleBan = async (uid: string, isBanned: boolean) => {
    if (!confirm(isBanned ? 'Bu kullanıcının yasağını kaldırmak istediğinize emin misiniz?' : 'Bu kullanıcıyı banlamak istediğinize emin misiniz?')) return;
    setUpdating(uid);
    try { await updateDoc(doc(db, 'users', uid), { isBanned: !isBanned }); }
    catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const setRole = async (uid: string, role: string) => {
    setUpdating(uid);
    try { await updateDoc(doc(db, 'users', uid), { role }); }
    catch (e: any) { alert('Hata: ' + e.message); }
    finally { setUpdating(null); }
  };

  const unverifiedPhoneUsers = users.filter(u => u.phone && !u.isPhoneVerified);
  const storeApplicationsUsers = users.filter(u => u.storeStatus === 'pending' || (u.storeInfo?.storeName && !u.isVerifiedStore));

  const baseFiltered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase()) ||
    u.storeInfo?.storeName?.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = activeTab === 'unverified_phones'
    ? baseFiltered.filter(u => u.phone && !u.isPhoneVerified)
    : activeTab === 'store_applications'
    ? baseFiltered.filter(u => u.storeStatus === 'pending' || (u.storeInfo?.storeName && !u.isVerifiedStore))
    : baseFiltered;

  const roleBadge: Record<string, string> = {
    admin:          'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    premium_seller: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    user:           'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Kullanıcılar</h1>
          <p className="text-sm text-slate-400">Kullanıcı listesi, rol, ban ve telefon doğrulama yönetimi</p>
        </div>
      </div>

      {/* Info Alert Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-bold mb-1">WhatsApp ile Telefon Doğrulama Süreci</p>
          <p>
            Kullanıcılar telefon numaralarını girdikten sonra WhatsApp üzerinden size doğrulama mesajı gönderir. Mesajdaki e-posta veya UID bilgisini aşağıdaki arama kutusuna yazarak kullanıcıyı hızlıca bulabilir ve yanındaki yeşil onay butonuna tıklayarak telefonunu doğrulayabilirsiniz.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Toplam', value: users.length, color: 'blue', icon: <Users className="w-4 h-4" /> },
          { label: 'Admin', value: users.filter(u => u.role === 'admin').length, color: 'violet', icon: <Crown className="w-4 h-4" /> },
          { label: 'Doğrulanmış', value: users.filter(u => u.isPhoneVerified).length, color: 'emerald', icon: <Phone className="w-4 h-4" /> },
          { label: 'Onay Bekleyenler (Tel Girmiş)', value: unverifiedPhoneUsers.length, color: 'amber', icon: <Clock className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-center">
            <div className={`flex justify-center mb-1 ${
              s.color === 'blue' ? 'text-blue-500' :
              s.color === 'violet' ? 'text-violet-500' :
              s.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
            }`}>{s.icon}</div>
            <p className={`text-2xl font-black ${
              s.color === 'blue' ? 'text-blue-600' :
              s.color === 'violet' ? 'text-violet-600' :
              s.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
            }`}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'}`}
          >
            Tümü ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('store_applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'store_applications' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300'}`}
          >
            <Store className="w-3.5 h-3.5" />
            Mağaza Başvuruları
            {storeApplicationsUsers.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'store_applications' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                {storeApplicationsUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('unverified_phones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'unverified_phones' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            Doğrulanmamış Numaralar
            {unverifiedPhoneUsers.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'unverified_phones' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                {unverifiedPhoneUsers.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="İsim, mağaza veya tel..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">{filtered.length} kullanıcı</span>
          {activeTab === 'store_applications' && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Kurumsal mağaza başvurusu yapmış veya onay bekleyen kullanıcılar
            </span>
          )}
          {activeTab === 'unverified_phones' && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Sadece telefon girmiş ama doğrulanmamış kullanıcılar listeleniyor
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" /><span className="text-sm">Yükleniyor...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            {activeTab === 'store_applications'
              ? <><Store className="w-12 h-12 mb-3 text-emerald-400 opacity-70" /><p className="text-sm font-semibold text-emerald-600">Onay bekleyen mağaza başvurusu yok!</p></>
              : activeTab === 'unverified_phones'
              ? <><CheckCircle className="w-12 h-12 mb-3 text-emerald-400 opacity-70" /><p className="text-sm font-semibold text-emerald-600">Doğrulanmamış telefon numarası yok!</p></>
              : <><Users className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm font-semibold">Kullanıcı bulunamadı</p></>
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">Kullanıcı</th>
                  <th className="px-6 py-3">Mağaza Detayları</th>
                  <th className="px-6 py-3">Telefon / Durum</th>
                  <th className="px-6 py-3">Rol / Mağaza</th>
                  <th className="px-6 py-3">Hesap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(u => (
                  <tr key={u.uid} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors ${u.storeStatus === 'pending' ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL
                          ? <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" alt="" />
                          : <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-black">{u.displayName?.charAt(0) || '?'}</div>
                        }
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-white text-sm block">{u.displayName || '—'}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.storeInfo?.storeName ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 dark:text-white text-xs">{u.storeInfo.storeName}</span>
                          <span className="text-[10px] text-slate-400">{u.storeInfo.storeType || 'Genel'} • {u.storeInfo.storeCity || 'Lefkoşa'}</span>
                        </div>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {u.phone ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{u.phone}</span>
                          {u.isPhoneVerified ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-450">
                              ✓ ONAYLI
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full w-fit bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-405 flex items-center gap-1">
                              ONAY BEKLİYOR
                            </span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${roleBadge[u.role] || roleBadge.user}`}>
                          {u.role === 'admin' ? 'Admin' : u.accountType === 'store' ? 'Kurumsal Mağaza' : 'Bireysel'}
                        </span>
                        {u.storeStatus === 'pending' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full w-fit bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            MAĞAZA ONAY BEKLİYOR
                          </span>
                        )}
                        {u.isVerifiedStore && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full w-fit bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            ONAYLI MAĞAZA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${u.isBanned ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {u.isBanned ? 'Banlı' : 'Aktif'}
                      </span>
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
