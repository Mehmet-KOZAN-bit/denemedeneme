'use client';

import React, { useState, useEffect } from 'react';
import { Package, Check, X, Trash2, Search, Filter, Loader2, Eye, Gift } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';

type Status = 'all' | 'pending' | 'active' | 'rejected';

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  category: string;
  status: string;
  sellerId: string;
  createdAt: string;
  images?: string[];
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const col = collection(db, 'products');
    const q = filter === 'all' ? col : query(col, where('status', '==', filter));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user, filter]);

  useEffect(() => {
    const missing = products.map(p => p.sellerId).filter(uid => uid && !sellerNames[uid]);
    if (!missing.length) return;
    missing.forEach(uid => {
      getDoc(doc(db, 'users', uid)).then(d => {
        const name = d.exists() ? (d.data().displayName || d.data().email || 'Kullanıcı') : 'Kullanıcı';
        setSellerNames(prev => ({ ...prev, [uid]: name }));
      }).catch(() => setSellerNames(prev => ({ ...prev, [uid]: 'Kullanıcı' })));
    });
  }, [products]);

  const approve = async (id: string) => { await updateDoc(doc(db, 'products', id), { status: 'active', updatedAt: new Date().toISOString() }); };
  const reject  = async (id: string) => { await updateDoc(doc(db, 'products', id), { status: 'rejected', updatedAt: new Date().toISOString() }); };
  const remove  = async (id: string) => { if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return; await deleteDoc(doc(db, 'products', id)); };

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const tabs: { key: Status; label: string }[] = [
    { key: 'pending',  label: 'Bekleyen' },
    { key: 'active',   label: 'Aktif' },
    { key: 'rejected', label: 'Reddedilen' },
    { key: 'all',      label: 'Tümü' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-teal-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">İlan Yönetimi</h1>
          <p className="text-sm text-slate-400">Tüm ilanları incele, onayla veya reddet</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === t.key ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Başlık, şehir veya kategori..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-teal-400 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{filtered.length} ilan</span>
          <Filter className="w-4 h-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" /><span className="text-sm">Yükleniyor...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-semibold">Hiç ilan bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">İlan</th>
                  <th className="px-6 py-3">Satıcı</th>
                  <th className="px-6 py-3">Konum</th>
                  <th className="px-6 py-3">Fiyat</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />}
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-white text-sm leading-tight line-clamp-1">{p.title}</p>
                          <p className="text-xs text-slate-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{sellerNames[p.sellerId] || '...'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{p.city}</td>
                    <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400 text-sm">
                      {(p as any).isGiveaway || p.price === 0 ? (
                        <span className="inline-flex items-center gap-1 bg-teal-55/60 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-500/10 px-2 py-0.5 rounded-lg text-[11px] font-black uppercase">
                          <Gift className="w-3 h-3" />
                          <span>Askıda</span>
                        </span>
                      ) : (
                        `${formatPrice(p.price)} ${p.currency}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-black px-2 py-1 rounded-full ${statusBadge[p.status] || ''}`}>
                        {p.status === 'active' ? 'Aktif' : p.status === 'pending' ? 'Bekliyor' : p.status === 'rejected' ? 'Reddedildi' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => approve(p.id)} className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors" title="Onayla">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => reject(p.id)} className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors" title="Reddet">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {p.status === 'rejected' && (
                          <button onClick={() => approve(p.id)} className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors" title="Aktif Et">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => remove(p.id)} className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors" title="Sil">
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}
