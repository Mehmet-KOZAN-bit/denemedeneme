'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Search, Clock, ShieldCheck, Phone, MapPin, Plus, Trash2, Key, Copy } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { createOrUpdateStoreWebCredentials } from '../../utils/storeAuth';

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
  isFakeStore?: boolean;
}

const SECTOR_LABELS: Record<string, string> = {
  real_estate: 'Emlak & Gayrimenkul',
  auto: 'Oto Galeri & Vasıta',
  electronics: 'Teknoloji & Elektronik',
  fashion: 'Giyim & Mağaza',
  home: 'Ev Eşyaları & Mobilya',
  other: 'Diğer Hizmet & Ticaret',
};

const FAKE_STORES_POOL = [
  {
    id: 'fake_store_1',
    storeName: 'Girne Auto Gallery',
    storeType: 'auto',
    city: 'Girne',
    phone: '+90 533 811 2233',
    address: 'Mete Adanır Caddesi No: 42, Girne',
    photoURL: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_2',
    storeName: 'Nicosia Real Estate',
    storeType: 'real_estate',
    city: 'Lefkoşa',
    phone: '+90 533 822 3344',
    address: 'Dereboyu caddesi No: 15, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_3',
    storeName: 'Kıbrıs Tech Store',
    storeType: 'electronics',
    city: 'Gazimağusa',
    phone: '+90 533 833 4455',
    address: 'İsmet İnönü Bulvarı No: 88, Gazimağusa',
    photoURL: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_4',
    storeName: 'Lefkoşa Premium Motors',
    storeType: 'auto',
    city: 'Lefkoşa',
    phone: '+90 533 844 5566',
    address: 'Bedrettin Demirel Caddesi No: 104, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_5',
    storeName: 'Alsancak Luxury Homes',
    storeType: 'real_estate',
    city: 'Girne',
    phone: '+90 533 855 6677',
    address: 'Alsancak Ana Yol Üzeri No: 7, Girne',
    photoURL: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_6',
    storeName: 'Mağusa Cell & Tech',
    storeType: 'electronics',
    city: 'Gazimağusa',
    phone: '+90 533 866 7788',
    address: 'Salamis Yolu No: 45, Gazimağusa',
    photoURL: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_7',
    storeName: 'Güzelyurt Tarım & Ticaret',
    storeType: 'other',
    city: 'Güzelyurt',
    phone: '+90 533 877 8899',
    address: 'Ecevit Caddesi No: 12, Güzelyurt',
    photoURL: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_8',
    storeName: 'İskele Beachfront Homes',
    storeType: 'real_estate',
    city: 'İskele',
    phone: '+90 533 888 9900',
    address: 'Long Beach Bölgesi No: 3, İskele',
    photoURL: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_9',
    storeName: 'Lefke Digital Studio',
    storeType: 'electronics',
    city: 'Lefke',
    phone: '+90 533 899 0011',
    address: 'Çamlık Sokak No: 5, Lefke',
    photoURL: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_10',
    storeName: 'KKTC Boutique & Fashion',
    storeType: 'fashion',
    city: 'Girne',
    phone: '+90 533 810 2030',
    address: 'Liman Arkası Sokak No: 19, Girne',
    photoURL: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_11',
    storeName: 'Kıbrıs Mobilya & Dekor',
    storeType: 'home',
    city: 'Lefkoşa',
    phone: '+90 533 820 3040',
    address: 'Taşkınköy Sanayi Bölgesi No: 8, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 'fake_store_12',
    storeName: 'Gönyeli Rent & Trade',
    storeType: 'auto',
    city: 'Lefkoşa',
    phone: '+90 533 830 4050',
    address: 'Gönyeli Çemberi Yanı No: 2, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=500',
  },
];

