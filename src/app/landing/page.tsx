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

// 🌐 3-LANGUAGE I18N DICTIONARY (TR, EN, RU)
const TRANSLATIONS = {
  tr: {
    announcement: "AdaBazar Mobil Uygulaması Canlıda! KKTC'nin 1 Numaralı İlan & Kurumsal Mağaza Platformu",
    downloadNow: "Hemen İndir →",
    subTitle: "KIBRIS MARKETPLACE",
    navHome: "Ana Sayfa",
    navProducts: "Canlı İlanlar",
    navStores: "Kurumsal Mağazalar",
    navWhyUs: "Neden AdaBazar?",
    storeApply: "Mağaza Başvurusu",
    corporateLogin: "Kurumsal Giriş",
    goToPortal: "Portala Git",
    logout: "Çıkış",
    badgeVerified: "KKTC'nin Doğrulanmış Yerel Pazaryeri Platformu",
    heroTitleLine1: "Kıbrıs'ta Al, Sat, Keşfet",
    heroTitleLine2: "Tüm Ada Cebinde!",
    heroDesc: "Emlak, vasıta, ikinci el eşyalar ve KKTC'nin seçkin kurumsal mağazaları AdaBazar'da buluşuyor. Aracısız, hızlı ve %100 doğrudan iletişim ile ilan verin veya hayalinizdeki ürünü bulun.",
    btnDownloadApp: "Uygulamayı Hemen İndir",
    btnBecomeStore: "Kurumsal Mağaza Ol",
    statDownloads: "Mobil İndirme",
    statListings: "Aktif İlan",
    statStores: "Onaylı Mağaza",
    liveFeedTag: "CANLI İLAN AKIŞI",
    liveFeedTitle: "Platformdaki Güncel İlanlar",
    catAll: "Tüm İlanlar",
    catRealEstate: "Emlak",
    catAuto: "Vasıta",
    catElectronics: "Elektronik",
    catFashion: "Moda",
    noProducts: "Bu kategoride gösterilecek canlı ilan bulunmuyor.",
    inspectInApp: "İncele",
    trustedBusinessesTag: "GÜVENİLİR İŞLETMELER",
    storesTitle: "KKTC Onaylı Kurumsal Mağazalar",
    storesSub: "AdaBazar doğrulama sisteminden geçmiş resmi işletmeler",
    verifiedBadge: "ONAYLI MAĞAZA",
    whyUsTag: "NEDEN BİZ?",
    whyUsTitle: "AdaBazar Avantajları",
    feat1Title: "30 Saniyede Ücretsiz İlan",
    feat1Desc: "Fotoğrafını çek, fiyatını belirle ve ilanını saniyeler içinde binlerce alıcıya ulaştır.",
    feat2Title: "Doğrulanmış Mağazalar",
    feat2Desc: "KKTC genelindeki güvenilir kurumsal işletmelerden güvenle alışveriş yapın.",
    feat3Title: "Doğrudan İletişim",
    feat3Desc: "WhatsApp veya telefon ile aracısız, komisyonsuz doğrudan alıcı ve satıcıyla görüşün.",
    bannerTitle: "Tüm Ada Cebinde! Hemen İndir",
    bannerDesc: "AdaBazar mobil uygulamasını iOS veya Android cihazınıza indirerek ilanları inceleyin veya hemen ilan yayınlayın.",
    downloadAppStore: "iOS App Store'dan İndir",
    downloadPlayStore: "Google Play'den İndir",
    footerRights: "© 2026 AdaBazar C2C & B2B İlan Platformu. Tüm hakları saklıdır.",
    modalLoginTitle: "Kurumsal Portal Girişi",
    modalLoginSub: "Mağaza veya Yönetim panelinize erişin",
    emailLabel: "E-posta Adresi",
    passLabel: "Şifre",
    btnSigningIn: "Giriş Yapılıyor...",
    btnSignIn: "Giriş Yap",
    modalQrTitle: "Uygulamayı İndirin",
    modalQrSub: "Telefonunuzun kamerasını QR koda tutarak AdaBazar uygulamasını hemen yükleyebilirsiniz.",
    btnClose: "Kapat",
    modalApplyTitle: "Kurumsal Mağaza Başvurusu",
    modalApplySub: "İşletmenizi AdaBazar'a dahil edin",
    modalApplySuccessTitle: "Başvurunuz Alındı!",
    modalApplySuccessSub: "Ekibimiz en kısa sürede sizinle iletişime geçip web giriş bilgilerinizi tanımlayacaktır.",
    formStoreName: "İşletme / Mağaza Adı *",
    formCity: "Şehir *",
    formSector: "Sektör *",
    formPhone: "İletişim Telefonu *",
    formNotes: "Ek Notlar (İsteğe Bağlı)",
    btnSubmitting: "Gönderiliyor...",
    btnSubmitApply: "Başvuruyu Gönder",
    sectorRealEstate: "Emlak & Gayrimenkul",
    sectorAuto: "Oto Galeri & Vasıta",
    sectorElectronics: "Teknoloji & Elektronik",
    sectorFashion: "Giyim & Moda",
    sectorOther: "Diğer Hizmet"
  },
  en: {
    announcement: "AdaBazar Mobile App is Live! TRNC's #1 Marketplace & Store Platform",
    downloadNow: "Download Now →",
    subTitle: "CYPRUS MARKETPLACE",
    navHome: "Home",
    navProducts: "Live Listings",
    navStores: "Verified Stores",
    navWhyUs: "Why AdaBazar?",
    storeApply: "Store Application",
    corporateLogin: "Corporate Login",
    goToPortal: "Go to Portal",
    logout: "Logout",
    badgeVerified: "TRNC's Verified Local Marketplace Platform",
    heroTitleLine1: "Buy, Sell & Discover in Cyprus",
    heroTitleLine2: "The Whole Island in Your Pocket!",
    heroDesc: "Real estate, vehicles, secondhand items, and top verified stores in Northern Cyprus meet at AdaBazar. Post ads or find your dream item with 100% direct communication.",
    btnDownloadApp: "Download Mobile App Now",
    btnBecomeStore: "Become a Verified Store",
    statDownloads: "Mobile Downloads",
    statListings: "Active Listings",
    statStores: "Verified Stores",
    liveFeedTag: "LIVE FEED",
    liveFeedTitle: "Recent Listings on Platform",
    catAll: "All Listings",
    catRealEstate: "Real Estate",
    catAuto: "Vehicles",
    catElectronics: "Electronics",
    catFashion: "Fashion",
    noProducts: "No active listings found in this category.",
    inspectInApp: "View Details",
    trustedBusinessesTag: "TRUSTED BUSINESSES",
    storesTitle: "TRNC Verified Corporate Stores",
    storesSub: "Official verified stores approved by AdaBazar verification system",
    verifiedBadge: "VERIFIED STORE",
    whyUsTag: "WHY CHOOSE US?",
    whyUsTitle: "AdaBazar Advantages",
    feat1Title: "Free Listing in 30 Seconds",
    feat1Desc: "Snap photos, set price, and publish your ad to thousands of buyers in seconds.",
    feat2Title: "Verified Businesses",
    feat2Desc: "Shop with confidence from verified corporate stores across Northern Cyprus.",
    feat3Title: "Direct Communication",
    feat3Desc: "Connect directly with buyers and sellers via WhatsApp or phone with zero commission.",
    bannerTitle: "The Island in Your Pocket! Download Now",
    bannerDesc: "Download AdaBazar mobile app for iOS or Android to browse listings or publish your ads instantly.",
    downloadAppStore: "Download on App Store",
    downloadPlayStore: "Get it on Google Play",
    footerRights: "© 2026 AdaBazar C2C & B2B Marketplace Platform. All rights reserved.",
    modalLoginTitle: "Corporate Portal Login",
    modalLoginSub: "Access your Store or Management dashboard",
    emailLabel: "Email Address",
    passLabel: "Password",
    btnSigningIn: "Logging in...",
    btnSignIn: "Sign In",
    modalQrTitle: "Download the App",
    modalQrSub: "Scan the QR code with your phone camera to instantly download AdaBazar app.",
    btnClose: "Close",
    modalApplyTitle: "Corporate Store Application",
    modalApplySub: "Register your business on AdaBazar",
    modalApplySuccessTitle: "Application Received!",
    modalApplySuccessSub: "Our team will contact you shortly to assign your store login credentials.",
    formStoreName: "Business / Store Name *",
    formCity: "City *",
    formSector: "Sector *",
    formPhone: "Contact Phone *",
    formNotes: "Additional Notes (Optional)",
    btnSubmitting: "Submitting...",
    btnSubmitApply: "Submit Application",
    sectorRealEstate: "Real Estate",
    sectorAuto: "Auto & Vehicles",
    sectorElectronics: "Tech & Electronics",
    sectorFashion: "Fashion & Clothing",
    sectorOther: "Other Services"
  },
  ru: {
    announcement: "Мобильное приложение AdaBazar запущено! Платформа №1 на ТРСК",
    downloadNow: "Скачать сейчас →",
    subTitle: "КИПРСКИЙ МАРКЕТПЛЕЙС",
    navHome: "Главная",
    navProducts: "Объявления",
    navStores: "Магазины",
    navWhyUs: "Почему мы?",
    storeApply: "Заявка магазина",
    corporateLogin: "Вход для бизнеса",
    goToPortal: "В портал",
    logout: "Выйти",
    badgeVerified: "Проверенная локальная платформа Северного Кипра",
    heroTitleLine1: "Покупайте и продавайте на Кипре",
    heroTitleLine2: "Весь остров в вашем кармане!",
    heroDesc: "Недвижимость, авто, б/у товары и лучшие проверенные магазины Северного Кипра на AdaBazar. Размещайте объявления и общайтесь напрямую без комиссий.",
    btnDownloadApp: "Скачать приложение",
    btnBecomeStore: "Стать магазином",
    statDownloads: "Скачиваний",
    statListings: "Активных объявлений",
    statStores: "Проверенных магазинов",
    liveFeedTag: "ПРЯМОЙ ЭФИР",
    liveFeedTitle: "Актуальные объявления",
    catAll: "Все",
    catRealEstate: "Недвижимость",
    catAuto: "Авто",
    catElectronics: "Электроника",
    catFashion: "Мода",
    noProducts: "В этой категории пока нет объявлений.",
    inspectInApp: "Подробнее",
    trustedBusinessesTag: "ПРОВЕРЕННЫЙ БИЗНЕС",
    storesTitle: "Проверенные магазины ТРСК",
    storesSub: "Официальные компании, прошедшие верификацию AdaBazar",
    verifiedBadge: "ПРОВЕРЕННЫЙ МАГАЗИН",
    whyUsTag: "ПОЧЕМУ МЫ?",
    whyUsTitle: "Преимущества AdaBazar",
    feat1Title: "Бесплатное объявление за 30 сек",
    feat1Desc: "Сделайте фото, укажите цену и опубликуйте объявление за считанные секунды.",
    feat2Title: "Проверенные компании",
    feat2Desc: "Покупайте с уверенностью у официальных магазинов по всему Северному Кипру.",
    feat3Title: "Прямая связь",
    feat3Desc: "Общайтесь с продавцами напрямую в WhatsApp или по телефону без посредников.",
    bannerTitle: "Весь остров в вашем кармане! Скачайте сейчас",
    bannerDesc: "Загрузите приложение AdaBazar для iOS или Android, чтобы просматривать объявления или продавать свои товары.",
    downloadAppStore: "Скачать в App Store",
    downloadPlayStore: "Скачать в Google Play",
    footerRights: "© 2026 Маркетплейс AdaBazar C2C & B2B. Все права защищены.",
    modalLoginTitle: "Вход в бизнес-портал",
    modalLoginSub: "Доступ к панели управления магазина",
    emailLabel: "Электронная почта",
    passLabel: "Пароль",
    btnSigningIn: "Вход...",
    btnSignIn: "Войти",
    modalQrTitle: "Скачать приложение",
    modalQrSub: "Отсканируйте QR-код камерой телефона, чтобы установить приложение AdaBazar.",
    btnClose: "Закрыть",
    modalApplyTitle: "Заявка для магазинов",
    modalApplySub: "Зарегистрируйте свой бизнес на AdaBazar",
    modalApplySuccessTitle: "Заявка принята!",
    modalApplySuccessSub: "Наша команда свяжется с вами в ближайшее время для предоставления доступа.",
    formStoreName: "Название компании / магазина *",
    formCity: "Город *",
    formSector: "Сфера деятельности *",
    formPhone: "Контактный телефон *",
    formNotes: "Дополнительные примечания",
    btnSubmitting: "Отправка...",
    btnSubmitApply: "Отправить заявку",
    sectorRealEstate: "Недвижимость",
    sectorAuto: "Автомобили",
    sectorElectronics: "Электроника и техника",
    sectorFashion: "Одежда и мода",
    sectorOther: "Другие услуги"
  }
};

