'use client';

import React, { useState, useEffect } from 'react';
import { Package, Check, X, Trash2, Search, Filter, Loader2, Gift, Sparkles } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc, addDoc, getDocs, writeBatch, setDoc } from 'firebase/firestore';
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
  isFake?: boolean;
}

const FAKE_LISTINGS_DATA = [
  // TELEFON & TEKNOLOJİ
  {
    title: 'iPhone 15 Pro Max 256GB Natürel Titanyum (Kutulu / Faturalı)',
    category: 'Telefon',
    price: 1350,
    currency: 'GBP',
    city: 'Girne',
    district: 'Merkez',
    description: 'Yurt dışı cihazı, 2 aylık, pil sağlığı %100. Kutu, fatura ve orijinal kablosu tamdır. Çiziksiz sıfır ayarında.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Samsung Galaxy S24 Ultra 512GB Gri (Garanti Devam Ediyor)',
    category: 'Telefon',
    price: 45000,
    currency: 'TRY',
    city: 'Lefkoşa',
    district: 'Gönyeli',
    description: 'Kıbrıs cihazı, 4 ay önce alındı. Kılıf ve ekran koruyucu ile kullanıldı. Çizik yok.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'MacBook Pro 14 inç M2 Pro 16GB RAM 512GB SSD',
    category: 'Elektronik',
    price: 1550,
    currency: 'GBP',
    city: 'Girne',
    district: 'Alsancak',
    description: 'Yazılımcıdan temiz kullanılmış MacBook Pro. Pil döngüsü 65, kutusu ve şarj aleti eksiksiz.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'PlayStation 5 Slim 1TB Çift Kol + 3 Oyun Hediyeli',
    category: 'Elektronik',
    price: 650,
    currency: 'EUR',
    city: 'Gazimağusa',
    district: 'Karakol',
    description: 'Sıfırdan farksız PS5 Slim. Yanında 2 adet DualSense kol ve EA FC 24, Spider-Man 2 verilecektir.',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'AirPods Pro 2. Nesil USB-C Şarj Kutulu',
    category: 'Telefon',
    price: 180,
    currency: 'GBP',
    city: 'Lefkoşa',
    district: 'Dereboyu',
    description: 'Sorunsuz çalışıyor, gürültü engelleme mükemmel. Kutusu ve yedek kulakçıkları mevcuttur.',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // VASITA (ARABA / MOTOR)
  {
    title: '2021 Honda Civic 1.5 VTEC Turbo Eco Executive Plus',
    category: 'Vasıta',
    price: 18500,
    currency: 'GBP',
    city: 'Girne',
    district: 'Çatalköy',
    description: 'Kazasız, boyasız, tramersiz. Yetkili servis bakımlı. Sunroof, koltuk ısıtma, hayalet gösterge full paket.',
    images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: '2020 BMW 320i 1.6 M Sport Shadow Paket',
    category: 'Vasıta',
    price: 24500,
    currency: 'GBP',
    city: 'Lefkoşa',
    district: 'Ortaköy',
    description: '45.000 km’de. Borusan çıkışlı, seramik kaplaması yeni yapıldı. Harman Kardon ses sistemi mevcut.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: '2022 Toyota Corolla 1.8 Hybrid Passion X-Pack',
    category: 'Vasıta',
    price: 16800,
    currency: 'GBP',
    city: 'Gazimağusa',
    district: 'Yeniboğaziçi',
    description: 'Çok düşük yakıt tüketimi (100km / 3.8L). Değişensiz, sadece hafta sonları kullanıldı.',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: '2023 Vespa GTS 300 Super Sport Mat Siyah Scooter',
    category: 'Vasıta',
    price: 5200,
    currency: 'EUR',
    city: 'Girne',
    district: 'Karakum',
    description: '3.500 km’de sıfır kokusu üstünde. Akrapovic egzoz ve cam siperlik takılmıştır.',
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: '2019 Mercedes-Benz C200d AMG Coupe',
    category: 'Vasıta',
    price: 26000,
    currency: 'GBP',
    city: 'İskele',
    district: 'Long Beach',
    description: 'Gece paketi, panoramik cam tavan, Burmester ses sistemi. Hatasız koleksiyonluk araç.',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // EMLAK (EV / DAİRE / VİLLA)
  {
    title: 'Girne Alsancak’ta Dağ ve Deniz Manzaralı 2+1 Lüks Daire',
    category: 'Emlak',
    price: 115000,
    currency: 'GBP',
    city: 'Girne',
    district: 'Alsancak',
    description: 'Ortak havuzlu site içerisinde, koçanı hazır, krediye uygun. Plaja 5 dakika yürüme mesafesinde.',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'İskele Long Beach’te Denize 200m Satılık 1+1 Stüdyo Daire',
    category: 'Emlak',
    price: 89000,
    currency: 'GBP',
    city: 'İskele',
    district: 'Long Beach',
    description: 'Yüksek kira getirili, eşyalı devren satılık. Aquaparklı ve güvenlikli site içi.',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Lefkoşa Gönyeli’de Kiralık 3+1 Geniş Eşyalı Daire',
    category: 'Emlak',
    price: 650,
    currency: 'GBP',
    city: 'Lefkoşa',
    district: 'Gönyeli',
    description: 'Üniversiteye yakın, ana cadde üstünde, asansörlü ve kapalı otoparklı bina.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Girne Lapta’da Müstakil Bahçeli 4+1 Özel Havuzlu Villa',
    category: 'Emlak',
    price: 295000,
    currency: 'GBP',
    city: 'Girne',
    district: 'Lapta',
    description: 'Özel yüzme havuzu, geniş peyzajlı bahçesi ve kesintisiz deniz manzarası ile eşsiz villa.',
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // EV & YAŞAM / MOBİLYA
  {
    title: 'Lüks L-Köşe Koltuk Takımı (Tay Tüyü Kumaş - Temiz)',
    category: 'Ev & Yaşam',
    price: 18500,
    currency: 'TRY',
    city: 'Lefkoşa',
    district: 'Küçük Kaymaklı',
    description: 'Leke tutmaz kumaş, yataklı ve bazalı model. Yeni ev taşıyacağımız için satıyoruz.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Doğal Ahşap Yemek Masası + 6 Adet Süet Sandalye',
    category: 'Ev & Yaşam',
    price: 14000,
    currency: 'TRY',
    city: 'Girne',
    district: 'Merkez',
    description: 'Masif meşe ağacı el yapımı masa. Sandalyelerde deformasyon yoktur.',
    images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Bosch Inverter A+++ 9 KG Çamaşır Makinesi',
    category: 'Ev & Yaşam',
    price: 11000,
    currency: 'TRY',
    city: 'Gazimağusa',
    district: 'Sakarya',
    description: 'Sessiz motor teknolojisi, çok az kullanıldı. Sorunsuz çalışmaktadır.',
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Dyson V15 Detect Kablosuz Dik Süpürge',
    category: 'Ev & Yaşam',
    price: 550,
    currency: 'GBP',
    city: 'Girne',
    district: 'Çatalköy',
    description: 'Lazer başlığı ve tüm aparatları mevcut. Kutusu ve garantisi devam ediyor.',
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // BİLGİSAYAR / OYUN
  {
    title: 'RTX 4080 Super / i7-14700K Canavar Gaming PC Masaüstü',
    category: 'Bilgisayar',
    price: 2400,
    currency: 'USD',
    city: 'Lefkoşa',
    district: 'Hamitköy',
    description: 'Sıvı soğutmalı, 32GB DDR5 RAM, 2TB NVMe SSD. Tüm oyunları 4K Ultra ayarlarda oynatır.',
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Dell UltraSharp 27 inç 4K USB-C Profesyonel Monitör',
    category: 'Bilgisayar',
    price: 380,
    currency: 'EUR',
    city: 'Girne',
    district: 'Merkez',
    description: 'Tasarım ve yazılım için harika renk doğruluğu (IPS Panel). Ölü piksel yoktur.',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'ASUS ROG Strix G16 Gaming Laptop (RTX 4070 / 16GB / 1TB)',
    category: 'Bilgisayar',
    price: 1450,
    currency: 'USD',
    city: 'Gazimağusa',
    district: 'DAÜ Kampüs',
    description: 'Öğrenciden temiz kullanılmış oyun bilgisayarı. 240Hz ekran, kozmetik 10/10.',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // GİYİM & MODA & AKSESUAR
  {
    title: 'Nike Air Force 1 \'07 Beyaz (Sıfır Kutulu - Beden 42)',
    category: 'Giyim',
    price: 3200,
    currency: 'TRY',
    city: 'Lefkoşa',
    district: 'Köşklüçiftlik',
    description: 'Orijinal faturası ile birlikte teslim edilecektir. Hiç giyilmedi.',
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Ray-Ban Wayfarer Klasik Siyah Güneş Gözlüğü',
    category: 'Giyim',
    price: 120,
    currency: 'EUR',
    city: 'Girne',
    district: 'Liman',
    description: 'Orijinal kılıfı ve silme bezi ile. Çiziksiz camlar.',
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },

  // ASKIDA (ÜCRETSİZ) İLANLAR
  {
    title: 'Öğrenciye Ücretsiz Çalışma Masası ve Sandalye (Askıda Eşya)',
    category: 'Ev & Yaşam',
    price: 0,
    currency: 'TRY',
    city: 'Lefkoşa',
    district: 'Gönyeli',
    description: 'İhtiyacı olan bir öğrenciye hediye etmek istiyoruz. Gelip adresten teslim alabilir.',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: true,
    status: 'active',
  },
  {
    title: 'Ücretsiz İngilizce / İspanyolca Hazırlık Kitap Seti',
    category: 'Hobi',
    price: 0,
    currency: 'TRY',
    city: 'Gazimağusa',
    district: 'Doğu Akdeniz Üniv.',
    description: 'Tamamen ücretsiz verilecektir. İhtiyaç sahibi öğrenci arkadaşlar ulaşabilir.',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: true,
    status: 'active',
  },
  {
    title: 'Bebek Beşiği ve Ahşap Mama Sandalyesi (Hediye / Askıda)',
    category: 'Ev & Yaşam',
    price: 0,
    currency: 'TRY',
    city: 'Girne',
    district: 'Karaoğlanoğlu',
    description: 'Çocuğumuz büyüdüğü için ihtiyacı olan bir aileye ücretsiz veriyoruz.',
    images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: true,
    status: 'active',
  },

  // DİĞER KATEGORİLER
  {
    title: 'Canon EOS R6 Mark II Gövde (Kutulu Shutter 4.500)',
    category: 'Elektronik',
    price: 1950,
    currency: 'GBP',
    city: 'Lefkoşa',
    district: 'Dereboyu',
    description: 'Fotoğrafçılığa zaman ayıramadığım için satıyorum. Kozmetik 10/10.',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'iPad Air 5. Nesil M1 Çip 64GB Uzay Grisi + Apple Pencil 2',
    category: 'Tablet',
    price: 520,
    currency: 'GBP',
    city: 'Girne',
    district: 'Merkez',
    description: 'Ders notu almak için kullanıldı. Ekran koruyucusu ve kılıfı hediye verilecektir.',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Sony WH-1000XM5 Kablosuz Kulak Üstü Kulaklık (Siyah)',
    category: 'Elektronik',
    price: 290,
    currency: 'EUR',
    city: 'Gazimağusa',
    district: 'Karakol',
    description: 'Dünyanın en iyi gürültü engelleme kulaklığı. Taşıma çantası kablosu mevcuttur.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Yamaha MT-07 ABS 2022 (Sadece 6.800 km’de)',
    category: 'Vasıta',
    price: 6400,
    currency: 'EUR',
    city: 'Lefkoşa',
    district: 'Gönyeli',
    description: 'Koruma demirleri, radyatör koruma ve katlanır plakalık mevcut. Hasarsız.',
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Deri Ofis Koltuğu Ergonomik Oyuncu Koltuğu',
    category: 'Ev & Yaşam',
    price: 4500,
    currency: 'TRY',
    city: 'Girne',
    district: 'Alsancak',
    description: 'Sırt desteği ve amortisörü sağlam. Evden çalışanlar için ideal.',
    images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'LG 55 inç OLED 4K Smart TV (120Hz Gaming Destekli)',
    category: 'Elektronik',
    price: 32000,
    currency: 'TRY',
    city: 'Lefkoşa',
    district: 'Kumsal',
    description: 'PS5 ve film tutkunları için muhteşem görüntü kalitesi. Çiziksiz.',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: '2018 Volkswagen Golf 1.4 TSI Highline Otomatik',
    category: 'Vasıta',
    price: 13900,
    currency: 'GBP',
    city: 'Gazimağusa',
    district: 'Merkez',
    description: 'Bütün bakımları zamanında yapıldı. Panoramik cam tavan, büyük ekran.',
    images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Vintage Retro Deri Ceket (Kahverengi - Beden L)',
    category: 'Giyim',
    price: 2400,
    currency: 'TRY',
    city: 'Girne',
    district: 'Zeytinlik',
    description: 'Hakiki hakiki deridir. İtalyan kesim özel tasarım vintage ceket.',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  },
  {
    title: 'Apple Watch Series 9 45mm Gece Yarısı Alüminyum',
    category: 'Elektronik',
    price: 340,
    currency: 'GBP',
    city: 'Lefkoşa',
    district: 'Köşklüçiftlik',
    description: 'Kutusunda, orijinal kordonu ve şarj kablosu ile teslim edilecektir.',
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'],
    isGiveaway: false,
    status: 'active',
  }
];

const FAKE_SELLERS = [
  {
    id: 'fake_user_1',
    name: 'Mehmet Ali Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+905338661234',
  },
  {
    id: 'fake_user_2',
    name: 'Ayşe Kaya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    phone: '+905488554321',
  },
  {
    id: 'fake_user_3',
    name: 'Mustafa Kanatlı',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+905338779900',
  },
  {
    id: 'fake_user_4',
    name: 'Selin Aksoy',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    phone: '+905428881122',
  },
  {
    id: 'fake_user_5',
    name: 'Emre Öztürk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '+905338114455',
  },
  {
    id: 'fake_user_6',
    name: 'Zeynep Çelik',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    phone: '+905488223344',
  },
  {
    id: 'fake_user_7',
    name: 'Hasan Denktaş',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    phone: '+905338336677',
  },
  {
    id: 'fake_user_8',
    name: 'Ceren Yılmazer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+905428556677',
  },
  {
    id: 'fake_user_9',
    name: 'Burak Demir',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    phone: '+905338990011',
  },
  {
    id: 'fake_user_10',
    name: 'Enescan Saykı',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '+905488771199',
  },
];

export default function ListingsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('all');
  const [search, setSearch] = useState('');
  const [addingFake, setAddingFake] = useState(false);
  const [deletingFake, setDeletingFake] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const col = collection(db, 'products');
    const q = filter === 'all' ? col : query(col, where('status', '==', filter));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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

  const handleAddFakeListings = async () => {
    if (!confirm('35 adet görselli ve farklı satıcı profilli fake ilan eklemek istiyor musunuz?')) return;
    setAddingFake(true);
    try {
      // First seed the fake seller user documents in Firestore
      for (const s of FAKE_SELLERS) {
        await setDoc(doc(db, 'users', s.id), {
          uid: s.id,
          displayName: s.name,
          email: `${s.id}@adabazar.com`,
          photoURL: s.avatar,
          phone: s.phone,
          role: 'user',
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }

      const col = collection(db, 'products');
      let count = 0;
      for (const item of FAKE_LISTINGS_DATA) {
        const seller = FAKE_SELLERS[count % FAKE_SELLERS.length];
        await addDoc(col, {
          ...item,
          isFake: true,
          sellerId: seller.id,
          sellerName: seller.name,
          sellerAvatar: seller.avatar,
          sellerPhone: seller.phone,
          viewsCount: Math.floor(Math.random() * 85) + 12,
          favoritesCount: Math.floor(Math.random() * 15),
          createdAt: new Date(Date.now() - count * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      alert('35 adet farklı satıcılı fake ilan başarıyla yüklendi!');
    } catch (err: any) {
      console.error('Error adding fake listings:', err);
      alert('Hata oluştu: ' + err.message);
    } finally {
      setAddingFake(false);
    }
  };

  const handleDeleteFakeListings = async () => {
    if (!confirm('Tüm fake ilanları silmek istediğinize emin misiniz?')) return;
    setDeletingFake(true);
    try {
      const col = collection(db, 'products');
      const snap = await getDocs(col);
      const fakeTitles = FAKE_LISTINGS_DATA.map(f => f.title);
      const fakeDocs = snap.docs.filter(d => {
        const data = d.data();
        return data.isFake === true || fakeTitles.includes(data.title) || (data.sellerId && data.sellerId.startsWith('fake_user_'));
      });
      if (fakeDocs.length === 0) {
        alert('Silinecek fake ilan bulunamadı.');
        return;
      }
      const batch = writeBatch(db);
      fakeDocs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      alert(`${fakeDocs.length} adet fake ilan başarıyla silindi!`);
    } catch (err: any) {
      console.error('Error deleting fake listings:', err);
      alert('Silme sırasında hata oluştu: ' + err.message);
    } finally {
      setDeletingFake(false);
    }
  };

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
    { key: 'all',      label: 'Tümü' },
    { key: 'pending',  label: 'Bekleyen' },
    { key: 'active',   label: 'Aktif' },
    { key: 'rejected', label: 'Reddedilen' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-teal-500" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">İlan Yönetimi</h1>
            <p className="text-sm text-slate-400">Tüm ilanları incele, fake ilan yükle veya sil</p>
          </div>
        </div>

        {/* Fake Listing Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddFakeListings}
            disabled={addingFake || deletingFake}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {addingFake ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{addingFake ? 'Yükleniyor...' : '+ 35 Fake İlan Yükle'}</span>
          </button>
          <button
            onClick={handleDeleteFakeListings}
            disabled={addingFake || deletingFake}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {deletingFake ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{deletingFake ? 'Siliniyor...' : 'Fake İlanları Sil'}</span>
          </button>
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
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-700 dark:text-white text-sm leading-tight line-clamp-1">{p.title}</p>
                            {p.isFake && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                                FAKE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{(p as any).sellerName || sellerNames[p.sellerId] || 'Admin'}</td>
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
                    <td className="px-6 py-4 text-slate-400 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : '—'}</td>
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
