'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { getAppointments, getClients, getPostVisitNotes, addPostVisitNote } from '@/lib/store';
import { sseps } from '@/lib/mockData';
import { Appointment, Client, PostVisitNote, ReturnLikelihood } from '@/types';
import { ChevronLeft, CheckCircle, Star } from 'lucide-react';

const CALMING_TOOLS = [
  'Tablet/video', 'Fidget toy', 'Weighted lap pad', 'Counting aloud',
  'Caregiver singing', 'Deep pressure', 'Bubble machine', 'Music/earbuds',
  'Verbal narration', 'Breaks between steps', 'Social story',
];

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => onChange(i)}>
            <Star
              size={24}
              className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500">{value}/5</span>
      </div>
    </div>
  );
}

function TagSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
            selected.includes(opt)
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function PostVisitNotesPage() {
  const params = useParams();
  const router = useRouter();
  const apptId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [existingNote, setExistingNote] = useState<PostVisitNote | null>(null);
  const [saved, setSaved] = useState(false);

  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidntWork, setWhatDidntWork] = useState('');
  const [triggersText, setTriggersText] = useState('');
  const [calmingTools, setCalmingTools] = useState<string[]>([]);
  const [transitionRating, setTransitionRating] = useState(3);
  const [comfortRating, setComfortRating] = useState(3);
  const [recommendedChanges, setRecommendedChanges] = useState('');
  const [caregiverFeedback, setCaregiverFeedback] = useState('');
  const [likelyToReturn, setLikelyToReturn] = useState<ReturnLikelihood>('Yes');

  useEffect(() => {
    const appts = getAppointments();
    const appt = appts.find(a => a.id === apptId);
    setAppointment(appt || null);

    if (appt) {
      const cls = getClients();
      setClient(cls.find(c => c.id === appt.clientId) || null);
    }

    const notes = getPostVisitNotes();
    const existing = notes.find(n => n.appointmentId === apptId);
    if (existing) {
      setExistingNote(existing);
      setWhatWorked(existing.whatWorked);
      setWhatDidntWork(existing.whatDidntWork);
      setTriggersText(existing.triggersObserved.join(', '));
      setCalmingTools(existing.calmingToolsUsed);
      setTransitionRating(existing.transitionSuccessRating);
      setComfortRating(existing.clientComfortRating);
      setRecommendedChanges(existing.recommendedChanges);
      setCaregiverFeedback(existing.caregiverFeedback);
      setLikelyToReturn(existing.likelyToReturn);
    }
  }, [apptId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const note: PostVisitNote = {
      id: existingNote?.id || `note-${Date.now()}`,
      appointmentId: apptId,
      clientId: client?.id || '',
      whatWorked,
      whatDidntWork,
      triggersObserved: triggersText.split(',').map(t => t.trim()).filter(Boolean),
      calmingToolsUsed: calmingTools,
      transitionSuccessRating: transitionRating,
      clientComfortRating: comfortRating,
      recommendedChanges,
      caregiverFeedback,
      likelyToReturn,
      timestamp: new Date().toISOString(),
    };
    addPostVisitNote(note);
    setSaved(true);
    setTimeout(() => router.push(`/clients/${client?.id}`), 2000);
  };

  if (!appointment || !client) {
    return (
      <div>
        <Header title="Post-Visit Notes" />
        <div className="px-8 py-16 text-center text-slate-400">Appointment not found.</div>
      </div>
    );
  }

  if (saved) {
    return (
      <div>
        <Header title="Post-Visit Notes" />
        <div className="px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <p className="text-xl font-semibold text-slate-800">Notes Saved</p>
          <p className="text-slate-500 mt-2">Redirecting to client profile...</p>
        </div>
      </div>
    );
  }

  const ssep = sseps.find(s => s.id === appointment.ssepId);
  const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none";

  return (
    <div>
      <Header title="Post-Visit Notes" subtitle={`${client.firstName} ${client.lastName} · ${appointment.date}`} />
      <div className="px-8 py-6 max-w-3xl">
        <Link href={`/clients/${client.id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-5">
          <ChevronLeft size={16} /> Back to client
        </Link>

        {/* Summary */}
        <Card className="bg-indigo-900 border-0 text-white mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{client.firstName} {client.lastName}</p>
              <p className="text-indigo-300 text-sm">{appointment.time} · {appointment.service}</p>
            </div>
            {ssep && <p className="text-indigo-300 text-sm">SSEP: {ssep.name}</p>}
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardTitle className="mb-4">Session Reflections</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What worked well?</label>
                <textarea className={inputCls} rows={3} value={whatWorked} onChange={e => setWhatWorked(e.target.value)} placeholder="e.g. Train video kept them regulated. Counting steps helped with transitions." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What didn't work / areas for improvement?</label>
                <textarea className={inputCls} rows={3} value={whatDidntWork} onChange={e => setWhatDidntWork(e.target.value)} placeholder="e.g. Clipper near ear caused escalation. Recovered, but noted." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Triggers observed (comma-separated)</label>
                <input className={inputCls} value={triggersText} onChange={e => setTriggersText(e.target.value)} placeholder="e.g. unexpected clipper sound, cold water rinse" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Calming Tools Used</CardTitle>
            <TagSelect options={CALMING_TOOLS} selected={calmingTools} onChange={setCalmingTools} />
          </Card>

          <Card>
            <CardTitle className="mb-5">Ratings</CardTitle>
            <div className="space-y-5">
              <StarRating value={transitionRating} onChange={setTransitionRating} label="Transition Success" />
              <StarRating value={comfortRating} onChange={setComfortRating} label="Overall Client Comfort" />
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Next Visit Planning</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Recommended changes for next visit</label>
                <textarea className={inputCls} rows={3} value={recommendedChanges} onChange={e => setRecommendedChanges(e.target.value)} placeholder="e.g. Try introducing hairdryer on low. Continue train video. Consider ear covering before clipper use." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Caregiver feedback</label>
                <textarea className={inputCls} rows={2} value={caregiverFeedback} onChange={e => setCaregiverFeedback(e.target.value)} placeholder="What did the caregiver share after the session?" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Likely to Return?</CardTitle>
            <div className="flex gap-3">
              {(['Yes', 'Maybe', 'Needs Follow-up'] as ReturnLikelihood[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setLikelyToReturn(r)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    likelyToReturn === r
                      ? r === 'Yes'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : r === 'Maybe'
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-red-50 border-red-300 text-red-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {existingNote ? 'Update Notes' : 'Save Post-Visit Notes'}
          </button>
        </form>
      </div>
    </div>
  );
}
