'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { saveICPS } from '@/lib/store';
import { ICPSSubmission } from '@/types';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  'Basic Info',
  'Caregiver Info',
  'Communication & Sensory',
  'Sensitivities & Calming',
  'Grooming History',
  'Emergency & Consent',
];

const COMMUNICATION_STYLES = [
  'Fully verbal',
  'Verbal with visual supports',
  'Limited verbal — picture exchange',
  'AAC device user',
  'Gestural / non-verbal',
  'Echolalic',
];

const VERBAL_ABILITIES = [
  'Fully verbal, age-appropriate',
  'Verbal, may shut down under stress',
  'Limited functional speech (5–20 words)',
  'Minimal speech — communicates non-verbally',
  'Non-speaking',
];

const SENSORY_PREFS = [
  'Light pressure touch', 'Deep pressure touch', 'Warm water', 'Cold water',
  'Soft brushes', 'Scalp massage', 'Music / audio', 'Visual stimulation',
  'Fidget tools', 'Weighted items', 'Familiar caregiver proximity', 'Quiet environment',
];

const SENSORY_AVOIDANCES = [
  'Loud clippers', 'Buzzing sounds near head', 'Water on face', 'Unexpected touch',
  'Strong scents', 'Bright lights', 'Mirrors', 'Neck cape', 'Cold water',
  'Hair dryer heat', 'Multiple people talking', 'Crowded space',
];

