'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { getClients } from '@/lib/store';
import { Client } from '@/types';
import { Lightbulb, Volume2, Armchair, Smile, Eye, Zap, Clock, AlertTriangle, User, ChevronLeft } from 'lucide-react';

function ResBlock({ icon: Icon, label, value, color = 'indigo' }: { icon: any; label: string; value: string; color?: string }) {
  const bg = color === 'red' ? 'bg-red-50 border-red-100' : color === 'amber' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100';
  const iconColor = color === 'red' ? 'text-red-500' : color === 'amber' ? 'text-amber-500' : 'text-indigo-500';
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={iconColor} />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

export default function RESPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const clients = getClients();
    setClient(clients.find(c => c.id === id) || null);
  }, [id]);

  if (!client) {
    return (
      <div>
        <Header title="RES" subtitle="Recommended Experience Setup" />
        <div className="px-8 py-16 text-center text-slate-400">Client not found.</div>
      </div>
    );
  }

  const { res } = client;

  return (
    <div>
      <Header
        title="Recommended Experience Setup"
        subtitle={`${client.firstName} ${client.lastName} · RES`}
      />
      <div className="px-8 py-6 space-y-6">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <Link href={`/clients/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={16} /> Back to ECP
          </Link>
        </div>

        {/* Client summary */}
        <Card className="bg-indigo-900 border-0 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-lg">{client.firstName} {client.lastName}</p>
                <p className="text-indigo-300 text-sm">{client.pronouns} · Age {client.age}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge risk={client.comfortRisk} />
              <Link
                href={`/clients/${id}/acc`}
                className="px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Start ACC Check-In
              </Link>
            </div>
          </div>
        </Card>

        {/* Environment setup */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Environment Setup</h2>
          <div className="grid grid-cols-3 gap-3">
            <ResBlock icon={Lightbulb} label="Lighting" value={res.lighting} />
            <ResBlock icon={Volume2} label="Sound Level" value={res.soundLevel} />
            <ResBlock icon={Armchair} label="Chair Setup" value={res.chairType} />
          </div>
        </div>

        {/* Calming & Visuals */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Smile size={16} className="text-indigo-500" /> Calming Tools
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {res.calmingTools.map(tool => (
                <span key={tool} className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1">
                  {tool}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Eye size={16} className="text-indigo-500" /> Visual Supports
            </CardTitle>
            <p className="text-sm text-slate-600">{res.visuals}</p>
          </Card>
        </div>

        {/* Pacing */}
        <div className="grid grid-cols-2 gap-4">
          <ResBlock icon={Zap} label="Service Pacing" value={res.servicePacing} color="amber" />
          <ResBlock icon={Clock} label="Transition Time Estimate" value={res.transitionTimeEstimate} color="amber" />
        </div>

        {/* Do NOT use */}
        <Card className="border-red-200">
          <CardTitle className="mb-4 flex items-center gap-2 text-red-700">
            <AlertTriangle size={16} /> Do-Not-Use Triggers
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {res.doNotUseTriggers.map(trigger => (
              <span key={trigger} className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 flex items-center gap-1">
                ⚠ {trigger}
              </span>
            ))}
          </div>
        </Card>

        {/* SSEP recommendation */}
        <Card className="border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-indigo-600" />
            <CardTitle>SSEP Recommendation</CardTitle>
          </div>
          <p className="text-indigo-800 font-medium">{res.ssepRecommendation}</p>
          <Link
            href="/ssep"
            className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View SSEP team & assign →
          </Link>
        </Card>
      </div>
    </div>
  );
}
