'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/Card';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { getAppointments, getClients } from '@/lib/store';
import { Appointment, Client } from '@/types';
import { clients as mockClients, sseps } from '@/lib/mockData';
import { Clock, ChevronRight, User, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setAppointments(getAppointments().filter(a => a.date === '2026-06-07'));
    setClients(getClients());
  }, []);

  const total = appointments.length;
  const checkedIn = appointments.filter(a => a.status === 'Arrived' || a.status === 'In Progress').length;
  const completed = appointments.filter(a => a.status === 'Completed').length;
  const pending = appointments.filter(a => a.status === 'Pending').length;

  function getClient(clientId: string) {
    return clients.find(c => c.id === clientId);
  }
  function getSSEP(ssepId: string) {
    return sseps.find(s => s.id === ssepId);
  }

  return (
    <div>
      <Header />
      <div className="px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Today's Appointments" value={total} color="indigo" />
          <StatCard label="Checked In / In Progress" value={checkedIn} color="emerald" />
          <StatCard label="Completed" value={completed} sub="sessions done" color="emerald" />
          <StatCard label="Pending" value={pending} sub="upcoming today" color="amber" />
        </div>

        {/* Today's Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Today's Schedule</h2>
            <Link href="/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.map(appt => {
              const client = getClient(appt.clientId);
              const ssep = getSSEP(appt.ssepId);
              if (!client) return null;

              return (
                <Card key={appt.id} className="hover:border-indigo-200 transition-colors cursor-pointer" padding={false}>
                  <Link href={`/clients/${client.id}`} className="flex items-center gap-5 p-5">
                    {/* Time */}
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <Clock size={14} className="text-indigo-400" />
                      <span className="text-sm font-semibold text-slate-700">{appt.time}</span>
                    </div>

                    {/* Client info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 text-sm font-semibold">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{client.firstName} {client.lastName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{appt.service}</p>
                      </div>
                    </div>

                    {/* SSEP */}
                    <div className="w-32 flex-shrink-0 hidden md:block">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500 truncate">{ssep?.name}</span>
                      </div>
                    </div>

                    {/* Risk + Status */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <RiskBadge risk={client.comfortRisk} />
                      <StatusBadge status={appt.status} />
                    </div>

                    {/* ACC link */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {appt.status === 'Pending' && (
                        <Link
                          href={`/clients/${client.id}/acc?apptId=${appt.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md px-2.5 py-1 hover:bg-indigo-100 transition-colors font-medium"
                        >
                          Check In
                        </Link>
                      )}
                      {appt.status === 'Completed' && (
                        <Link
                          href={`/appointments/${appt.id}/notes`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs bg-slate-50 text-slate-600 border border-slate-200 rounded-md px-2.5 py-1 hover:bg-slate-100 transition-colors font-medium"
                        >
                          Notes
                        </Link>
                      )}
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* High-risk flag */}
        {appointments.some(a => {
          const c = getClient(a.clientId);
          return c?.comfortRisk === 'High' && a.status === 'Pending';
        }) && (
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-amber-800">High-Support Clients Incoming</p>
                <p className="text-sm text-amber-700 mt-1">
                  One or more pending appointments today involve high-support clients. Review their ECPs and RES setups before arrival.
                </p>
                <div className="flex gap-2 mt-3">
                  {appointments
                    .filter(a => {
                      const c = getClient(a.clientId);
                      return c?.comfortRisk === 'High' && a.status === 'Pending';
                    })
                    .map(a => {
                      const c = getClient(a.clientId);
                      return c ? (
                        <Link
                          key={a.id}
                          href={`/clients/${c.id}/res`}
                          className="text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-md px-2.5 py-1 hover:bg-amber-200 transition-colors font-medium"
                        >
                          Review {c.firstName}'s RES
                        </Link>
                      ) : null;
                    })}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
