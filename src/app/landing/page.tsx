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
    announcement: "AdaBazaar Mobil Uygulaması Canlıda! KKTC'nin 1 Numaralı İlan & Kurumsal Mağaza Platformu",
    downloadNow: "Hemen İndir →",
    subTitle: "KIBRIS MARKETPLACE",
    navHome: "Ana Sayfa",
    navProducts: "Canlı İlanlar",
    navStores: "Kurumsal Mağazalar",
    navWhyUs: "Neden AdaBazaar?",
    storeApply: "Mağaza Başvurusu",
    corporateLogin: "Kurumsal Giriş",
    goToPortal: "Portala Git",
    logout: "Çıkış",
    badgeVerified: "KKTC'nin Doğrulanmış Yerel Pazaryeri Platformu",
    heroTitleLine1: "Kıbrıs'ta Al, Sat, Keşfet",
    heroTitleLine2: "Tüm Ada Cebinde!",
    heroDesc: "Emlak, vasıta, ikinci el eşyalar ve KKTC'nin seçkin kurumsal mağazaları AdaBazaar'da buluşuyor. Aracısız, hızlı ve %100 doğrudan iletişim ile ilan verin veya hayalinizdeki ürünü bulun.",
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
    storesSub: "AdaBazaar doğrulama sisteminden geçmiş resmi işletmeler",
    verifiedBadge: "ONAYLI MAĞAZA",
    whyUsTag: "NEDEN BİZ?",
    whyUsTitle: "AdaBazaar Avantajları",
    feat1Title: "30 Saniyede Ücretsiz İlan",
    feat1Desc: "Fotoğrafını çek, fiyatını belirle ve ilanını saniyeler içinde binlerce alıcıya ücretsiz ulaştır.",
    feat2Title: "Doğrulanmış Kurumsal Mağazalar",
    feat2Desc: "KKTC genelindeki resmi işletmelerden komisyonsuz ve %100 doğrudan alışveriş yapın.",
    feat3Title: "Doğrudan & Aracısız İletişim",
    feat3Desc: "WhatsApp veya telefon ile komisyonsuz, doğrudan alıcı ve satıcıyla anında görüşün.",
    feat4Title: "Konum Bazlı Ada Araması",
    feat4Desc: "Lefkoşa, Girne, Mağusa ve tüm KKTC şehirlerinde filtrelenmiş nokta atışı ilan araması yapın.",
    feat5Title: "Anlık Canlı Mesajlaşma",
    feat5Desc: "Mobil uygulama içi sohbet ile ilan sahipleriyle anlık bildirimli mesajlaşın.",
    feat6Title: "%100 Yerel Güvenilir Altyapı",
    feat6Desc: "Kıbrıs pazarına özel geliştirilmiş hızlı, güvenli ve kolay pazaryeri deneyimi.",
    bannerTitle: "Tüm Ada Cebinde! Hemen İndir",
    bannerDesc: "AdaBazaar mobil uygulamasını iOS veya Android cihazınıza indirerek ilanları inceleyin veya hemen ilan yayınlayın.",
    downloadAppStore: "iOS App Store'dan İndir",
    downloadPlayStore: "Google Play'den İndir",
    footerRights: "© 2026 AdaBazaar C2C & B2B İlan Platformu. Tüm hakları saklıdır.",
    modalLoginTitle: "Kurumsal Portal Girişi",
    modalLoginSub: "Mağaza veya Yönetim panelinize erişin",
    emailLabel: "E-posta Adresi",
    passLabel: "Şifre",
    btnSigningIn: "Giriş Yapılıyor...",
    btnSignIn: "Giriş Yap",
    modalQrTitle: "Uygulamayı İndirin",
    modalQrSub: "Telefonunuzun kamerasını QR koda tutarak AdaBazaar uygulamasını hemen yükleyebilirsiniz.",
    btnClose: "Kapat",
    modalApplyTitle: "Kurumsal Mağaza Başvurusu",
    modalApplySub: "İşletmenizi AdaBazaar'a dahil edin",
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
    announcement: "AdaBazaar Mobile App is Live! TRNC's #1 Marketplace & Store Platform",
    downloadNow: "Download Now →",
    subTitle: "CYPRUS MARKETPLACE",
    navHome: "Home",
    navProducts: "Live Listings",
    navStores: "Verified Stores",
    navWhyUs: "Why AdaBazaar?",
    storeApply: "Store Application",
    corporateLogin: "Corporate Login",
    goToPortal: "Go to Portal",
    logout: "Logout",
    badgeVerified: "TRNC's Verified Local Marketplace Platform",
    heroTitleLine1: "Buy, Sell & Discover in Cyprus",
    heroTitleLine2: "The Whole Island in Your Pocket!",
    heroDesc: "Real estate, vehicles, secondhand items, and top verified stores in Northern Cyprus meet at AdaBazaar. Post ads or find your dream item with 100% direct communication.",
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
    storesSub: "Official verified stores approved by AdaBazaar verification system",
    verifiedBadge: "VERIFIED STORE",
    whyUsTag: "WHY CHOOSE US?",
    whyUsTitle: "AdaBazaar Advantages",
    feat1Title: "Free Listing in 30 Seconds",
    feat1Desc: "Snap photos, set your price, and publish to thousands of buyers for free in seconds.",
    feat2Title: "Verified Corporate Stores",
    feat2Desc: "Shop with 100% confidence from official verified corporate stores across TRNC.",
    feat3Title: "Direct Communication",
    feat3Desc: "Connect directly with buyers and sellers via WhatsApp or call with zero middlemen.",
    feat4Title: "Location-Based Search",
    feat4Desc: "Search filtered listings across Nicosia, Kyrenia, Famagusta & all TRNC cities.",
    feat5Title: "Instant Live Messaging",
    feat5Desc: "Chat live with listing owners with instant mobile push notifications.",
    feat6Title: "100% Local & Reliable",
    feat6Desc: "Fast, secure and intuitive marketplace experience tailored for Cyprus.",
    bannerTitle: "The Island in Your Pocket! Download Now",
    bannerDesc: "Download AdaBazaar mobile app for iOS or Android to browse listings or publish your ads instantly.",
    downloadAppStore: "Download on App Store",
    downloadPlayStore: "Get it on Google Play",
    footerRights: "© 2026 AdaBazaar C2C & B2B Marketplace Platform. All rights reserved.",
    modalLoginTitle: "Corporate Portal Login",
    modalLoginSub: "Access your Store or Management dashboard",
    emailLabel: "Email Address",
    passLabel: "Password",
    btnSigningIn: "Logging in...",
    btnSignIn: "Sign In",
    modalQrTitle: "Download the App",
    modalQrSub: "Scan the QR code with your phone camera to instantly download AdaBazaar app.",
    btnClose: "Close",
    modalApplyTitle: "Corporate Store Application",
    modalApplySub: "Register your business on AdaBazaar",
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
    announcement: "Мобильное приложение AdaBazaar запущено! Платформа №1 на ТРСК",
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
    heroDesc: "Недвижимость, авто, б/у товары и лучшие проверенные магазины Северного Кипра на AdaBazaar. Размещайте объявления и общайтесь напрямую без комиссий.",
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
    storesSub: "Официальные компании, прошедшие верификацию AdaBazaar",
    verifiedBadge: "ПРОВЕРЕННЫЙ МАГАЗИН",
    whyUsTag: "ПОЧЕМУ МЫ?",
    whyUsTitle: "Преимущества AdaBazaar",
    feat1Title: "Публикация за 30 секунд",
    feat1Desc: "Сделайте фото, укажите цену и бесплатно опубликуйте объявление за считанные секунды.",
    feat2Title: "Проверенные компании",
    feat2Desc: "Покупайте без комиссий в официальных верифицированных магазинах по всему ТРСК.",
    feat3Title: "Прямая связь без комиссий",
    feat3Desc: "Общайтесь с продавцами напрямую в WhatsApp или по телефону без посредников.",
    feat4Title: "Поиск по городам ТРСК",
    feat4Desc: "Удобный фильтрованный поиск объявлений в Никосии, Кирении, Фамагусте и др.",
    feat5Title: "Чат в реальном времени",
    feat5Desc: "Общайтесь с авторами объявлений во встроенном чате приложения с мгновенными уведомлениями.",
    feat6Title: "100% Локально и надежно",
    feat6Desc: "Быстрый, безопасный и удобный интерфейс, созданный специально для Кипра.",
    bannerTitle: "Весь остров в вашем кармане! Скачайте сейчас",
    bannerDesc: "Загрузите приложение AdaBazaar для iOS или Android, чтобы просматривать объявления или продавать свои товары.",
    downloadAppStore: "Скачать в App Store",
    downloadPlayStore: "Скачать в Google Play",
    footerRights: "© 2026 Маркетплейс AdaBazaar C2C & B2B. Все права защищены.",
    modalLoginTitle: "Вход в бизнес-портал",
    modalLoginSub: "Доступ к панели управления магазина",
    emailLabel: "Электронная почта",
    passLabel: "Пароль",
    btnSigningIn: "Вход...",
    btnSignIn: "Войти",
    modalQrTitle: "Скачать приложение",
    modalQrSub: "Отсканируйте QR-код камерой телефона, чтобы установить приложение AdaBazaar.",
    btnClose: "Закрыть",
    modalApplyTitle: "Заявка для магазинов",
    modalApplySub: "Зарегистрируйте свой бизнес на AdaBazaar",
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

  // Smart device detection & download handler
  const handleSmartDownload = (platformPreference?: 'ios' | 'android') => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    const iosLink = 'https://apps.apple.com/app/id6741000000';
    const androidLink = 'https://play.google.com/store/apps/details?id=com.adabazaar.kibrismarket';

    if (platformPreference === 'ios') {
      if (isIOS || isAndroid) {
        window.open(iosLink, '_blank');
        return;
      }
    } else if (platformPreference === 'android') {
      if (isIOS || isAndroid) {
        window.open(androidLink, '_blank');
        return;
      }
    } else {
      // Smart Auto-detection from main "Uygulamayı Hemen İndir" button
      if (isIOS) {
        window.open(iosLink, '_blank');
        return;
      }
      if (isAndroid) {
        window.open(androidLink, '_blank');
        return;
      }
    }

    // Desktop/Laptop user -> Show QR code modal to scan with phone
    setShowQrModal(true);
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
        <button onClick={() => handleSmartDownload()} className="underline hover:text-emerald-200 transition-colors ml-2 font-black">
          {t.downloadNow}
        </button>
      </div>

      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yeniikon.png" alt="AdaBazaar Logo" className="w-10 h-10 rounded-2xl object-contain shadow-md" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block">AdaBazaar</span>
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

      {/* 🚀 HERO SECTION (ELEVATED POSITION & COMPACT PHONE SCALE) */}
      <section id="hero" className="relative pt-2 sm:pt-4 pb-8 px-6 overflow-hidden bg-gradient-to-b from-emerald-500/5 via-teal-500/5 to-slate-50/60 border-b border-slate-200/60">
        {/* Glow Ambient Circles & Mesh Dots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.badgeVerified}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {t.heroTitleLine1} <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                {t.heroTitleLine2}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
              {t.heroDesc}
            </p>

            {/* Official Store Buttons & Store Apply */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              {/* Apple App Store Button */}
              <button
                onClick={() => handleSmartDownload('ios')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl transition-all shadow-lg hover:scale-105 flex items-center gap-2.5 text-left border border-slate-700"
              >
                <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.15-.56 2.81-1.37z" />
                </svg>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">App Store</span>
                  <span className="text-xs font-bold text-white block leading-tight">{t.downloadAppStore}</span>
                </div>
              </button>

              {/* Google Play Store Button */}
              <button
                onClick={() => handleSmartDownload('android')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl transition-all shadow-lg hover:scale-105 flex items-center gap-2.5 text-left border border-slate-700"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#410593" d="M3.609 1.814L13.792 12 3.61 22.186A2.37 2.37 0 0 1 3 20.57V3.43c0-.623.23-1.22.609-1.616z"/>
                  <path fill="#00e5ff" d="M17.07 8.72l-3.278 3.28 3.278 3.28 3.708-2.126a1.44 1.44 0 0 0 0-2.308z"/>
                  <path fill="#ff3a44" d="M3.609 1.814l10.183 10.186 3.278-3.28-11.89-6.816a1.44 1.44 0 0 0-1.571.91z"/>
                  <path fill="#00e676" d="M3.609 22.186l11.89-6.816-3.278-3.28L2.038 22.276a1.44 1.44 0 0 0 1.571-.09z"/>
                </svg>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Google Play</span>
                  <span className="text-xs font-bold text-white block leading-tight">{t.downloadPlayStore}</span>
                </div>
              </button>

              {/* Become Store Button */}
              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-4 py-3 rounded-2xl transition-all shadow-sm flex items-center gap-2 hover:scale-105"
              >
                <span>{t.btnBecomeStore}</span>
              </button>
            </div>
          </div>

          {/* 🖼️ HERO PHONE IMAGE - COMPACT SLIM SCALE WITH ROUNDED CORNERS */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="rounded-[28px] overflow-hidden shadow-xl border-[2px] border-slate-200/90 hover:scale-105 transition-transform duration-500 max-w-[190px] sm:max-w-[210px] lg:max-w-[225px] w-full bg-white">
              <img
                src="/hero-banner.png"
                alt="AdaBazaar Mobil Uygulaması"
                className="w-full h-auto object-contain block"
              />
            </div>
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

      {/* 🏢 ONAYLI KURUMSAL MAĞAZALAR (PRO SHOWCASE) */}
      <section id="stores" className="py-20 px-6 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.trustedBusinessesTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t.storesTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{t.storesSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map(s => {
              const name = s.storeInfo?.storeName || s.displayName || 'Kurumsal Mağaza';
              const logo = s.photoURL || s.storeInfo?.storeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F766E&color=fff&size=200`;
              const city = s.storeInfo?.city || s.city || 'Lefkoşa / KKTC';
              const phone = s.storeInfo?.phone || s.phone || '';
              const sector = s.storeInfo?.sector || 'Kurumsal İşletme';

              return (
                <div key={s.id} className="bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-[32px] p-7 space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
                  {/* Glowing Corner Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <img src={logo} alt={name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform" />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t.verifiedBadge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                      <span>{name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{sector}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100/80">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{city}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-2 font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Always Present "Mağaza Ol" CTA Card */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-[32px] p-7 flex flex-col justify-between space-y-6 shadow-xl border border-emerald-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-emerald-400">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white leading-snug">İşletmenizi AdaBazaar'a Dahil Edin</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  KKTC genelindeki binlerce potansiyel müşteriye aracısız ulaşın, kurumsal mağaza kimliği ile güvenle satış yapın.
                </p>
              </div>

              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 relative z-10"
              >
                <span>{t.storeApply} →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📜 FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/yeniikon.png" alt="AdaBazaar Logo" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-slate-900 text-sm">AdaBazaar KKTC</span>
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
                alt="AdaBazaar QR"
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
