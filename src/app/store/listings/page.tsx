'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, db } from '../../../context/AuthContext';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
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
  const { user } = useAuth();
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

    const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setListings(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

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
    setEditImageUrl(item.images?.[0] || item.img || '');
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
      const updatedImg = editImageUrl.trim() || editingItem.images?.[0] || editingItem.img;

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
      console.error('Error updating listing:', e);
      alert('Güncellenirken hata oluştu: ' + e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const filtered = listings.filter(item => {
    if (!search.trim()) return true;
    const qStr = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(qStr) ||
      item.category?.toLowerCase().includes(qStr) ||
      item.city?.toLowerCase().includes(qStr)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Mağaza İlanlarım</h1>
          <p className="text-xs text-slate-400 mt-1">
            Yayındaki ve geçmiş mağaza ürünlerinizi bu panelden yönetebilir veya düzenleyebilirsiniz.
          </p>
        </div>

        <Link
          href="/store/add-listing"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni İlan Ekle</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İlan başlığı, kategori veya şehir ara..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-xs text-slate-400 animate-pulse">İlanlarınız yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            {search ? 'Aramaya uygun ilan bulunamadı' : 'Henüz hiç ilan eklemediniz'}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hemen yeni bir ilan paylaşarak potansiyel müşterilere ulaşabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Ürün / İlan</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Fiyat</th>
                  <th className="p-4">Konum</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || item.img || 'https://via.placeholder.com/150'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white max-w-xs truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">
                      {item.category || 'Genel'}
                    </td>
                    <td className="p-4 font-black text-emerald-400">
                      {item.price ? `₺${Number(item.price).toLocaleString('tr-TR')}` : 'Fiyat Yok'}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.city || 'Kıbrıs'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          item.status === 'passive'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {item.status === 'passive' ? 'PASİF' : 'YAYINDA'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                          title="İlanı Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title={item.status === 'passive' ? 'İlanı Yayına Al' : 'İlanı Yayından Kaldır'}
                        >
                          {item.status === 'passive' ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                          title="İlanı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
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
              <h3 className="text-xl font-black text-white mt-2">Mağaza İlanını Güncelle</h3>
              <p className="text-xs text-slate-400 mt-1">İlan bilgileriniz güncellendiğinde hem web hem mobil uygulamada anında yansır.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">İlan Başlığı *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Fiyat & Para Birimi *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="TRY">₺ (TRY)</option>
                      <option value="GBP">£ (GBP)</option>
                      <option value="USD">$ (USD)</option>
                      <option value="EUR">€ (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Şehir</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Mahalle / Bölge</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Görsel URL</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Açıklama</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  İptal
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