export default function LandingPage() {
  const { user, profile, loginWithEmail, logout } = useAuth();

  // Language state (tr | en | ru)
  const [lang, setLang] = useState<'tr' | 'en' | 'ru'>('tr');
  const t = TRANSLATIONS[lang];

  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Live Active Products
        const prodSnap = await getDocs(
          query(collection(db, 'products'), where('status', '==', 'active'), limit(18))
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 🌟 TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-4 h-4 animate-pulse text-emerald-200" />
        <span>{t.announcement}</span>
        <a href="#download" className="underline hover:text-emerald-200 transition-colors ml-2 font-black">
          {t.downloadNow}
        </a>
      </div>

      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yeniikon.png" alt="AdaBazar Logo" className="w-10 h-10 rounded-2xl object-contain shadow-md" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block">AdaBazar</span>
              <span className="text-[10px] font-bold text-emerald-600 block -mt-1 tracking-wider uppercase">{t.subTitle}</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#hero" className="hover:text-emerald-600 transition-colors">{t.navHome}</a>
            <a href="#products" className="hover:text-emerald-600 transition-colors">{t.navProducts}</a>
            <a href="#stores" className="hover:text-emerald-600 transition-colors">{t.navStores}</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">{t.navWhyUs}</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* 🌐 LANGUAGE SELECTOR (TR | EN | RU) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setLang('tr')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'tr' ? 'bg-white text-emerald-700 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                TR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-white text-emerald-700 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ru')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'ru' ? 'bg-white text-emerald-700 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                RU
              </button>
            </div>

            <button
              onClick={() => setShowApplyModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-emerald-600/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <span>{t.storeApply}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <a
                  href={isStoreVendor ? '/store/dashboard' : '/dashboard'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>{t.goToPortal} ({profile?.displayName || 'Active'}) →</span>
                </a>
                <button
                  onClick={logout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition-colors"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>{t.corporateLogin}</span>
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
              <span>{t.badgeVerified}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              {t.heroTitleLine1} <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                {t.heroTitleLine2}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
              {t.heroDesc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-600/25 flex items-center gap-2.5 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>{t.btnDownloadApp}</span>
              </button>

              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-sm flex items-center gap-2 hover:scale-105"
              >
                <span>{t.btnBecomeStore}</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">10.000+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{t.statDownloads}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">500+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{t.statListings}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">50+</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{t.statStores}</p>
              </div>
            </div>
          </div>

          {/* 🖼️ SINGLE HERO IMAGE FROM github-resim/2.png - OPTIMIZED SIZE */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <img
              src="/hero-banner.png"
              alt="AdaBazar Mobil Uygulaması"
              className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] max-h-[490px] h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 🛍️ CANLI İLANLAR VİTRİNİ */}
      <section id="products" className="py-16 px-6 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">{t.liveFeedTag}</span>
              <h2 className="text-3xl font-black text-slate-900">{t.liveFeedTitle}</h2>
            </div>

            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: t.catAll },
                { id: 'real_estate', label: t.catRealEstate },
                { id: 'auto', label: t.catAuto },
                { id: 'electronics', label: t.catElectronics },
                { id: 'fashion', label: t.catFashion },
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

          {/* Products Grid - 6 Column Grid on Desktop */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">{t.noProducts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md text-emerald-700 text-[11px] font-black px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                      {p.currency === 'GBP' ? '£' : p.currency === 'USD' ? '$' : '₺'}{p.price}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">{p.title}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{p.city || 'KKTC'} {p.district ? `/ ${p.district}` : ''}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-full bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-600/30 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1 mt-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{t.inspectInApp}</span>
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
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">{t.trustedBusinessesTag}</span>
            <h2 className="text-3xl font-black text-slate-900">{t.storesTitle}</h2>
            <p className="text-xs text-slate-500">{t.storesSub}</p>
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
                        {t.verifiedBadge}
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
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">{t.whyUsTag}</span>
            <h2 className="text-3xl font-black text-slate-900">{t.whyUsTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.feat1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.feat1Desc}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.feat2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.feat2Desc}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.feat3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.feat3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📲 APP DOWNLOAD BANNER */}
      <section id="download" className="py-20 px-6 relative overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-[40px] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative">
          <img src="/yeniikon.png" alt="AdaBazar Logo" className="w-16 h-16 rounded-3xl object-contain mx-auto shadow-lg bg-white p-1" />
          <h2 className="text-3xl sm:text-4xl font-black text-white">{t.bannerTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
            {t.bannerDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-white text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <span>{t.downloadAppStore}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-colors border border-emerald-400/30"
            >
              <Download className="w-5 h-5" />
              <span>{t.downloadPlayStore}</span>
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

          <p>{t.footerRights}</p>

          <div className="flex items-center gap-6">
            <button onClick={() => setShowLoginModal(true)} className="hover:text-emerald-600 font-bold transition-colors">{t.corporateLogin}</button>
            <button onClick={() => setShowApplyModal(true)} className="hover:text-emerald-600 font-bold transition-colors">{t.storeApply}</button>
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
              <h3 className="text-xl font-black text-slate-900">{t.modalLoginTitle}</h3>
              <p className="text-xs text-slate-500">{t.modalLoginSub}</p>
            </div>

            <form onSubmit={handlePortalLogin} className="space-y-4 text-left">
              {loginError && <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">{loginError}</p>}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t.emailLabel}</label>
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
                <label className="text-xs font-bold text-slate-700">{t.passLabel}</label>
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
                <span>{loginSubmitting ? t.btnSigningIn : t.btnSignIn}</span>
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
            <h3 className="text-xl font-black text-slate-900">{t.modalQrTitle}</h3>
            <p className="text-xs text-slate-500">
              {t.modalQrSub}
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
              {t.btnClose}
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
                <h3 className="text-lg font-black text-slate-900">{t.modalApplyTitle}</h3>
                <p className="text-xs text-slate-500">{t.modalApplySub}</p>
              </div>
            </div>

            {appSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <p className="font-bold text-sm">{t.modalApplySuccessTitle}</p>
                <p className="text-xs text-slate-600">{t.modalApplySuccessSub}</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.formStoreName}</label>
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
                    <label className="text-xs font-bold text-slate-700">{t.formCity}</label>
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
                    <label className="text-xs font-bold text-slate-700">{t.formSector}</label>
                    <select
                      value={appSector}
                      onChange={(e) => setAppSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="real_estate">{t.sectorRealEstate}</option>
                      <option value="auto">{t.sectorAuto}</option>
                      <option value="electronics">{t.sectorElectronics}</option>
                      <option value="fashion">{t.sectorFashion}</option>
                      <option value="other">{t.sectorOther}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.formPhone}</label>
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
                  <label className="text-xs font-bold text-slate-700">{t.formNotes}</label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={appLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{appLoading ? t.btnSubmitting : t.btnSubmitApply}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
