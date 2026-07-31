'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, db } from '../../../context/AuthContext';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Edit2,
  X,
  Save
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Emlak & Gayrimenkul',
  'Vasıta & Araçlar',
  'Elektronik & Teknoloji',
  'Giyim & Mağaza',
  'Ev Eşyaları & Mobilya',
  'Diğer Hizmet & Ticaret',
];

const CITIES = ['Lefkoşa', 'Girne', 'Gazimağusa', 'Güzelyurt', 'İskele', 'Lefke'];

export default function StoreListingsPage() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState('TRY');
  const [editCategory, setEditCategory] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const webUid = user.uid;
    const targetUid = profile?.targetStoreUid;
    const profUid = profile?.uid;
    const storeName = profile?.storeInfo?.storeName || profile?.displayName;

    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((item: any) => {
          const sid = item.sellerId || item.seller?.id;
          const sName = item.sellerName || item.seller?.name;

          const matchesId = 
            (sid && sid === webUid) || 
            (targetUid && sid === targetUid) || 
            (profUid && sid === profUid);

          const matchesName = 
            storeName && sName && 
            sName.toLowerCase().trim() === storeName.toLowerCase().trim();

          return matchesId || matchesName;
        });

      docs.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setListings(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user, profile]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" ilanını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e: any) {
      alert('Silinirken hata oluştu: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'passive' ? 'active' : 'passive';
    try {
      await updateDoc(doc(db, 'products', item.id), { status: newStatus });
    } catch (e: any) {
      alert('Durum güncellenirken hata oluştu: ' + e.message);
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditPrice(item.price ? String(item.price) : '');
    setEditCurrency(item.currency || 'TRY');
    setEditCategory(item.category || CATEGORIES[0]);
    setEditCity(item.city || CITIES[0]);
    setEditDistrict(item.district || '');
    setEditDescription(item.description || '');
    setEditImageUrl(item.images?.[0] || item.imageUrl || item.img || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim() || editTitle.length < 5) {
      alert('Lütfen geçerli bir başlık girin.');
      return;
    }

    if (!editPrice || isNaN(Number(editPrice)) || Number(editPrice) <= 0) {
      alert('Lütfen geçerli bir fiyat girin.');
      return;
    }

    setEditSaving(true);
    try {
      const now = new Date().toISOString();
      const updatedImg = editImageUrl.trim() || editingItem.images?.[0] || editingItem.imageUrl || editingItem.img;

      await updateDoc(doc(db, 'products', editingItem.id), {
        title: editTitle.trim(),
        price: parseFloat(editPrice),
        currency: editCurrency,
        category: editCategory,
        city: editCity,
        district: editDistrict.trim() || 'Merkez',
        description: editDescription.trim(),
        images: [updatedImg],
        img: updatedImg,
        imageUrl: updatedImg,
        updatedAt: now,
      });

      alert('İlan başarıyla güncellendi!');
      setEditingItem(null);
    } catch (e: any) {
      alert('Güncellenirken hata oluştu: ' + e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const filtered = listings.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase()) ||
    item.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Mağaza İlanlarım</h1>
          <p className="text-xs text-slate-400 mt-1">Yayındaki ve geçmiş mağaza ürünlerinizi bu panelden yönetebilir veya düzenleyebilirsiniz.</p>
        </div>

        <Link
          href="/store/add-listing"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni İlan Ekle</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İlan başlığı, kategori veya şehir ara..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Listings Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 animate-pulse">
            İlanlar yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Package className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-400">Henüz hiç ilan eklemediniz</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hemen yeni bir ilan paylaşarak potansiyel müşterilere ulaşabilirsiniz.
            </p>
            <Link
              href="/store/add-listing"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>İlan Ekle</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Ürün</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Fiyat</th>
                  <th className="p-4">Konum</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => {
                  const img = item.images?.[0] || item.imageUrl || item.img || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=200';
                  const isPassive = item.status === 'passive';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={img} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" alt="" />
                          <div>
                            <p className="font-extrabold text-white text-sm max-w-xs truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[11px]">
                          {item.category || 'Genel'}
                        </span>
                      </td>

                      <td className="p-4 font-black text-emerald-400 text-sm">
                        {item.price ? `${item.price.toLocaleString('tr-TR')} ${item.currency || '₺'}` : 'Ücretsiz'}
                      </td>

                      <td className="p-4 text-slate-300 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.city || 'Lefkoşa'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                            isPassive
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {isPassive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isPassive ? 'PASİF' : 'YAYINDA'}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                            title="İlanı Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deletingId === item.id}
                            className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-xl transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Edit Listing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-full uppercase">
                İLAN DÜZENLEME
              </span>
              <h3 className="text-xl font-black text-white mt-2">{editingItem.title}</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">İlan Başlığı</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Fiyat</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Para Birimi</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Şehir</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Görsel URL</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Açıklama</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
