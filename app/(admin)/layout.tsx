'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {DEMO_MODE && (
        <div style={{
          background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '6px 16px',
        }}>
          🎭 DEMO MODE — Admin panel · mock data only
        </div>
      )}

      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content — offset by sidebar on desktop */}
      <div className="lg:pl-56">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Admin</span>
          </div>
        </div>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
