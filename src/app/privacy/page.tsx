'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 🧭 Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3 group">
            <img src="/yeniikon.png" alt="AdaBazaar Logo" className="w-9 h-9 rounded-2xl object-contain shadow-md" />
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block group-hover:text-emerald-700 transition-colors">
                AdaBazaar KKTC
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block -mt-1 tracking-wider uppercase">
                Gizlilik Politikası
              </span>
            </div>
          </Link>

          <Link
            href="/landing"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </header>

      {/* 📜 Content Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Title Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold px-3.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kişisel Verilerin Korunması ve KVKK Uyum Beyanı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AdaBazaar Gizlilik Politikası
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Son Güncelleme Tarihi: 13 Ağustos 2026 | Sürüm: 2.0 (Resmi Yayın)
          </p>
        </div>

        {/* Legal Text Sections */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              1. Giriş ve Amaç
            </h2>
            <p>
              AdaBazaar ("Platform", "Uygulama" veya "Biz"), Kuzey Kıbrıs Türk Cumhuriyeti (KKTC) genelinde C2C (Bireysel) ve B2B (Kurumsal) ilan yayınlama ve pazaryeri hizmetleri sunmaktadır. İşbu Gizlilik Politikası, mobil uygulamamızı (iOS & Android) ve web sitemizi kullanan ziyaretçilerimizin ve kayıtlı kullanıcılarımızın kişisel verilerinin korunması ve işlenmesi usullerini açıklamak amacıyla hazırlanmıştır.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              2. Toplanan Kişisel Veriler
            </h2>
            <p>AdaBazaar hizmetlerini kullanırken aşağıdaki kişisel veriler işlenebilir:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
              <li><strong>Hesap Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası ve profil fotoğrafı.</li>
              <li><strong>İlan Verileri:</strong> Yayınlanan ilan başlığı, açıklaması, ürün fotoğrafları, fiyat bilgisi ve konum (Şehir/İlçe).</li>
              <li><strong>Kurumsal Mağaza Verileri:</strong> İşletme adı, kurumsal telefon, sektör bilgisi ve mağaza logosu.</li>
              <li><strong>Cihaz ve Teknik Veriler:</strong> Cihaz modeli, işletim sistemi sürümü, IP adresi ve anlık bildirim (Push Notification) jetonları.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              3. Verilerin Kullanım Amaçları
            </h2>
            <p>Toplanan veriler yalnızca aşağıdaki amaçlar doğrultusunda kullanılır:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
              <li>Alıcı ve satıcı arasındaki doğrudan iletişimi (WhatsApp veya Arama) kolaylaştırmak,</li>
              <li>İlanların platform üzerinde güvenli şekilde listelenmesini ve aranmasını sağlamak,</li>
              <li>Kurumsal mağazaların doğrulama süreçlerini yürütmek,</li>
              <li>İlan güncellemeleri ve güvenlik duyuruları hakkında anlık bildirimler göndermek,</li>
              <li>Yasal mevzuatlardan doğan yükümlülükleri yerine getirmek.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              4. Veri Güvenliği ve Paylaşımı
            </h2>
            <p>
              Kişisel verileriniz hiçbir koşulda pazarlama amacıyla üçüncü taraf kurum veya kişilerle satılmaz ya da paylaşılmaz. Verileriniz 256-bit SSL şifreleme ve Google Firebase şifreli bulut veritabanı altyapısıyla koruma altında saklanır.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              5. İletişim ve Destek
            </h2>
            <p>
              Gizlilik Politikamız veya verileriniz hakkındaki soru ve talepleriniz için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 font-bold text-xs text-slate-800">
              <p>📍 Platform: AdaBazaar KKTC Pazaryeri</p>
              <p>📧 E-posta: destek@adabazaar.com</p>
              <p>💬 WhatsApp Destek: +90 542 879 89 18</p>
              <p>🌐 Web: https://denemedeneme.vercel.app</p>
            </div>
          </section>
        </div>
      </main>

      {/* 📜 Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 AdaBazaar KKTC. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}
