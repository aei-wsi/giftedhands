'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { getClients } from '@/lib/store';
import { Client } from '@/types';
import { Search, ChevronRight, Calendar } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filtered = clients.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchRisk = riskFilter === 'All' || c.comfortRisk === riskFilter;
    return matchSearch && matchRisk;
  });

  return (
    <div>
      <Header title="Client Profiles" subtitle="View and manage Experience & Comfort Profiles" />
      <div className="px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Low', 'Moderate', 'High'].map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  riskFilter === r
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Link
            href="/intake"
            className="ml-auto px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            + New Client Intake
          </Link>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-700 font-semibold">
                        {client.firstName[0]}{client.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-slate-400">{client.pronouns} · Age {client.age}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 mt-1" />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <RiskBadge risk={client.comfortRisk} />
                  {client.isNewClient && (
                    <Badge variant="info">New Client</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {client.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 pt-3 mt-auto">
                  <Calendar size={12} />
                  {client.lastVisitDate
                    ? `Last visit: ${client.lastVisitDate}`
                    : 'No previous visits'}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No clients found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
