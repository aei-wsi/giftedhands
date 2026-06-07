'use client';

import Header from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { sseps } from '@/lib/mockData';
import { getAppointments, getClients } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Appointment, Client } from '@/types';
import Link from 'next/link';
import { Calendar, Tag, Users } from 'lucide-react';

export default function SSEPPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setAppointments(getAppointments());
    setClients(getClients());
  }, []);

  function getSSEPAppointments(ssepId: string) {
    return appointments.filter(a => a.ssepId === ssepId && a.date === '2026-06-07');
  }

  function getClient(clientId: string) {
    return clients.find(c => c.id === clientId);
  }

  return (
    <div>
      <Header title="SSEP Team" subtitle="Sensory-Supportive Experience Professionals" />
      <div className="px-8 py-6">
        <div className="grid grid-cols-2 gap-5">
          {sseps.map(ssep => {
            const todayAppts = getSSEPAppointments(ssep.id);

            return (
              <Card key={ssep.id} className="hover:border-indigo-200 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {ssep.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{ssep.name}</p>
                      <p className="text-sm text-slate-500">{ssep.role}</p>
                    </div>
                  </div>
                  <AvailabilityBadge availability={ssep.availability} />
                </div>

                {/* Bio */}
                {ssep.bio && (
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{ssep.bio}</p>
                )}

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag size={12} className="text-indigo-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ssep.skills.map(skill => (
                      <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Today's clients */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar size={12} className="text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments ({todayAppts.length})</p>
                  </div>
                  {todayAppts.length === 0 ? (
                    <p className="text-xs text-slate-400">No appointments today</p>
                  ) : (
                    <div className="space-y-1.5">
                      {todayAppts.map(appt => {
                        const client = getClient(appt.clientId);
                        return client ? (
                          <Link
                            key={appt.id}
                            href={`/clients/${client.id}`}
                            className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 hover:bg-indigo-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                                {client.firstName[0]}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{client.firstName} {client.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{appt.time}</span>
                              <span className={`text-xs font-medium ${
                                appt.status === 'Completed' ? 'text-emerald-600' :
                                appt.status === 'In Progress' ? 'text-indigo-600' :
                                appt.status === 'Arrived' ? 'text-blue-600' : 'text-slate-400'
                              }`}>{appt.status}</span>
                            </div>
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Team summary */}
        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-indigo-600" />
            <p className="font-semibold text-indigo-800">Team at a Glance</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-indigo-600 font-bold text-xl">{sseps.filter(s => s.availability === 'Available').length}</p>
              <p className="text-indigo-500">Available now</p>
            </div>
            <div>
              <p className="text-amber-600 font-bold text-xl">{sseps.filter(s => s.availability === 'Busy').length}</p>
              <p className="text-slate-500">In session</p>
            </div>
            <div>
              <p className="text-slate-600 font-bold text-xl">{sseps.filter(s => s.availability === 'Off').length}</p>
              <p className="text-slate-500">Off today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
