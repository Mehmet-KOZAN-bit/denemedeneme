'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Sparkles, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Store, 
  Tag, 
  ChevronRight,
  Send,
  Star,
  Users,
  ShoppingBag,
  Zap,
  Globe,
  Lock,
  Check
} from 'lucide-react';
import { db } from '../../context/AuthContext';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Store Application Form State
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appCity, setAppCity] = useState('Lefkoşa');
  const [appSector, setAppSector] = useState('electronics');
  const [appNotes, setAppNotes] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Live Active Products
        const prodSnap = await getDocs(
          query(collection(db, 'products'), where('status', '==', 'active'), limit(12))
        );
        const prodList = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(prodList);

        // Fetch Live Verified Stores
        const userSnap = await getDocs(collection(db, 'users'));
        const storeList: any[] = [];
        userSnap.docs.forEach(d => {
          const data = d.data();
          if ((data.accountType === 'store' || data.isVerifiedStore === true || data.storeStatus === 'approved') && !data.targetStoreUid) {
            storeList.push({ id: d.id, ...data });
          }
        });
        setStores(storeList);
      } catch (e) {
        console.error('Error fetching landing data:', e);
      }
    }
    fetchData();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appPhone) return;
    setAppLoading(true);
    try {
      await addDoc(collection(db, 'store_applications'), {
        storeName: appName.trim(),
        phone: appPhone.trim(),
        city: appCity,
        sector: appSector,
        notes: appNotes.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setAppSubmitted(true);
      setTimeout(() => {
        setAppSubmitted(false);
        setShowApplyModal(false);
        setAppName('');
        setAppPhone('');
        setAppNotes('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting store application:', err);
      alert('Başvuru gönderilirken bir hata oluştu.');
    } finally {
      setAppLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory || p.categoryType === selectedCategory;
    const matchesSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 🌟 TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>AdaBazar Mobil Uygulaması Canlıda! KKTC'nin 1 Numaralı İlan & Kurumsal Mağaza Platformu</span>
        <a href="#download" className="underline hover:text-emerald-200 transition-colors ml-2 font-black">
          Hemen İndir →
        </a>
      </div>

      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/40">
              AB
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">AdaBazar</span>
              <span className="text-[10px] font-bold text-emerald-400 block -mt-1">KIBRIS MARKETPLACE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#hero" className="hover:text-emerald-400 transition-colors">Ana Sayfa</a>
            <a href="#products" className="hover:text-emerald-400 transition-colors">Canlı İlanlar</a>
            <a href="#stores" className="hover:text-emerald-400 transition-colors">Kurumsal Mağazalar</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Neden AdaBazar?</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApplyModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Mağaza Başvurusu</span>
            </button>

            <a
              href="/"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Kurumsal Giriş</span>
            </a>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-24 px-6 overflow-hidden">
        {/* Glow Ambient Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>KKTC'nin Doğrulanmış Yerel Pazaryeri Platformu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Kıbrıs'ta Al, Sat, Keşfet <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Tüm Ada Cebinde!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Emlak, vasıta, ikinci el eşyalar ve KKTC'nin seçkin kurumsal mağazaları AdaBazar'da buluşuyor.
              Aracısız, hızlı ve %100 doğrudan iletişim ile ilan verin veya hayalinizdeki ürünü bulun.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-900/50 flex items-center gap-2.5 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Uygulamayı Hemen İndir</span>
              </button>

              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 hover:scale-105"
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Kurumsal Mağaza Ol</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">10.000+</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Mobil İndirme</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">500+</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Aktif İlan</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">50+</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Onaylı Mağaza</p>
              </div>
            </div>
          </div>

          {/* Phone Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-72 sm:w-80 h-[560px] bg-slate-900 rounded-[48px] border-4 border-slate-800 shadow-2xl p-4 flex flex-col justify-between overflow-hidden group">
              {/* Notch */}
              <div className="w-32 h-5 bg-slate-950 rounded-full mx-auto mb-3 shrink-0" />
              
              {/* App Content Preview */}
              <div className="flex-1 bg-slate-950 rounded-3xl p-3 space-y-3 overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-black text-emerald-400">AdaBazar KKTC</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold">CANLI FEED</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 flex gap-2.5 items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">iPhone 14 Pro Max 256GB</p>
                      <p className="text-[10px] text-slate-400">Girne / KKTC</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5">₺32.500</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 flex gap-2.5 items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Dereboyu 2+1 Lüks Daire</p>
                      <p className="text-[10px] text-slate-400">Lefkoşa / KKTC</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5">£650 / ay</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-800/60 p-3 rounded-2xl text-center space-y-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-[11px] font-bold text-white">KOZAN Teknoloji</p>
                  <p className="text-[9px] text-emerald-400 font-bold">ONAYLI KURUMSAL MAĞAZA</p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ CANLI İLANLAR VİTRİNİ */}
      <section id="products" className="py-16 px-6 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">CANLI İLAN AKIŞI</span>
              <h2 className="text-3xl font-black text-white">Platformdaki Güncel İlanlar</h2>
            </div>

            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Tüm İlanlar' },
                { id: 'real_estate', label: 'Emlak' },
                { id: 'auto', label: 'Vasıta' },
                { id: 'electronics', label: 'Elektronik' },
                { id: 'fashion', label: 'Moda' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">Bu kategoride gösterilecek canlı ilan bulunuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all shadow-md flex flex-col justify-between">
                  <div className="aspect-square bg-slate-900 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full border border-slate-800">
                      {p.currency === 'GBP' ? '£' : p.currency === 'USD' ? '$' : '₺'}{p.price}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">{p.title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{p.city || 'KKTC'} {p.district ? `/ ${p.district}` : ''}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-full bg-slate-900 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Uygulamada İncele</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🏢 ONNAYLI KURUMSAL MAĞAZALAR */}
      <section id="stores" className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">GÜVENİLİR İŞLETMELER</span>
            <h2 className="text-3xl font-black text-white">KKTC Onaylı Kurumsal Mağazalar</h2>
            <p className="text-xs text-slate-400">AdaBazar doğrulama sisteminden geçmiş resmi işletmeler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map(s => {
              const name = s.storeInfo?.storeName || s.displayName || 'Kurumsal Mağaza';
              const logo = s.photoURL || s.storeInfo?.storeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F766E&color=fff&size=200`;
              const city = s.storeInfo?.city || s.city || 'KKTC';
              const phone = s.storeInfo?.phone || s.phone || '';

              return (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={logo} alt={name} className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full inline-block mt-1">
                        ONAYLI MAĞAZA
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{city} / KKTC</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 NEDEN ADABAZAR? (FEATURES) */}
      <section id="features" className="py-16 px-6 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">NEDEN BİZ?</span>
            <h2 className="text-3xl font-black text-white">AdaBazar Avantajları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">30 Saniyede Ücretsiz İlan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fotoğrafını çek, fiyatını belirle ve ilanını saniyeler içinde binlerce alıcıya ulaştır.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Doğrulanmış Mağazalar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                KKTC genelindeki güvenilir kurumsal işletmelerden güvenle alışveriş yapın.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Doğrudan İletişim</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                WhatsApp veya telefon ile aracısız, komisyonsuz doğrudan alıcı ve satıcıyla görüşün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📲 APP DOWNLOAD BANNER */}
      <section id="download" className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/30 rounded-[40px] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-lg">
            AB
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Tüm Ada Cebinde! Hemen İndir</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            AdaBazar mobil uygulamasını iOS veya Android cihazınıza indirerek ilanları inceleyin veya hemen ilan yayınlayın.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-white text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>iOS App Store'dan İndir</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Google Play'den İndir</span>
            </button>
          </div>
        </div>
      </section>

      {/* 📜 FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              AB
            </div>
            <span className="font-bold text-white text-sm">AdaBazar KKTC</span>
          </div>

          <p>© 2026 AdaBazar C2C & B2B İlan Platformu. Tüm hakları saklıdır.</p>

          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-white transition-colors">Kurumsal Giriş</a>
            <button onClick={() => setShowApplyModal(true)} className="hover:text-white transition-colors">Mağaza Başvurusu</button>
          </div>
        </div>
      </footer>

      {/* 📱 QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Uygulamayı İndirin</h3>
            <p className="text-xs text-slate-400">
              Telefonunuzun kamerasını QR koda tutarak AdaBazar uygulamasını hemen yükleyebilirsiniz.
            </p>
            <div className="w-48 h-48 bg-white rounded-2xl mx-auto p-3 flex items-center justify-center shadow-inner">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://denemedeneme.vercel.app/landing"
                alt="AdaBazar QR"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* 🏢 STORE APPLICATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Kurumsal Mağaza Başvurusu</h3>
                <p className="text-xs text-slate-400">İşletmenizi AdaBazar'a dahil edin</p>
              </div>
            </div>

            {appSubmitted ? (
              <div className="p-6 bg-emerald-950/80 border border-emerald-700 rounded-2xl text-center space-y-2 text-emerald-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <p className="font-bold text-sm">Başvurunuz Alındı!</p>
                <p className="text-xs text-slate-300">Ekibimiz en kısa sürede sizinle iletişime geçip web giriş bilgilerinizi tanımlayacaktır.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">İşletme / Mağaza Adı *</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                    placeholder="Örn: Lefkoşa Galeri & Oto"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Şehir *</label>
                    <select
                      value={appCity}
                      onChange={(e) => setAppCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {['Lefkoşa', 'Girne', 'Gazimağusa', 'Güzelyurt', 'İskele', 'Lefke'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Sektör *</label>
                    <select
                      value={appSector}
                      onChange={(e) => setAppSector(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="real_estate">Emlak & Gayrimenkul</option>
                      <option value="auto">Oto Galeri & Vasıta</option>
                      <option value="electronics">Teknoloji & Elektronik</option>
                      <option value="fashion">Giyim & Moda</option>
                      <option value="other">Diğer Hizmet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">İletişim Telefonu *</label>
                  <input
                    type="text"
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    required
                    placeholder="+90 533 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Ek Notlar (İsteğe Bağlı)</label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="İlan sayınız veya talebiniz..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={appLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{appLoading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
