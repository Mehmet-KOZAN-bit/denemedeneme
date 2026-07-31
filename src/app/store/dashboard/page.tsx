'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, db } from '../../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Package, 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  PlusCircle, 
  Store, 
  TrendingUp, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function StoreDashboardPage() {
  const { user, profile } = useAuth();
  const [storeListings, setStoreListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const storeName = profile?.storeInfo?.storeName || profile?.displayName || 'Kurumsal Mağaza';
  const city = profile?.storeInfo?.city || 'KKTC';
  const sector = profile?.storeInfo?.storeType || 'Genel Ticaret';

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const sellerIds = Array.from(new Set([user?.uid, profile?.targetStoreUid, profile?.uid].filter(Boolean)));
    const q = sellerIds.length > 1
      ? query(collection(db, 'products'), where('sellerId', 'in', sellerIds))
      : query(collection(db, 'products'), where('sellerId', '==', sellerIds[0]));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setStoreListings(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user, profile]);

  const activeCount = storeListings.filter(item => item.status !== 'passive').length;
  const totalValue = storeListings.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              MAĞAZA SAAS PORTALI
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {city}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Hoş Geldiniz, {storeName} 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Kurumsal mağaza paneliniz üzerinden ilanlarınızı yayınlayabilir, stoklarınızı takip edebilir ve mağaza profilinizi güncelleyebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/store/add-listing"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni İlan Yayınla</span>
          </Link>
          <Link
            href="/store/settings"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-3 rounded-2xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Mağaza Ayarları</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AKTİF İLANLAR</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{activeCount}</p>
            <p className="text-xs text-slate-400 mt-1">Yayındaki toplam mağaza ilanınız</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ENVANTER DEĞERİ</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">₺{totalValue.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-slate-400 mt-1">Yayındaki ürünlerinizin toplam tutarı</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MAĞAZA DURUMU</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-400">ONAYLI GALERİ</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Mobil ve web üzerinde onaylı rozet aktif</p>
          </div>
        </div>
      </div>

      {/* Recent Listings Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Son Eklenen Mağaza İlanlarınız</h2>
            <p className="text-xs text-slate-400 mt-0.5">En son yayınladığınız ürün ve hizmetler</p>
          </div>
          <Link href="/store/listings" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>Tümünü Gör</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">İlanlar yükleniyor...</p>
        ) : storeListings.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">Henüz yayınlanmış ilanınız bulunmuyor</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Web paneli üzerinden ilk ilananızı saniyeler içinde ekleyebilirsiniz.</p>
            <Link
              href="/store/add-listing"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>İlk İlanını Ekle</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeListings.slice(0, 6).map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition-all">
                <img
                  src={item.images?.[0] || item.img || 'https://via.placeholder.com/150'}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-white truncate">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{item.city || 'Kıbrıs'} • {item.category || 'Genel'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-sm text-emerald-400">
                      {item.price ? `₺${Number(item.price).toLocaleString('tr-TR')}` : 'Fiyat Belirtilmedi'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      YAYINDA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
