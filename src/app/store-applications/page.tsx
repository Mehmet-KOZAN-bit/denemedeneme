'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Search, Clock, ShieldCheck, Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

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
    photoURL: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_2',
    storeName: 'Nicosia Real Estate',
    storeType: 'real_estate',
    city: 'Lefkoşa',
    phone: '+90 533 822 3344',
    address: 'Dereboyu caddesi No: 15, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_3',
    storeName: 'Kıbrıs Tech Store',
    storeType: 'electronics',
    city: 'Gazimağusa',
    phone: '+90 533 833 4455',
    address: 'İsmet İnönü Bulvarı No: 88, Gazimağusa',
    photoURL: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_4',
    storeName: 'Lefkoşa Premium Motors',
    storeType: 'auto',
    city: 'Lefkoşa',
    phone: '+90 533 844 5566',
    address: 'Bedrettin Demirel Caddesi No: 104, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_5',
    storeName: 'Alsancak Luxury Homes',
    storeType: 'real_estate',
    city: 'Girne',
    phone: '+90 533 855 6677',
    address: 'Alsancak Ana Yol Üzeri No: 7, Girne',
    photoURL: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_6',
    storeName: 'Mağusa Cell & Tech',
    storeType: 'electronics',
    city: 'Gazimağusa',
    phone: '+90 533 866 7788',
    address: 'Salamis Yolu No: 45, Gazimağusa',
    photoURL: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_7',
    storeName: 'Güzelyurt Tarım & Ticaret',
    storeType: 'other',
    city: 'Güzelyurt',
    phone: '+90 533 877 8899',
    address: 'Ecevit Caddesi No: 12, Güzelyurt',
    photoURL: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_8',
    storeName: 'İskele Beachfront Homes',
    storeType: 'real_estate',
    city: 'İskele',
    phone: '+90 533 888 9900',
    address: 'Long Beach Bölgesi No: 3, İskele',
    photoURL: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_9',
    storeName: 'Lefke Digital Studio',
    storeType: 'electronics',
    city: 'Lefke',
    phone: '+90 533 899 0011',
    address: 'Çamlık Sokak No: 5, Lefke',
    photoURL: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_10',
    storeName: 'KKTC Boutique & Fashion',
    storeType: 'fashion',
    city: 'Girne',
    phone: '+90 533 810 2030',
    address: 'Liman Arkası Sokak No: 19, Girne',
    photoURL: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_11',
    storeName: 'Kıbrıs Mobilya & Dekor',
    storeType: 'home',
    city: 'Lefkoşa',
    phone: '+90 533 820 3040',
    address: 'Taşkınköy Sanayi Bölgesi No: 8, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'fake_store_12',
    storeName: 'Gönyeli Rent & Trade',
    storeType: 'auto',
    city: 'Lefkoşa',
    phone: '+90 533 830 4050',
    address: 'Gönyeli Çemberi Yanı No: 2, Lefkoşa',
    photoURL: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200',
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

  const handleAddFakeStores = async () => {
    if (!confirm('12 Kıbrıslı kurumsal fake mağazayı sisteme eklemek istediğinize emin misiniz?')) return;
    setSeeding(true);
    try {
      const now = new Date().toISOString();
      for (const fs of FAKE_STORES_POOL) {
        // 1. Add user document
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

        // 2. Add store application document
        await setDoc(doc(db, 'store_applications', fs.id), {
          userId: fs.id,
          userDisplayName: fs.storeName,
          storeName: fs.storeName,
          storeType: fs.storeType,
          city: fs.city,
          phone: fs.phone,
          address: fs.address,
          status: 'approved',
          updatedAt: now,
        }, { merge: true });

        // 3. Add 2 sample active listings per fake store
        const sampleListings = [
          {
            id: `fake_prod_${fs.id}_1`,
            title: fs.storeType === 'auto' ? `${fs.storeName} - 2022 Model Lüks Araç` : fs.storeType === 'real_estate' ? `${fs.city} Merkezde 3+1 Lüks Gayrimenkul` : `${fs.storeName} - Orijinal Garantili Ürün`,
            price: fs.storeType === 'auto' ? 35000 : fs.storeType === 'real_estate' ? 185000 : 1250,
            currency: fs.storeType === 'real_estate' || fs.storeType === 'auto' ? 'GBP' : 'EUR',
            category: fs.storeType === 'auto' ? 'Vasıta' : fs.storeType === 'real_estate' ? 'Emlak' : 'Elektronik',
            city: fs.city,
            sellerId: fs.id,
            sellerName: fs.storeName,
            sellerPhone: fs.phone,
            sellerAccountType: 'store',
            isVerifiedStore: true,
            isFake: true,
            status: 'active',
            images: [fs.photoURL],
            createdAt: now,
          },
          {
            id: `fake_prod_${fs.id}_2`,
            title: fs.storeType === 'auto' ? `${fs.city} Galerimizden Temiz Otomobil` : fs.storeType === 'real_estate' ? `${fs.city} Manzaralı Fırsat Satılık Ev` : `${fs.storeName} - Sıfır Kutulu Cihaz`,
            price: fs.storeType === 'auto' ? 24500 : fs.storeType === 'real_estate' ? 120000 : 850,
            currency: fs.storeType === 'real_estate' || fs.storeType === 'auto' ? 'GBP' : 'EUR',
            category: fs.storeType === 'auto' ? 'Vasıta' : fs.storeType === 'real_estate' ? 'Emlak' : 'Elektronik',
            city: fs.city,
            sellerId: fs.id,
            sellerName: fs.storeName,
            sellerPhone: fs.phone,
            sellerAccountType: 'store',
            isVerifiedStore: true,
            isFake: true,
            status: 'active',
            images: [fs.photoURL],
            createdAt: now,
          },
        ];

        for (const lp of sampleListings) {
          await setDoc(doc(db, 'products', lp.id), lp, { merge: true });
        }
      }

      alert('12 Fake Kurumsal Mağaza ve özel ilanları başarıyla eklendi!');
    } catch (e: any) {
      console.error('Error seeding fake stores:', e);
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
        await deleteDoc(doc(db, 'users', fs.id)).catch(() => {});
        await deleteDoc(doc(db, 'store_applications', fs.id)).catch(() => {});
        await deleteDoc(doc(db, 'products', `fake_prod_${fs.id}_1`)).catch(() => {});
        await deleteDoc(doc(db, 'products', `fake_prod_${fs.id}_2`)).catch(() => {});
      }
      alert('Tüm fake mağazalar ve ilanları temizlendi.');
    } catch (e: any) {
      console.error('Error deleting fake stores:', e);
      alert('Hata oluştu: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleApprove = async (app: StoreApp) => {
    if (!confirm(`${app.storeName} mağaza başvurusunu onaylamak istediğinize emin misiniz?`)) return;
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
            Mağaza Başvuruları & Kurumsal Vitrin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            İşletmelerin kurumsal mağaza başvurularını inceleyin, onaylayın veya 12 fake mağaza ekleyin.
          </p>
        </div>

        {/* Action Buttons & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAddFakeStores}
            disabled={seeding}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 12 Fake Mağaza Ekle
          </button>
          <button
            onClick={handleDeleteFakeStores}
            disabled={seeding}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Fake Mağazaları Sil
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl self-start">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'pending', label: 'Bekleyenler' },
          { id: 'approved', label: 'Onaylananlar' },
          { id: 'rejected', label: 'Reddedilenler' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === f.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
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
            Mağaza başvurusu veya kaydı bulunamadı. "12 Fake Mağaza Ekle" butonuna basarak vitrini doldurabilirsiniz.
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
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-slate-800 dark:text-white text-sm">{app.storeName}</p>
                          {app.isFakeStore && (
                            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 text-[10px] font-bold rounded">
                              DEMO MAĞAZA
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{app.userDisplayName || 'Kullanıcı'} ({app.userEmail || 'Mail yok'})</p>
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