const CALMING_STRATEGIES = [
  'Tablet / video', 'Fidget toy', 'Caregiver singing', 'Counting aloud',
  'Deep breathing', 'Weighted lap pad', 'Bubble machine', 'Music via earbuds',
  'Social story review', 'Caregiver proximity', 'Verbal narration of steps', 'Breaks between steps',
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < current
                ? 'bg-emerald-500 text-white'
                : i === current
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium hidden md:block ${i === current ? 'text-indigo-700' : 'text-slate-400'}`}>
            {step}
          </span>
          {i < total - 1 && <div className="w-6 h-px bg-slate-200 mx-1" />}
        </div>
      ))}
    </div>
  );
}

function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
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

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors bg-white";
const selectCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white";

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [pronouns, setPronouns] = useState('');

  // Step 2
  const [cgName, setCgName] = useState('');
  const [cgRel, setCgRel] = useState('');
  const [cgPhone, setCgPhone] = useState('');
  const [cgEmail, setCgEmail] = useState('');
  const [cgNotes, setCgNotes] = useState('');

  // Step 3
  const [commStyle, setCommStyle] = useState('');
  const [verbalAbility, setVerbalAbility] = useState('');
  const [sensoryPrefs, setSensoryPrefs] = useState<string[]>([]);

  // Step 4
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [calming, setCalming] = useState<string[]>([]);
  const [triggers, setTriggers] = useState('');

  // Step 5
  const [groomingHistory, setGroomingHistory] = useState('');
  const [visitGoals, setVisitGoals] = useState('');
  const [transitionSupport, setTransitionSupport] = useState('');

  // Step 6
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const submission: ICPSSubmission = {
      basicInfo: { firstName, lastName, dateOfBirth: dob, pronouns },
      caregiverInfo: { name: cgName, relationship: cgRel, phone: cgPhone, email: cgEmail, notes: cgNotes },
      communicationAndSensory: { communicationStyle: commStyle, verbalAbility, sensoryPreferences: sensoryPrefs },
      sensitivitiesAndCalming: { sensoryAvoidances: avoidances, calmingStrategies: calming, triggers: triggers.split(',').map(t => t.trim()).filter(Boolean) },
      groomingHistory: { groomingHistory, visitGoals, transitionSupport },
      emergencyAndConsent: { emergencyContact, medicalNotes, consentGiven: consent },
    };
    saveICPS(submission);
    setDone(true);
  };

  if (done) {
    return (
      <div>
        <Header title="Intake Complete" subtitle="ICPS Submission Saved" />
        <div className="px-8 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Profile Submitted</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            {firstName}'s intake has been saved. The team can now prepare their Recommended Experience Setup before the first visit.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => { setDone(false); setStep(0); setFirstName(''); setLastName(''); }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Another Client
            </button>
            <button
              onClick={() => router.push('/clients')}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              View All Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="New Client Intake" subtitle="ICPS — Intake & Comfort Profiling System" />
      <div className="px-8 py-6 max-w-3xl">
        <StepIndicator current={step} total={STEPS.length} />

        <Card>
          <CardTitle className="mb-6 text-lg">{STEPS[step]}</CardTitle>

          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input className={inputCls} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Birth" required>
                  <input type="date" className={inputCls} value={dob} onChange={e => setDob(e.target.value)} />
                </Field>
                <Field label="Pronouns" hint="e.g. He/Him, She/Her, They/Them">
                  <input className={inputCls} value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="He/Him" />
                </Field>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
                A photo placeholder can be added after the profile is created. We prioritize comfort over photos on intake day.
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Caregiver Full Name" required>
                  <input className={inputCls} value={cgName} onChange={e => setCgName(e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Relationship to Client" required>
                  <input className={inputCls} value={cgRel} onChange={e => setCgRel(e.target.value)} placeholder="e.g. Mother, Father, Guardian" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone Number" required>
                  <input className={inputCls} value={cgPhone} onChange={e => setCgPhone(e.target.value)} placeholder="555-000-1234" />
                </Field>
                <Field label="Email (optional)">
                  <input type="email" className={inputCls} value={cgEmail} onChange={e => setCgEmail(e.target.value)} placeholder="email@example.com" />
                </Field>
              </div>
              <Field label="Caregiver Notes" hint="Anything the team should know about working with this caregiver">
                <textarea className={`${inputCls} resize-none`} rows={3} value={cgNotes} onChange={e => setCgNotes(e.target.value)} placeholder="e.g. Caregiver prefers to stay in room, speaks Spanish..." />
              </Field>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <Field label="Communication Style" required>
                <select className={selectCls} value={commStyle} onChange={e => setCommStyle(e.target.value)}>
                  <option value="">Select communication style...</option>
                  {COMMUNICATION_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Verbal Ability">
                <select className={selectCls} value={verbalAbility} onChange={e => setVerbalAbility(e.target.value)}>
                  <option value="">Select verbal ability...</option>
                  {VERBAL_ABILITIES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Sensory Preferences" hint="Select all that apply — what feels good to this client?">
                <MultiSelect options={SENSORY_PREFS} selected={sensoryPrefs} onChange={setSensoryPrefs} />
              </Field>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <Field label="Sensory Sensitivities" hint="What environments or experiences feel overwhelming?">
                <MultiSelect options={SENSORY_AVOIDANCES} selected={avoidances} onChange={setAvoidances} />
              </Field>
              <Field label="Calming Strategies" hint="What helps this person feel settled or regulated?">
                <MultiSelect options={CALMING_STRATEGIES} selected={calming} onChange={setCalming} />
              </Field>
              <Field label="Known Triggers" hint="Comma-separated — be specific">
                <textarea className={`${inputCls} resize-none`} rows={2} value={triggers} onChange={e => setTriggers(e.target.value)} placeholder="e.g. sudden loud sounds, water near face, strangers approaching from behind" />
              </Field>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <Field label="Grooming History" hint="What has been tried before? What worked or didn't?">
                <textarea className={`${inputCls} resize-none`} rows={4} value={groomingHistory} onChange={e => setGroomingHistory(e.target.value)} placeholder="e.g. Previous salon visits have been very stressful. Home haircuts done by caregiver with scissors only. Client typically needs 10–15 minutes to warm up..." />
              </Field>
              <Field label="Visit Goals for First Session">
                <textarea className={`${inputCls} resize-none`} rows={3} value={visitGoals} onChange={e => setVisitGoals(e.target.value)} placeholder="e.g. Simply enter the space and feel safe. Any tool introduction is a bonus." />
              </Field>
              <Field label="Transition Support Needed">
                <textarea className={`${inputCls} resize-none`} rows={2} value={transitionSupport} onChange={e => setTransitionSupport(e.target.value)} placeholder="e.g. Needs 2-minute warning before any chair movement. Caregiver must lead transitions." />
              </Field>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <Field label="Emergency Contact" hint="Name, relationship, and number">
                <input className={inputCls} value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="e.g. Maria Rodriguez (Grandmother) — 555-999-2222" />
              </Field>
              <Field label="Medical or Health Notes" hint="Anything that could affect the visit — not used for diagnosis">
                <textarea className={`${inputCls} resize-none`} rows={3} value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="e.g. Client has a sound sensitivity related to a recent ear infection. No known medication interactions with salon products." />
              </Field>
              <div className={`rounded-xl border-2 p-4 transition-colors ${consent ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Caregiver Consent</p>
                    <p className="text-xs text-slate-500 mt-1">
                      I confirm that the caregiver has reviewed this profile, agreed to share this information with the Gifted Hands team, and consents to sensory-supportive service delivery for this client. This is not a clinical record.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!consent}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit Intake Profile
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
