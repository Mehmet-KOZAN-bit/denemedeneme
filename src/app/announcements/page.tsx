'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Send } from 'lucide-react';
import { useAuth, db } from '../../context/AuthContext';
import { collection, query, onSnapshot, addDoc, deleteDoc, updateDoc, doc, orderBy } from 'firebase/firestore';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'announcements'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        content: content.trim(),
        type,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      // FCM broadcast (non-blocking)
      if (user) {
        user.getIdToken().then(token => {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
          fetch(`${apiUrl}/notifications/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title: title.trim(), body: content.trim() }),
          }).catch(e => console.warn('[FCM] broadcast failed:', e.message));
        });
      }
      setTitle(''); setContent(''); setType('info');
      alert('✅ Duyuru başarıyla yayınlandı!');
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string, cur: boolean) => {
    await updateDoc(doc(db, 'announcements', id), { isActive: !cur });
  };

  const remove = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istiyor musunuz?')) return;
    await deleteDoc(doc(db, 'announcements', id));
  };

  const typeStyles: Record<string, string> = {
    info:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    warning:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    promotion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-violet-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Duyurular</h1>
          <p className="text-sm text-slate-400">Kullanıcılara bildirim ve duyuru gönder</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-bold text-base text-slate-700 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-500" />
            Yeni Duyuru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Başlık</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: Sistem Kampanyası"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors text-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mesaj</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Duyuru detayını buraya yazın..."
                rows={4}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors text-slate-800 dark:text-white resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tür</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer text-slate-800 dark:text-white"
              >
                <option value="info">ℹ️ Bilgi (Info)</option>
                <option value="warning">⚠️ Uyarı (Warning)</option>
                <option value="promotion">🎉 Promosyon (Promotion)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</> : <><Send className="w-4 h-4" /> Duyuruyu Yayınla</>}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-700 dark:text-white">Yayınlanan Duyurular</h2>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">{announcements.length} adet</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16 gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-semibold">Henüz duyuru yok</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-700 dark:text-white truncate">{ann.title}</h3>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${typeStyles[ann.type] || typeStyles.info}`}>{ann.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{ann.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(ann.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(ann.id, ann.isActive)}
                      title={ann.isActive ? 'Deaktif et' : 'Aktif et'}
                      className={`p-1.5 rounded-lg transition-colors ${ann.isActive ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {ann.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => remove(ann.id)} className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
