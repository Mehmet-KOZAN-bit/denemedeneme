'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, db } from '../../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { 
  PlusCircle, 
  Building2, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowLeft,
  DollarSign,
  MapPin,
  Tag
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

const SAMPLE_IMAGES: Record<string, string[]> = {
  'Vasıta & Araçlar': [
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000',
  ],
  'Emlak & Gayrimenkul': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
  ],
  'Elektronik & Teknoloji': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=1000',
  ],
  default: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000',
  ],
};

export default function StoreAddListingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const storeName = profile?.storeInfo?.storeName || profile?.displayName || 'Kurumsal Mağaza';
  const defaultCity = profile?.storeInfo?.city || 'Lefkoşa';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState(defaultCity);
  const [district, setDistrict] = useState('');
  const [condition, setCondition] = useState('used');
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || title.length < 5) {
      alert('Lütfen en az 5 karakter uzunluğunda bir başlık girin.');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert('Lütfen geçerli bir fiyat girin.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedImg = imageUrl.trim() || (SAMPLE_IMAGES[category] || SAMPLE_IMAGES.default)[0];
      const now = new Date().toISOString();

      await addDoc(collection(db, 'products'), {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency,
        category,
        subCategory: 'Genel',
        condition,
        city,
        district: district.trim() || 'Merkez',
        images: [selectedImg],
        img: selectedImg,
        imageUrl: selectedImg,
        sellerId: profile?.targetStoreUid || user.uid,
        seller: {
          id: profile?.targetStoreUid || user.uid,
          name: storeName,
          email: user.email,
          accountType: 'store',
          storeStatus: 'approved',
          isVerifiedStore: true,
        },
        sellerAccountType: 'store',
        isVerifiedStore: true,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });

      alert('Mağaza ilanınız başarıyla yayınlandı!');
      router.push('/store/listings');
    } catch (e: any) {
      console.error('Error creating listing:', e);
      alert('İlan eklenirken hata oluştu: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back & Page Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/store/listings"
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Yeni Mağaza İlanı Paylaş</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ürün veya hizmetinizi onaylı kurumsal mağaza kimliğinizle saniyeler içinde yayınlayın.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">İlan Başlığı *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Örn: 2022 Model Mercedes-Benz C200 AMG Galeri Çıkışlı"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category & Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Sektör / Kategori *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Fiyat & Para Birimi *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-28 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-bold"
              >
                <option value="TRY">₺ (TRY)</option>
                <option value="GBP">£ (GBP)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* City & District */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Şehir *</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Mahalle / Bölge</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Örn: Dereboyu, Alsancak, Salamis"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Ürün / Mağaza Fotoğrafı URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... (Boş bırakılırsa sektöre özel yüksek çözünürlüklü kapak atanır)"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Açıklama Detayları</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mağaza ürününüzün öne çıkan özelliklerini detaylıca yazın..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{submitting ? 'Yayınlanıyor...' : 'İlanı Kurumsal Mağaza Adına Yayınla'}</span>
        </button>
      </form>
    </div>
  );
}
