'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { getClients, getAppointments, updateAppointmentACC } from '@/lib/store';
import { Client, Appointment, SensoryCondition, ChairReadiness, ACC } from '@/types';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

const MOODS = ['😰', '😟', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Very Anxious', 'Unsettled', 'Neutral', 'Calm', 'Happy & Ready'];

function ACCForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const apptId = searchParams.get('apptId') || '';

  const [client, setClient] = useState<Client | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [saved, setSaved] = useState(false);

  const [mood, setMood] = useState(3);
  const [changes, setChanges] = useState('');
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [sensoryCondition, setSensoryCondition] = useState<SensoryCondition>('Good');
  const [chairReadiness, setChairReadiness] = useState<ChairReadiness>('Yes');
  const [delayMinutes, setDelayMinutes] = useState(0);

  useEffect(() => {
    const clients = getClients();
    setClient(clients.find(c => c.id === id) || null);
    if (apptId) {
      const appts = getAppointments();
      setAppointment(appts.find(a => a.id === apptId) || null);
    }
  }, [id, apptId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptId) return;

    const acc: ACC = {
      appointmentId: apptId,
      timestamp: new Date().toISOString(),
      moodRating: mood,
      changesSinceLastVisit: changes,
      caregiverNotesToday: caregiverNotes,
      sensoryCondition,
      chairReadiness,
      recommendedDelayMinutes: delayMinutes,
      resUpdated: false,
    };

    updateAppointmentACC(apptId, acc);
    setSaved(true);
    setTimeout(() => router.push(`/clients/${id}`), 2000);
  };

  if (!client) {
    return <div className="px-8 py-16 text-center text-slate-400">Client not found.</div>;
  }

  if (saved) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
        <p className="text-xl font-semibold text-slate-800">ACC Check-In Saved</p>
        <p className="text-slate-500 mt-2">Redirecting to client profile...</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <Link href={`/clients/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ChevronLeft size={16} /> Back to ECP
      </Link>

      <Card className="bg-indigo-900 border-0 text-white">
        <p className="text-lg font-semibold">{client.firstName} {client.lastName}</p>
        <p className="text-indigo-300 text-sm">{client.pronouns} · Age {client.age}</p>
        {appointment && (
          <p className="text-indigo-400 text-xs mt-1">{appointment.time} — {appointment.service}</p>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mood */}
        <Card>
          <CardTitle className="mb-4">How is {client.firstName} feeling right now?</CardTitle>
          <div className="flex gap-4 justify-center">
            {MOODS.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMood(i + 1)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  mood === i + 1
                    ? 'bg-indigo-100 border-2 border-indigo-400 scale-110'
                    : 'border-2 border-transparent hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs text-slate-500">{MOOD_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Changes */}
        <Card>
          <CardTitle className="mb-3">Any changes since the last visit?</CardTitle>
          <textarea
            value={changes}
            onChange={e => setChanges(e.target.value)}
            placeholder="Note any behavioral, medical, or situational changes..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </Card>

        {/* Caregiver notes */}
        <Card>
          <CardTitle className="mb-3">Caregiver notes today</CardTitle>
          <textarea
            value={caregiverNotes}
            onChange={e => setCaregiverNotes(e.target.value)}
            placeholder="What did the caregiver share on arrival?"
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </Card>

        {/* Sensory condition */}
        <Card>
          <CardTitle className="mb-3">Sensory Condition on Arrival</CardTitle>
          <div className="flex gap-3">
            {(['Good', 'Fair', 'Cautious'] as SensoryCondition[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSensoryCondition(s)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all border-2 ${
                  sensoryCondition === s
                    ? s === 'Good'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : s === 'Fair'
                      ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'bg-red-50 border-red-400 text-red-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {s === 'Good' ? '✅ ' : s === 'Fair' ? '⚠️ ' : '🔴 '}{s}
              </button>
            ))}
          </div>
        </Card>

        {/* Chair readiness */}
        <Card>
          <CardTitle className="mb-3">Ready for the Chair?</CardTitle>
          <div className="flex gap-3">
            {(['Yes', 'Not Yet', 'Need Decompression'] as ChairReadiness[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setChairReadiness(r)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all border-2 ${
                  chairReadiness === r
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {chairReadiness !== 'Yes' && (
            <div className="mt-4">
              <label className="text-sm text-slate-600 font-medium">Recommended delay (minutes)</label>
              <div className="flex gap-2 mt-2">
                {[5, 10, 15, 20, 30].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDelayMinutes(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      delayMinutes === m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {m}min
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Save ACC Check-In
          </button>
          <Link
            href={`/clients/${id}/res`}
            className="px-5 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center"
          >
            View RES Setup
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ACCPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <Header title="Arrival Comfort Check-In" subtitle="ACC · Real-time arrival assessment" />
      <Suspense fallback={<div className="px-8 py-16 text-center text-slate-400">Loading...</div>}>
        <ACCForm />
      </Suspense>
    </div>
  );
}
