'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, Bell, Flag, Settings,
  LogOut, Globe, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth, db } from '../context/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';

const navItems = [
  { href: '/',               icon: LayoutDashboard, labelTr: 'Dashboard',          labelEn: 'Dashboard',     badge: null as string | null },
  { href: '/listings',       icon: Package,          labelTr: 'İlan Yönetimi',      labelEn: 'Listings',      badge: null },
  { href: '/users',          icon: Users,            labelTr: 'Kullanıcılar',        labelEn: 'Users',         badge: 'pending_phone' },
  { href: '/announcements',  icon: Bell,             labelTr: 'Duyurular',           labelEn: 'Announcements', badge: null },
  { href: '/reports',        icon: Flag,             labelTr: 'Raporlar',            labelEn: 'Reports',       badge: null },
  { href: '/settings',       icon: Settings,         labelTr: 'Ayarlar',             labelEn: 'Settings',      badge: null },
];

interface SidebarProps {
  isTr: boolean;
  setIsTr: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ isTr, setIsTr, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [pendingPhoneCount, setPendingPhoneCount] = useState(0);

  // Real-time pending phone verification count
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const count = snap.docs.filter(d => {
        const data = d.data();
        return data.phone && data.isPhoneVerified !== true;
      }).length;
      setPendingPhoneCount(count);
    });
    return () => unsub();
  }, [user]);

  const getBadgeCount = (badge: string | null) => {
    if (badge === 'pending_phone') return pendingPhoneCount;
    return 0;
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 shrink-0 hidden md:flex flex-col bg-slate-900 text-white h-screen sticky top-0 overflow-hidden`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center font-black text-sm shadow-lg shrink-0">AB</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-extrabold text-sm text-teal-400 truncate">AdaBazar</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-white transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const badgeCount = getBadgeCount(item.badge);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isTr ? item.labelTr : item.labelEn}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group
                ${isActive
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="relative shrink-0">
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-white'}`} />
                {/* Notification dot when collapsed */}
                {collapsed && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-slate-900 flex items-center justify-center">
                    <span className="text-[7px] font-black text-white">{badgeCount > 9 ? '9+' : badgeCount}</span>
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{isTr ? item.labelTr : item.labelEn}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        {/* Lang toggle */}
        <button
          onClick={() => setIsTr(!isTr)}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{isTr ? 'English' : 'Türkçe'}</span>}
        </button>

        {/* Profile */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800">
            {user.photoURL
              ? <img src={user.photoURL} className="w-7 h-7 rounded-full object-cover" alt="avatar" />
              : <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-xs font-black">{user.displayName?.charAt(0) || 'A'}</div>
            }
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{profile?.displayName || user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}

/* Mobile top bar */
export function MobileTopBar({ isTr, onMenuClick }: { isTr: boolean; onMenuClick: () => void }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-xs">AB</div>
        <span className="font-extrabold text-sm text-teal-400">AdaBazar Admin</span>
      </div>
      <button onClick={onMenuClick}><Menu className="w-5 h-5" /></button>
    </div>
  );
}
