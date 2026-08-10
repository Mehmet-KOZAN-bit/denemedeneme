'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, X, CheckCircle2, Link2 } from 'lucide-react';
import { uploadToSupabase } from '../utils/supabase';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholderUrl?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Görsel / Logo',
  folder = 'store-uploads',
  placeholderUrl = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP vs.).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10 MB\'tan küçük olmalıdır.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const publicUrl = await uploadToSupabase(file, folder);
      onChange(publicUrl);
    } catch (err: any) {
      console.error('Supabase upload error:', err);
      setErrorMsg(err.message || 'Yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'Bilgisayardan Seç' : 'Manuel URL Gir'}</span>
        </button>
      </div>

      {value ? (
        <div className="relative group bg-slate-950 border border-slate-800 rounded-2xl p-2 flex items-center gap-3">
          <img
            src={value}
            alt="Önizleme"
            className="w-16 h-16 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Görsel Hazır</span>
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">{value}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            title="Görseli kaldır"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : showUrlInput ? (
        <div className="space-y-1.5">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... veya doğrudan resim URL'si"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-emerald-500/50 bg-emerald-950/20 opacity-75'
              : 'border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950/60 bg-slate-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <p className="text-xs font-bold text-emerald-400">Supabase'e Fotoğraf Yükleniyor...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Bilgisayarınızdan Fotoğraf Seçmek İçin Tıklayın
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, WEBP (Max 10MB) • Supabase Storage Entegre
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-400 mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
