'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  UserCheck,
  PlusCircle,
  Heart,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Client Profiles', icon: Users },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/intake', label: 'New Client Intake', icon: PlusCircle },
  { href: '/ssep', label: 'SSEP Team', icon: UserCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40" style={{ backgroundColor: '#1e1b4b' }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Gifted Hands</p>
            <p className="text-indigo-300 text-xs">Experience System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-indigo-400 text-xs font-medium uppercase tracking-wider px-3 mb-3">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* System label */}
      <div className="px-4 py-4 border-t border-indigo-900">
        <div className="bg-indigo-900/60 rounded-lg px-3 py-2.5">
          <p className="text-indigo-300 text-xs font-medium">System Modules</p>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-indigo-400 text-xs">ECP · ICPS · RES · ACC</p>
          </div>
        </div>
        <p className="text-indigo-500 text-xs mt-3 leading-relaxed">
          Internal operational tool. Not a clinical platform.
        </p>
      </div>
    </aside>
  );
}