export default function StoreApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Web Credentials Modal State
  const [credModalApp, setCredModalApp] = useState<StoreApp | null>(null);
  const [webEmail, setWebEmail] = useState('');
  const [webPassword, setWebPassword] = useState('');
  const [credSaving, setCredSaving] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; pass: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    let appsData: StoreApp[] = [];
    let usersStoreData: StoreApp[] = [];

    const updateCombined = () => {
      const mergedMap = new Map<string, StoreApp>();

      // 1. Add records from store_applications
      appsData.forEach(app => {
        mergedMap.set(app.id, app);
        if (app.userId) {
          mergedMap.set(app.userId, app);
        }
      });

      // 2. Add/merge records from users collection
      usersStoreData.forEach(u => {
        const existing = mergedMap.get(u.id) || mergedMap.get(u.userId);
        if (existing) {
          mergedMap.set(existing.id, {
            ...existing,
            userDisplayName: existing.userDisplayName || u.userDisplayName,
            userEmail: existing.userEmail || u.userEmail,
            storeName: existing.storeName || u.storeName,
            phone: existing.phone || u.phone,
            city: existing.city || u.city,
            address: existing.address || u.address,
            status: existing.status || u.status,
            isFakeStore: existing.isFakeStore || u.isFakeStore,
          });
        } else {
          mergedMap.set(u.id, u);
        }
      });

      const combinedList = Array.from(mergedMap.values());
      const uniqueList = combinedList.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      );

      uniqueList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(uniqueList);
      setLoading(false);
    };

    const unsubApps = onSnapshot(collection(db, 'store_applications'), snap => {
      appsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoreApp));
      updateCombined();
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      const storeUsers: StoreApp[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if ((data.accountType === 'store' || data.isVerifiedStore === true || data.storeStatus === 'approved') && !data.targetStoreUid) {
          storeUsers.push({
            id: d.id,
            userId: d.id,
            userDisplayName: data.displayName || data.storeInfo?.storeName || 'Mağaza Kullanıcısı',
            userEmail: data.email || data.webEmail || '',
            storeName: data.storeInfo?.storeName || data.displayName || 'Mağaza',
            storeType: data.storeInfo?.storeType || 'other',
            city: data.storeInfo?.city || data.city || 'Kıbrıs',
            phone: data.storeInfo?.phone || data.phone || '',
            address: data.storeInfo?.address || data.address || '',
            status: (data.storeStatus as any) || 'approved',
            createdAt: data.createdAt || new Date().toISOString(),
            isFakeStore: data.isFakeStore || false,
          });
        }
      });
      usersStoreData = storeUsers;
      updateCombined();
    });

    return () => {
      unsubApps();
      unsubUsers();
    };
  }, [user]);

  const handleAddFakeStores = async () => {
    if (!confirm('12 Kıbrıslı kurumsal fake mağazayı sisteme eklemek istediğinize emin misiniz?')) return;
    setSeeding(true);
    try {
      const now = new Date().toISOString();
      for (let index = 0; index < FAKE_STORES_POOL.length; index++) {
        const fs = FAKE_STORES_POOL[index];
        await setDoc(doc(db, 'users', fs.id), {
          displayName: fs.storeName,
          accountType: 'store',
          storeStatus: 'approved',
          isVerifiedStore: true,
          isFakeStore: true,
          photoURL: fs.photoURL,
          phone: fs.phone,
          storeInfo: {
            storeName: fs.storeName,
            storeType: fs.storeType,
            city: fs.city,
            phone: fs.phone,
            address: fs.address,
          },
          createdAt: now,
          updatedAt: now,
        }, { merge: true });

        await setDoc(doc(db, 'store_applications', fs.id), {
          userId: fs.id,
          userDisplayName: fs.storeName,
          storeName: fs.storeName,
          storeType: fs.storeType,
          city: fs.city,
          phone: fs.phone,
          address: fs.address,
          status: 'approved',
          createdAt: now,
          isFakeStore: true,
        }, { merge: true });
      }
      alert('12 kurumsal fake mağaza eklendi!');
    } catch (e: any) {
      alert('Hata oluştu: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteFakeStores = async () => {
    if (!confirm('Tüm fake mağazaları ve ilanlarını silmek istediğinize emin misiniz?')) return;
    setSeeding(true);
    try {
      for (const fs of FAKE_STORES_POOL) {
        await deleteDoc(doc(db, 'store_applications', fs.id)).catch(() => {});
        await deleteDoc(doc(db, 'users', fs.id)).catch(() => {});
      }
      alert('Tüm fake mağazalar temizlendi.');
    } catch (e: any) {
      alert('Hata oluştu: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteStore = async (app: StoreApp) => {
    const storeTitle = app.storeName || app.userDisplayName || 'Mağaza';
    if (!confirm(`"${storeTitle}" mağaza hesabını ve tüm verilerini (ilanlar dahil) kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }

    setProcessingId(app.id);
    try {
      const targetId = app.userId || app.id;

      // 1. Delete store_applications document(s)
      await deleteDoc(doc(db, 'store_applications', app.id)).catch(() => {});
      if (targetId !== app.id) {
        await deleteDoc(doc(db, 'store_applications', targetId)).catch(() => {});
      }

      // 2. Delete user document(s)
      await deleteDoc(doc(db, 'users', targetId)).catch(() => {});
      if (targetId !== app.id) {
        await deleteDoc(doc(db, 'users', app.id)).catch(() => {});
      }

      // 3. Delete store products
      try {
        const q1 = query(collection(db, 'products'), where('sellerId', '==', targetId));
        const s1 = await getDocs(q1);
        s1.docs.forEach(async pDoc => {
          await deleteDoc(pDoc.ref).catch(() => {});
        });

        const q2 = query(collection(db, 'products'), where('userId', '==', targetId));
        const s2 = await getDocs(q2);
        s2.docs.forEach(async pDoc => {
          await deleteDoc(pDoc.ref).catch(() => {});
        });
      } catch (e) {
        console.warn('Listing cleanup error:', e);
      }

      alert(`"${storeTitle}" mağazası ve ilgili tüm verileri başarıyla silindi.`);
    } catch (e: any) {
      alert('Mağaza silinirken hata oluştu: ' + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (app: StoreApp) => {
    setProcessingId(app.id);
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'store_applications', app.id), {
        status: 'approved',
        approvedAt: now,
        updatedAt: now,
      });

      await setDoc(doc(db, 'users', app.userId), {
        accountType: 'store',
        storeStatus: 'approved',
        isVerifiedStore: true,
        storeInfo: {
          storeName: app.storeName,
          storeType: app.storeType,
          city: app.city,
          phone: app.phone,
          address: app.address || '',
        },
        updatedAt: now,
      }, { merge: true });

      alert(`"${app.storeName}" onaylandı ve Kurumsal Mağaza statüsüne yükseltildi!`);
    } catch (e: any) {
      alert('Hata oluştu: ' + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: StoreApp) => {
    if (!confirm(`"${app.storeName}" mağaza başvurusunu reddetmek istediğinize emin misiniz?`)) return;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mağaza Hesapları & Başvuruları</h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistemdeki tüm kurumsal mağazaları görüntüleyin, yeni başvuruları onaylayın, şifre atayın veya mağaza silin.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddFakeStores}
            disabled={seeding}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>12 Fake Mağaza Ekle</span>
          </button>
          <button
            onClick={handleDeleteFakeStores}
            disabled={seeding}
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Fake Mağazaları Sil</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 flex-wrap">
          {[
            { id: 'all', label: `Tüm Mağazalar (${applications.length})` },
            { id: 'pending', label: `Bekleyenler (${applications.filter(a => a.status === 'pending').length})` },
            { id: 'approved', label: `Onaylananlar (${applications.filter(a => a.status === 'approved').length})` },
            { id: 'rejected', label: `Reddedilenler (${applications.filter(a => a.status === 'rejected').length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Mağaza adı, yetkili veya şehir..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 animate-pulse">
            Mağaza hesapları ve başvurular yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">Aramaya uygun mağaza kaydı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">İşletme / Mağaza</th>
                  <th className="p-4">Sektör</th>
                  <th className="p-4">Şehir / Adres</th>
                  <th className="p-4">İletişim</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-white text-sm">{app.storeName}</p>
                          {app.isFakeStore && (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-black rounded-full">
                              DEMO MAĞAZA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {app.userDisplayName || 'Kullanıcı'} ({app.userEmail || 'Mail yok'})
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-xl font-bold text-[11px] bg-slate-950 border border-slate-800 text-slate-300">
                        {SECTOR_LABELS[app.storeType] || app.storeType}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold">{app.city}</span>
                      </div>
                      {app.address && <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{app.address}</p>}
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.phone || '-'}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {app.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> BEKLİYOR
                        </span>
                      ) : app.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> ONAYLANDI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <X className="w-3 h-3" /> REDDEDİLDİ
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={processingId === app.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Onayla
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              disabled={processingId === app.id}
                              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reddet
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setCredModalApp(app);
                            const cleanName = (app.storeName || 'magaza').toLowerCase().replace(/[^a-z0-9]/g, '');
                            setWebEmail(`${cleanName}@adabazaar.com`);
                            setWebPassword(`Mağaza${Math.floor(100000 + Math.random() * 900000)}!`);
                            setCreatedCreds(null);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Web Girişi</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStore(app)}
                          disabled={processingId === app.id}
                          title="Mağazayı Tamamen Sil"
                          className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sil</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Web Credentials Modal */}
      {credModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setCredModalApp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-full uppercase">
                MAĞAZA WEB KİMLİK TANIMLAMA
              </span>
              <h3 className="text-xl font-black text-white mt-2">{credModalApp.storeName}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mağaza sahibinin web paneline (`adabazaar.com.tr`) giriş yapabilmesi için e-posta ve şifre belirleyin.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCredSaving(true);
                try {
                  await createOrUpdateStoreWebCredentials(credModalApp.userId, webEmail, webPassword);
                  setCreatedCreds({ email: webEmail, pass: webPassword });
                  alert('Mağaza web giriş bilgileri başarıyla oluşturuldu ve eşleştirildi!');
                } catch (err: any) {
                  alert('Hata oluştu: ' + err.message);
                } finally {
                  setCredSaving(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Mağaza Web E-Posta Adresi</label>
                <input
                  type="email"
                  value={webEmail}
                  onChange={(e) => setWebEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="magaza@adabazaar.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Mağaza Web Giriş Şifresi</label>
                <input
                  type="text"
                  value={webPassword}
                  onChange={(e) => setWebPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {createdCreds && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Giriş Yetkisi Aktif Edildi!</span>
                  </div>
                  <p className="text-slate-300"><strong>E-Posta:</strong> {createdCreds.email}</p>
                  <p className="text-slate-300"><strong>Şifre:</strong> {createdCreds.pass}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`E-Posta: ${createdCreds.email}\nŞifre: ${createdCreds.pass}`);
                      alert('Giriş bilgileri kopyalandı!');
                    }}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Bilgileri Kopyala</span>
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCredModalApp(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={credSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>{credSaving ? 'Kaydediliyor...' : 'Giriş Yetkisini Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
