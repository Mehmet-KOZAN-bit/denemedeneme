'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, db } from '../../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Store, 
  Building2, 
  MapPin, 
  Phone, 
  Save, 
  CheckCircle2, 
  ShieldCheck,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { ImageUploader } from '../../../components/ImageUploader';

const STORE_SECTORS = [
  { id: 'real_estate', label: 'Emlak & Gayrimenkul Acentesi' },
  { id: 'auto', label: 'Oto Galeri & Vasıta Ticareti' },
  { id: 'electronics', label: 'Teknoloji & Elektronik Mağazası' },
  { id: 'fashion', label: 'Giyim, Butik & Moda' },
  { id: 'home', label: 'Ev Eşyaları & Mobilya Mağazası' },
  { id: 'other', label: 'Diğer Kurumsal Hizmet & Ticaret' },
];

const CITIES = ['Lefkoşa', 'Girne', 'Gazimağusa', 'Güzelyurt', 'İskele', 'Lefke'];

export default function StoreSettingsPage() {
  const { user, profile } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('other');
  const [city, setCity] = useState('Lefkoşa');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setStoreName(profile.storeInfo?.storeName || profile.displayName || '');
    setStoreType(profile.storeInfo?.storeType || 'other');
    setCity(profile.storeInfo?.city || 'Lefkoşa');
    setAddress(profile.storeInfo?.address || '');
    setPhone(profile.storeInfo?.phone || '');
    setTaxId(profile.storeInfo?.taxId || '');
    setPhotoURL(profile.photoURL || '');
    setBio(profile.storeInfo?.bio || profile.bio || '');
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMsg(false);
    try {
      const now = new Date().toISOString();
      const updatedStoreInfo = {
        storeName: storeName.trim(),
        storeType,
        city,
        address: address.trim(),
        phone: phone.trim(),
        taxId: taxId.trim(),
        photoURL: photoURL.trim(),
        logoUrl: photoURL.trim(),
        storeLogo: photoURL.trim(),
        bio: bio.trim(),
      };

      const updatePayload = {
        displayName: storeName.trim(),
        photoURL: photoURL.trim(),
        photoUrl: photoURL.trim(),
        bio: bio.trim(),
        storeInfo: updatedStoreInfo,
        updatedAt: now,
      };

      await updateDoc(doc(db, 'users', user.uid), updatePayload);

      const targetId = profile?.targetStoreUid;
      if (targetId && targetId !== user.uid) {
        await updateDoc(doc(db, 'users', targetId), updatePayload).catch(() => {});
        await updateDoc(doc(db, 'store_applications', targetId), {
          storeName: storeName.trim(),
          photoURL: photoURL.trim(),
          logoUrl: photoURL.trim(),
          updatedAt: now,
        }).catch(() => {});
      }

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (e: any) {
      console.error('Error saving store profile:', e);
      alert('Kaydedilirken hata oluştu: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Mağaza Profili & Ayarları</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mobil uygulamada ve web üzerinde görünen kurumsal mağaza bilgilerinizi güncelleyin.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ONAYLI MAĞAZA</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Mağaza bilgileriniz başarıyla güncellendi! Mobil uygulamadaki profilinizde anında aktifleşti.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {/* Store Name & Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Mağaza Ticari Unvanı *</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              placeholder="Örn: Girne Auto Gallery"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Mağaza Sektörü *</label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {STORE_SECTORS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mağaza Logosu / Görseli (Bilgisayardan Yükleme + Supabase) */}
        <ImageUploader
          label="Mağaza Logosu / Amblemi Görseli"
          value={photoURL}
          onChange={(url) => setPhotoURL(url)}
          folder="store-logos"
        />

        {/* City & Phone */}
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
            <label className="text-xs font-bold text-slate-300">İletişim Telefonu *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+90 533 800 0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Hakkında & Mağaza Tanıtım Yazısı (Bio) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">Hakkında & Mağaza Tanıtım Yazısı</label>
            <span className="text-[10px] text-slate-500 font-medium">Boş bırakılırsa varsayılan kurumsal tanıtım metni görünür</span>
          </div>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Örn: 2010 yılından bu yana Lefkoşa'da hizmet veren kurumsal galeri/mağazayız. Kaliteli ve garantili ürünlerimiz için ilanlarımızı inceleyebilirsiniz."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Open Address */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Açık Adres (Harita & Konum Entegrasyonu İçin)</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Örn: Dereboyu Caddesi No: 42, Lefkoşa"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Kaydediliyor...' : 'Mağaza Bilgilerini Kaydet'}</span>
        </button>
      </form>
    </div>
  );
}
