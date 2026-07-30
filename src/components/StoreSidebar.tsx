'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Store, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StoreSidebarProps {
  isTr: boolean;
  setIsTr: (val: boolean) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export function StoreSidebar({ isTr, setIsTr, collapsed, setCollapsed }: StoreSidebarProps) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const storeName = profile?.storeInfo?.storeName || profile?.displayName || 'Kurumsal Mağaza';
  const city = profile?.storeInfo?.city || 'Kıbrıs';
  const photoURL = profile?.photoURL;

  const navItems = [
    {
      label: isTr ? 'Mağaza Özeti' : 'Dashboard',
      href: '/store/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: isTr ? 'Mağaza İlanlarım' : 'My Listings',
      href: '/store/listings',
      icon: Package,
    },
    {
      label: isTr ? 'Yeni İlan Paylaş' : 'Add New Listing',
      href: '/store/add-listing',
      icon: PlusCircle,
    },
    {
      label: isTr ? 'Mağaza Ayarları' : 'Store Settings',
      href: '/store/settings',
      icon: Store,
    },
  ];

  return (
    <aside
      className={`relative bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white leading-tight">AdaBazar</span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">MAĞAZA PORTALI</span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg mx-auto">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Store Profile Hero Badge */}
        {!collapsed && (
          <div className="p-4 mx-3 mt-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex items-center gap-3">
            {photoURL ? (
              <img src={photoURL} alt={storeName} className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-base border border-emerald-500/30">
                {storeName[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white truncate">{storeName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-400 block truncate">{city} • Kurumsal Mağaza</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/store/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Controls */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setIsTr(!isTr)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          {!collapsed && <span>{isTr ? 'English Version' : 'Türkçe Sürüm'}</span>}
        </button>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          {!collapsed && <span>{isTr ? 'Çıkış Yap' : 'Log Out'}</span>}
        </button>
      </div>
    </aside>
  );
}
