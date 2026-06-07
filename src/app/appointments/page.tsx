'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { getAppointments, getClients } from '@/lib/store';
import { sseps } from '@/lib/mockData';
import { Appointment, Client, CheckInStatus } from '@/types';
import { Clock, User, ChevronRight, Calendar } from 'lucide-react';

const STATUS_OPTIONS: CheckInStatus[] = ['Scheduled', 'Arrived', 'In Progress', 'Completed', 'Cancelled'] as unknown as CheckInStatus[];
const ALL_STATUSES = ['All', 'Pending', 'Arrived', 'In Progress', 'Completed', 'Cancelled'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('2026-06-07');

  useEffect(() => {
    setAppointments(getAppointments());
    setClients(getClients());
  }, []);

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchStatus && matchDate;
  });

  function getClient(id: string) {
    return clients.find(c => c.id === id);
  }
  function getSSEP(id: string) {
    return sseps.find(s => s.id === id);
  }

  return (
    <div>
      <Header title="Appointments" subtitle="Full appointment list and management" />
      <div className="px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <span className="text-sm text-slate-400">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Appointment list */}
        <div className="space-y-3">
          {filtered.map(appt => {
            const client = getClient(appt.clientId);
            const ssep = getSSEP(appt.ssepId);
            if (!client) return null;

            return (
              <Card key={appt.id} padding={false} className="hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4 p-5">
                  {/* Time */}
                  <div className="w-24 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-indigo-400" />
                      <span className="text-sm font-bold text-slate-700">{appt.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{appt.date}</p>
                  </div>

                  {/* Client */}
                  <Link href={`/clients/${client.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:text-indigo-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 text-sm font-semibold">{client.firstName[0]}{client.lastName[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{appt.service}</p>
                    </div>
                  </Link>

                  {/* SSEP */}
                  <div className="w-36 flex-shrink-0 hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{ssep?.name || 'Unassigned'}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{appt.durationMinutes}min</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RiskBadge risk={client.comfortRisk} />
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(appt.status === 'Pending' || appt.status === 'Arrived') && (
                      <Link
                        href={`/clients/${client.id}/acc?apptId=${appt.id}`}
                        className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors font-medium"
                      >
                        ACC
                      </Link>
                    )}
                    {appt.status === 'Completed' && (
                      <Link
                        href={`/appointments/${appt.id}/notes`}
                        className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors font-medium"
                      >
                        Notes
                      </Link>
                    )}
                    <Link href={`/clients/${client.id}`}>
                      <ChevronRight size={16} className="text-slate-300 hover:text-indigo-500 transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* ACC data strip */}
                {appt.acc && (
                  <div className="px-5 pb-3 border-t border-slate-50 pt-2.5">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Mood: {['😰','😟','😐','🙂','😊'][appt.acc.moodRating - 1]} {appt.acc.moodRating}/5</span>
                      <span>Sensory: <span className={
                        appt.acc.sensoryCondition === 'Good' ? 'text-emerald-600 font-medium' :
                        appt.acc.sensoryCondition === 'Fair' ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'
                      }>{appt.acc.sensoryCondition}</span></span>
                      <span>Chair: <span className="font-medium text-slate-600">{appt.acc.chairReadiness}</span></span>
                      {appt.acc.caregiverNotesToday && (
                        <span className="truncate max-w-xs text-slate-400">"{appt.acc.caregiverNotesToday}"</span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No appointments found</p>
            <p className="text-sm mt-1">Try changing the date or status filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
