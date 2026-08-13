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
  Check,
  User,
  LogOut,
  Camera,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';

export default function LandingPage() {
  const { user, profile, loginWithEmail, logout } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Phone Mockup Active Slide State (0..4)
  const [phoneSlide, setPhoneSlide] = useState(0);

  // Portal Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Store Application Form State
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appCity, setAppCity] = useState('Lefkoşa');
  const [appSector, setAppSector] = useState('electronics');
  const [appNotes, setAppNotes] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  const isStoreVendor = 
    profile?.accountType === 'store' || 
    profile?.storeStatus === 'approved' || 
    profile?.role === 'store' ||
    profile?.isVerifiedStore === true;

  // Phone Carousel Auto-play (every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setPhoneSlide((prev) => (prev + 1) % 5);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

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

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginSubmitting(true);
    setLoginError('');
    try {
      await loginWithEmail(loginEmail, loginPassword);
      setShowLoginModal(false);
    } catch (err: any) {
      setLoginError(err?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoginSubmitting(false);
    }
  };

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

  const slideScreens = [
    { id: 'home', image: '/app-screens/home.png', title: 'Ana Sayfa Vitrini', desc: 'Canlı İlan Akışı' },
    { id: 'profile', image: '/app-screens/profile.png', title: 'İlan & Satıcı Profili', desc: 'Aracısız İletişim' },
    { id: 'verify', image: '/app-screens/verify.png', title: 'Onaylı Mağazalar', desc: 'Doğrulanmış İşletmeler' },
    { id: 'addlist', image: '/app-screens/addlist.png', title: 'Hızlı İlan Verme', desc: '30 Saniyede Foto Paylaş' },
    { id: 'message', image: '/app-screens/message.png', title: 'Canlı Mesajlaşma', desc: 'Anlık Chat' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 🌟 TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-4 h-4 animate-pulse text-emerald-200" />
        <span>AdaBazar Mobil Uygulaması Canlıda! KKTC'nin 1 Numaralı İlan & Kurumsal Mağaza Platformu</span>
        <a href="#download" className="underline hover:text-emerald-200 transition-colors ml-2 font-black">
          Hemen İndir →
        </a>
      </div>

      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yeniikon.png" alt="AdaBazar Logo" className="w-10 h-10 rounded-2xl object-contain shadow-md" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block">AdaBazar</span>
              <span className="text-[10px] font-bold text-emerald-600 block -mt-1 tracking-wider uppercase">KIBRIS MARKETPLACE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#hero" className="hover:text-emerald-600 transition-colors">Ana Sayfa</a>
            <a href="#products" className="hover:text-emerald-600 transition-colors">Canlı İlanlar</a>
            <a href="#stores" className="hover:text-emerald-600 transition-colors">Kurumsal Mağazalar</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Neden AdaBazar?</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApplyModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-emerald-600/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <span>Mağaza Başvurusu</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <a
                  href={isStoreVendor ? '/store/dashboard' : '/dashboard'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Portala Git ({profile?.displayName || 'Giriş Yapıldı'}) →</span>
                </a>
                <button
                  onClick={logout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Kurumsal Giriş</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-24 px-6 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200/60">
        {/* Glow Ambient Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KKTC'nin Doğrulanmış Yerel Pazaryeri Platformu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Kıbrıs'ta Al, Sat, Keşfet <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Tüm Ada Cebinde!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
              Emlak, vasıta, ikinci el eşyalar ve KKTC'nin seçkin kurumsal mağazaları AdaBazar'da buluşuyor.
              Aracısız, hızlı ve %100 doğrudan iletişim ile ilan verin veya hayalinizdeki ürünü bulun.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-600/25 flex items-center gap-2.5 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Uygulamayı Hemen İndir</span>
              </button>

              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-sm flex items-center gap-2 hover:scale-105"
              >
                <span>Kurumsal Mağaza Ol</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">10.000+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Mobil İndirme</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">500+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Aktif İlan</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">50+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Onaylı Mağaza</p>
              </div>
            </div>
          </div>

          {/* 📱 REAL APP SCREENSHOTS CAROUSEL */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-80 sm:w-96 md:w-[410px] h-[600px] sm:h-[650px]">
              {slideScreens.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    phoneSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>
              ))}
            </div>

            {/* 🎯 CAROUSEL CONTROLLER DOTS */}
            <div className="flex items-center gap-2 mt-5">
              {slideScreens.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPhoneSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    phoneSlide === idx ? 'w-8 bg-emerald-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={s.title}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ CANLI İLANLAR VİTRİNİ */}
      <section id="products" className="py-16 px-6 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">CANLI İLAN AKIŞI</span>
              <h2 className="text-3xl font-black text-slate-900">Platformdaki Güncel İlanlar</h2>
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Bu kategoride gösterilecek canlı ilan bulunuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-black px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      {p.currency === 'GBP' ? '£' : p.currency === 'USD' ? '$' : '₺'}{p.price}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{p.title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p.city || 'KKTC'} {p.district ? `/ ${p.district}` : ''}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-full bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-600/30 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-2"
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

      {/* 🏢 ONAYLI KURUMSAL MAĞAZALAR */}
      <section id="stores" className="py-16 px-6 bg-slate-50/60 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">GÜVENİLİR İŞLETMELER</span>
            <h2 className="text-3xl font-black text-slate-900">KKTC Onaylı Kurumsal Mağazalar</h2>
            <p className="text-xs text-slate-500">AdaBazar doğrulama sisteminden geçmiş resmi işletmeler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map(s => {
              const name = s.storeInfo?.storeName || s.displayName || 'Kurumsal Mağaza';
              const logo = s.photoURL || s.storeInfo?.storeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F766E&color=fff&size=200`;
              const city = s.storeInfo?.city || s.city || 'KKTC';
              const phone = s.storeInfo?.phone || s.phone || '';

              return (
                <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={logo} alt={name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-200">
                        ONAYLI MAĞAZA
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{city} / KKTC</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
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
      <section id="features" className="py-16 px-6 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">NEDEN BİZ?</span>
            <h2 className="text-3xl font-black text-slate-900">AdaBazar Avantajları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">30 Saniyede Ücretsiz İlan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fotoğrafını çek, fiyatını belirle ve ilanını saniyeler içinde binlerce alıcıya ulaştır.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Doğrulanmış Mağazalar</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                KKTC genelindeki güvenilir kurumsal işletmelerden güvenle alışveriş yapın.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Doğrudan İletişim</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                WhatsApp veya telefon ile aracısız, komisyonsuz doğrudan alıcı ve satıcıyla görüşün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📲 APP DOWNLOAD BANNER */}
      <section id="download" className="py-20 px-6 relative overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-[40px] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative">
          <img src="/yeniikon.png" alt="AdaBazar Logo" className="w-16 h-16 rounded-3xl object-contain mx-auto shadow-lg bg-white p-1" />
          <h2 className="text-3xl sm:text-4xl font-black text-white">Tüm Ada Cebinde! Hemen İndir</h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
            AdaBazar mobil uygulamasını iOS veya Android cihazınıza indirerek ilanları inceleyin veya hemen ilan yayınlayın.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-white text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <span>iOS App Store'dan İndir</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-colors border border-emerald-400/30"
            >
              <Download className="w-5 h-5" />
              <span>Google Play'den İndir</span>
            </button>
          </div>
        </div>
      </section>

      {/* 📜 FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/yeniikon.png" alt="AdaBazar Logo" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-slate-900 text-sm">AdaBazar KKTC</span>
          </div>

          <p>© 2026 AdaBazar C2C & B2B İlan Platformu. Tüm hakları saklıdır.</p>

          <div className="flex items-center gap-6">
            <button onClick={() => setShowLoginModal(true)} className="hover:text-emerald-600 font-bold transition-colors">Kurumsal Giriş</button>
            <button onClick={() => setShowApplyModal(true)} className="hover:text-emerald-600 font-bold transition-colors">Mağaza Başvurusu</button>
          </div>
        </div>
      </footer>

      {/* 🔐 PORTAL LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Kurumsal Portal Girişi</h3>
              <p className="text-xs text-slate-500">Mağaza veya Yönetim panelinize erişin</p>
            </div>

            <form onSubmit={handlePortalLogin} className="space-y-4 text-left">
              {loginError && <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">{loginError}</p>}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">E-posta Adresi</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="magaza@adabazaar.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Şifre</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <span>{loginSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📱 QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Uygulamayı İndirin</h3>
            <p className="text-xs text-slate-500">
              Telefonunuzun kamerasını QR koda tutarak AdaBazar uygulamasını hemen yükleyebilirsiniz.
            </p>
            <div className="w-48 h-48 bg-slate-50 border border-slate-200 rounded-2xl mx-auto p-3 flex items-center justify-center shadow-inner">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://denemedeneme.vercel.app"
                alt="AdaBazar QR"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* 🏢 STORE APPLICATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Kurumsal Mağaza Başvurusu</h3>
                <p className="text-xs text-slate-500">İşletmenizi AdaBazar'a dahil edin</p>
              </div>
            </div>

            {appSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <p className="font-bold text-sm">Başvurunuz Alındı!</p>
                <p className="text-xs text-slate-600">Ekibimiz en kısa sürede sizinle iletişime geçip web giriş bilgilerinizi tanımlayacaktır.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">İşletme / Mağaza Adı *</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                    placeholder="Örn: Lefkoşa Galeri & Oto"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Şehir *</label>
                    <select
                      value={appCity}
                      onChange={(e) => setAppCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      {['Lefkoşa', 'Girne', 'Gazimağusa', 'Güzelyurt', 'İskele', 'Lefke'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Sektör *</label>
                    <select
                      value={appSector}
                      onChange={(e) => setAppSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
                  <label className="text-xs font-bold text-slate-700">İletişim Telefonu *</label>
                  <input
                    type="text"
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    required
                    placeholder="+90 533 000 0000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ek Notlar (İsteğe Bağlı)</label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="İlan sayınız veya talebiniz..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={appLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
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
