'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/admin',               icon: '📊', label: 'Dashboard',    exact: true },
  { href: '/admin/properties',    icon: '🏠', label: 'Properties' },
  { href: '/admin/agencies',      icon: '🏢', label: 'Agencies' },
  { href: '/admin/distributions', icon: '📤', label: 'Distributions' },
  { href: '/admin/users',         icon: '👥', label: 'Users' },
  { href: '/admin/billing',       icon: '💳', label: 'Billing' },
  { href: '/admin/settings',      icon: '⚙️', label: 'Settings' },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">PropSeller AI</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">✕</button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
        >
          ↗ View public site
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
        >
          ← Owner dashboard
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gray-900 flex flex-col">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
