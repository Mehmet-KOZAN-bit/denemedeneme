'use client';

import React, { useState, useEffect } from 'react';
import { Flag, Check, Trash2, Loader2, AlertTriangle, Ban, X, Eye } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

interface Report {
  id: string;
  type: string;
  reason: string;
  reportedId: string;
  reportedBy: string;
  status: 'open' | 'resolved';
  createdAt?: any;
  reportedAt?: any;
}

const formatDate = (val: any) => {
  if (!val) return '—';
  let date: Date;
  if (typeof val.toDate === 'function') {
    date = val.toDate();
  } else if (val.seconds) {
    date = new Date(val.seconds * 1000);
  } else {
    date = new Date(val);
  }
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [sellerIds, setSellerIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'reports'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.reportedAt ? new Date(a.reportedAt).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.reportedAt ? new Date(b.reportedAt).getTime() : 0);
        return timeB - timeA;
      });
      setReports(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    reports.forEach(r => {
      // 1. Fetch reporter name (always user)
      if (r.reportedBy && !names[r.reportedBy]) {
        getDoc(doc(db, 'users', r.reportedBy)).then(d => {
          const name = d.exists() ? (d.data().displayName || d.data().email || r.reportedBy) : r.reportedBy;
          setNames(prev => ({ ...prev, [r.reportedBy]: name }));
        }).catch(() => setNames(prev => ({ ...prev, [r.reportedBy]: r.reportedBy })));
      }

      // 2. Fetch reported target name/title & seller ID
      if (r.reportedId && !names[r.reportedId]) {
        if (r.type === 'İlan') {
          // Fetch product title & sellerId
          getDoc(doc(db, 'products', r.reportedId)).then(d => {
            if (d.exists()) {
              const productData = d.data();
              setNames(prev => ({ ...prev, [r.reportedId]: `İlan: ${productData.title || r.reportedId}` }));
              if (productData.sellerId) {
                setSellerIds(prev => ({ ...prev, [r.reportedId]: productData.sellerId }));
              }
            } else {
              setNames(prev => ({ ...prev, [r.reportedId]: `İlan (Silinmiş): ${r.reportedId}` }));
            }
          }).catch(() => setNames(prev => ({ ...prev, [r.reportedId]: `İlan: ${r.reportedId}` })));
        } else {
          // Fetch user name
          getDoc(doc(db, 'users', r.reportedId)).then(d => {
            const name = d.exists() ? (d.data().displayName || d.data().email || r.reportedId) : r.reportedId;
            setNames(prev => ({ ...prev, [r.reportedId]: name }));
          }).catch(() => setNames(prev => ({ ...prev, [r.reportedId]: r.reportedId })));
        }
      }
    });
  }, [reports]);

  const resolve = async (id: string) => { 
    await updateDoc(doc(db, 'reports', id), { status: 'resolved', resolvedAt: new Date().toISOString() }); 
    setSelectedReport(null);
  };
  
  const remove  = async (id: string) => { 
    if (!confirm('Bu rapor kaydını silmek istiyor musunuz?')) return; 
    await deleteDoc(doc(db, 'reports', id)); 
    setSelectedReport(null);
  };

  const removeListing = async (productId: string, reportId: string) => {
    if (!confirm('Bu ilanı tamamen silmek/kaldırmak istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved', resolvedAt: new Date().toISOString() });
      setSelectedReport(null);
      alert('İlan başarıyla kaldırıldı ve şikayet çözümlendi.');
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const banUser = async (uid: string, reportId: string) => {
    if (!confirm('Bu kullanıcıyı banlamak istediğinize emin misiniz?')) return;
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned: true });
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved', resolvedAt: new Date().toISOString() });
      setSelectedReport(null);
      alert('Kullanıcı başarıyla banlandı ve şikayet çözümlendi.');
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const openReports     = reports.filter(r => r.status !== 'resolved');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flag className="w-6 h-6 text-rose-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Raporlar & Şikayetler</h1>
          <p className="text-sm text-slate-400">Kullanıcı şikayetleri ve içerik raporları</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam Rapor', value: reports.length, color: 'slate' },
          { label: 'Açık', value: openReports.length, color: 'rose' },
          { label: 'Çözümlendi', value: resolvedReports.length, color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-base text-slate-700 dark:text-white">Raporlar</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <AlertTriangle className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-semibold">Henüz rapor bulunmuyor</p>
            <p className="text-xs text-slate-300 mt-1">Kullanıcılar ilan veya profil şikayet ettiğinde burada görünür</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">Tür</th>
                  <th className="px-6 py-3">Sebep</th>
                  <th className="px-6 py-3">Şikayet Eden</th>
                  <th className="px-6 py-3">Şikayet Edilen</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors ${r.status === 'resolved' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">{r.type || 'Genel'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate">{r.reason}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{names[r.reportedBy] || '...'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {names[r.reportedId] || r.reportedId?.slice(0,8) || '...'}
                      {r.type === 'İlan' && sellerIds[r.reportedId] && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Satıcı: {names[sellerIds[r.reportedId]] || sellerIds[r.reportedId]?.slice(0,6)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {r.status === 'resolved' ? 'Çözümlendi' : 'Açık'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formatDate(r.createdAt || r.reportedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          İşlem Yap
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

      {/* ===== Action Detail Modal ===== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-slate-800 dark:text-white text-lg">Şikayet Detayı</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-300 font-bold transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Type and Date */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Tür</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedReport.type || 'Genel'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Tarih</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {formatDate(selectedReport.createdAt || selectedReport.reportedAt)}
                  </span>
                </div>
              </div>

              {/* Sender & Target Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">Şikayet Eden</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-white block truncate">{names[selectedReport.reportedBy] || '...'}</span>
                  <span className="text-[10px] text-slate-400 select-all block mt-0.5">{selectedReport.reportedBy}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">Şikayet Edilen</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-white block truncate">{names[selectedReport.reportedId] || '...'}</span>
                  <span className="text-[10px] text-slate-400 select-all block mt-0.5">{selectedReport.reportedId}</span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="bg-blue-50/30 dark:bg-blue-950/5 p-4 rounded-2xl border border-blue-100/40 dark:border-blue-950/20 space-y-2">
                <span className="text-[10px] font-semibold text-blue-500 block uppercase tracking-wider">Şikayet Edilen Ürün / İlan</span>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedReport.type === 'İlan' 
                    ? (names[selectedReport.reportedId] || 'Yükleniyor...') 
                    : 'Bu şikayet doğrudan bir ürün ile ilgili değil.'}
                </div>
                {selectedReport.type === 'İlan' && sellerIds[selectedReport.reportedId] && (
                  <div className="text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">İlan Sahibi (Satıcı):</span> {names[sellerIds[selectedReport.reportedId]] || '...'}
                  </div>
                )}
              </div>

              {/* Reason Details */}
              <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-2xl border border-rose-100/60 dark:border-rose-950/30">
                <span className="text-[10px] font-semibold text-rose-500 block uppercase tracking-wider mb-1.5">Bildirilen Sebep / Detay</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-line">
                  {selectedReport.reason || 'Sebep belirtilmemiş'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
              {selectedReport.status !== 'resolved' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Resolve button */}
                    <button
                      onClick={() => resolve(selectedReport.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Raporu Çözümle
                    </button>

                    {/* Delete Product (Ürünü Sil) — Always visible when it's a listing report */}
                    {selectedReport.type === 'İlan' ? (
                      <button
                        onClick={() => removeListing(selectedReport.reportedId, selectedReport.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Ürünü Sil
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-extrabold text-xs rounded-xl cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Ürün Bulunamadı
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Contextual Action: Ban User */}
                    {selectedReport.type === 'İlan' && sellerIds[selectedReport.reportedId] ? (
                      <button
                        onClick={() => banUser(sellerIds[selectedReport.reportedId], selectedReport.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Ban className="w-4 h-4" />
                        Satıcıyı Banla
                      </button>
                    ) : (
                      <button
                        onClick={() => banUser(selectedReport.reportedId, selectedReport.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Ban className="w-4 h-4" />
                        Kullanıcıyı Banla
                      </button>
                    )}

                    {/* Delete report log button */}
                    <button
                      onClick={() => remove(selectedReport.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-xs rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Rapor Kaydını Sil
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl">
                  <Check className="w-4 h-4" />
                  Bu rapor çözümlenmiş.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
