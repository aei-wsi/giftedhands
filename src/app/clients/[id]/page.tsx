'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RiskBadge, Badge } from '@/components/ui/Badge';
import { getClients, getAppointments, getPostVisitNotes } from '@/lib/store';
import { sseps } from '@/lib/mockData';
import { Client, Appointment, PostVisitNote } from '@/types';
import {
  MessageSquare, Zap, Heart, ArrowRight, Star, AlertTriangle,
  Calendar, User, FileText, ChevronRight, Clipboard
} from 'lucide-react';

function TagList({ items, color = 'slate' }: { items: string[]; color?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span key={item} className={`text-xs bg-${color}-100 text-${color}-700 rounded-full px-2.5 py-0.5 border border-${color}-200`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon size={14} className="text-indigo-600" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}

export default function ECPPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<PostVisitNote[]>([]);

  useEffect(() => {
    const clients = getClients();
    const found = clients.find(c => c.id === id);
    setClient(found || null);

    const allAppts = getAppointments();
    setAppointments(allAppts.filter(a => a.clientId === id));

    const allNotes = getPostVisitNotes();
    setNotes(allNotes.filter(n => n.clientId === id));
  }, [id]);

  if (!client) {
    return (
      <div>
        <Header title="Client Profile" />
        <div className="px-8 py-16 text-center text-slate-400">Client not found.</div>
      </div>
    );
  }

  const { ecp, res, caregiver } = client;

  return (
    <div>
      <Header title={`${client.firstName} ${client.lastName}`} subtitle="Experience & Comfort Profile" />
      <div className="px-8 py-6 space-y-6">
        {/* Hero card */}
        <Card className="bg-gradient-to-r from-indigo-900 to-indigo-700 border-0 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{client.firstName} {client.lastName}</h2>
                <p className="text-indigo-200 mt-0.5">{client.pronouns} · Age {client.age}</p>
                <div className="flex gap-2 mt-2">
                  <RiskBadge risk={client.comfortRisk} />
                  {client.isNewClient && <Badge variant="info">New Client</Badge>}
                  {client.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-xs bg-white/20 text-white rounded-full px-2.5 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/clients/${id}/res`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText size={14} /> RES Setup
              </Link>
              <Link
                href={`/clients/${id}/acc`}
                className="px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
              >
                <Clipboard size={14} /> Check In (ACC)
              </Link>
            </div>
          </div>
          {client.lastVisitDate && (
            <p className="text-indigo-300 text-sm mt-4 flex items-center gap-1.5">
              <Calendar size={13} /> Last visit: {client.lastVisitDate}
            </p>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Left col */}
          <div className="col-span-2 space-y-4">
            <Section icon={MessageSquare} title="Communication Style">
              <p className="text-sm text-slate-600">{ecp.communicationStyle}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-medium">Verbal Ability</p>
                  <p className="text-sm text-slate-700 mt-1">{ecp.verbalAbility}</p>
                </div>
                {ecp.primaryLanguage && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-medium">Primary Language</p>
                    <p className="text-sm text-slate-700 mt-1">{ecp.primaryLanguage}</p>
                  </div>
                )}
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-4">
              <Section icon={AlertTriangle} title="Sensory Sensitivities">
                <TagList items={ecp.sensoryAvoidances} color="red" />
              </Section>
              <Section icon={Heart} title="Sensory Preferences">
                <TagList items={ecp.sensoryPreferences} color="emerald" />
              </Section>
            </div>

            <Section icon={Zap} title="Calming Strategies">
              <div className="flex flex-wrap gap-2">
                {ecp.calmingStrategies.map(s => (
                  <span key={s} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5">{s}</span>
                ))}
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-4">
              <Section icon={ArrowRight} title="Transitions">
                <p className="text-sm text-slate-600">{ecp.transitionSupport}</p>
              </Section>
              <Section icon={Star} title="Motivators">
                <TagList items={ecp.motivators} color="amber" />
              </Section>
            </div>

            <Section icon={AlertTriangle} title="Things to Avoid (Triggers)">
              <div className="flex flex-wrap gap-2">
                {ecp.triggers.map(t => (
                  <span key={t} className="text-xs bg-red-50 text-red-700 border border-red-100 rounded-full px-2.5 py-0.5">⚠ {t}</span>
                ))}
              </div>
            </Section>

            {ecp.staffNotes && (
              <Section icon={FileText} title="Staff Notes">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{ecp.staffNotes}</p>
                </div>
              </Section>
            )}
          </div>

          {/* Right col */}
          <div className="space-y-4">
            {/* Caregiver */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-indigo-600" />
                  <CardTitle>Caregiver</CardTitle>
                </div>
              </CardHeader>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-slate-800">{caregiver.name}</p>
                <p className="text-slate-500">{caregiver.relationship}</p>
                <p className="text-slate-600">{caregiver.phone}</p>
                {caregiver.email && <p className="text-slate-600 text-xs">{caregiver.email}</p>}
                {caregiver.notes && (
                  <div className="mt-3 bg-slate-50 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500">{caregiver.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* RES Summary */}
            <Card className="border-indigo-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>RES Summary</CardTitle>
                  <Link href={`/clients/${id}/res`} className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
                    Full setup <ChevronRight size={12} />
                  </Link>
                </div>
              </CardHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lighting</span>
                  <span className="text-slate-700 text-right text-xs max-w-[140px]">{res.lighting.split('.')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sound</span>
                  <span className="text-slate-700 text-right text-xs max-w-[140px]">{res.soundLevel.split('.')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SSEP</span>
                  <span className="text-indigo-600 text-xs font-medium">{res.ssepRecommendation.split(' (')[0]}</span>
                </div>
              </div>
            </Card>

            {/* Visit History */}
            <Card>
              <CardHeader>
                <CardTitle>Visit History</CardTitle>
              </CardHeader>
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-400">No appointments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {appointments.slice(-5).reverse().map(appt => (
                    <div key={appt.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-xs font-medium text-slate-700">{appt.date} at {appt.time}</p>
                        <p className="text-xs text-slate-400">{appt.service}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${appt.status === 'Completed' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {appt.status}
                        </span>
                        {notes.find(n => n.appointmentId === appt.id) && (
                          <Link href={`/appointments/${appt.id}/notes`}>
                            <FileText size={12} className="text-indigo-400 hover:text-indigo-600" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Grooming History */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardTitle className="mb-3">Grooming History</CardTitle>
            <p className="text-sm text-slate-600">{ecp.groomingHistory}</p>
          </Card>
          <Card>
            <CardTitle className="mb-3">Visit Goals</CardTitle>
            <p className="text-sm text-slate-600">{ecp.visitGoals}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
