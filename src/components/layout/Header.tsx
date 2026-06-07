'use client';

import { format } from 'date-fns';
import { Bell, Settings } from 'lucide-react';
import { getSSEPName } from '@/lib/store';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [ssepName, setSSEPName] = useState('Jordan M.');
  const today = format(new Date('2026-06-07'), 'EEEE, MMMM d, yyyy');

  useEffect(() => {
    setSSEPName(getSSEPName());
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        {title ? (
          <>
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-800">Welcome, {ssepName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{today}</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
          <Bell size={16} />
        </button>
        <button className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {ssepName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-700">{ssepName}</p>
            <p className="text-xs text-slate-400">SSEP</p>
          </div>
        </div>
      </div>
    </header>
  );
}
