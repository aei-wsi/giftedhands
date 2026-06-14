"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Archetype, Board, BoardMember } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { PERSONA_LIBRARY, seedToMember } from "@/lib/ai/personas";
import { customInputToMember } from "@/lib/ai/customPersona";
import { saveBoard, uid } from "@/lib/store";
import PersonaCard from "@/components/board/PersonaCard";

const STEPS = ["Charter", "Composition", "Review"] as const;

export default function CharterBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 — charter
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [values, setValues] = useState("");
  const [goals, setGoals] = useState("");

  // Step 2 — composition
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [custom, setCustom] = useState<BoardMember[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const chosenSeeds = PERSONA_LIBRARY.filter((p) => selected[p.slug]);
  const members: BoardMember[] = [
    ...chosenSeeds.map(seedToMember),
    ...custom,
  ];

  const canActivate = name.trim() && members.length >= 1;

  function activate() {
    const now = new Date().toISOString();
    const board: Board = {
      id: uid("board"),
      name: name.trim(),
      purpose,
      values,
      goals,
      charterText: `${purpose}\n\nValues: ${values}\n\nGoals: ${goals}`,
      members,
      createdAt: now,
      updatedAt: now,
    };
    saveBoard(board);
    router.push(`/board/${board.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper step={step} />

      {step === 0 && (
        <div className="card-surface space-y-4 rounded-xl p-6">
          <h2 className="font-display text-xl gold-text">Personal Board Charter</h2>
          <Field label="Board name">
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Executive Advisory Board" />
          </Field>
          <Field label="Purpose — why does this board exist?">
            <textarea className="input-field min-h-[80px]" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="To help me navigate a career pivot with clarity and courage." />
          </Field>
          <Field label="Your core values">
            <textarea className="input-field min-h-[70px]" value={values} onChange={(e) => setValues(e.target.value)} placeholder="Integrity, growth, family, craftsmanship…" />
          </Field>
          <Field label="Your 1–3 year goals">
            <textarea className="input-field min-h-[70px]" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Launch the company, reach profitability, stay grounded." />
          </Field>
          <div className="flex justify-end">
            <button className="btn-gold disabled:opacity-50" disabled={!name.trim()} onClick={() => setStep(1)}>
              Next: Compose your board →
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="card-surface rounded-xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl gold-text">Board Composition</h2>
              <span className="text-sm text-ink-secondary">{members.length} selected · aim for 4–6</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERSONA_LIBRARY.map((p) => (
                <PersonaCard
                  key={p.slug}
                  name={p.name}
                  role={p.role}
                  archetype={p.archetype}
                  selected={!!selected[p.slug]}
                  onToggle={() => setSelected((s) => ({ ...s, [p.slug]: !s[p.slug] }))}
                />
              ))}
            </div>
          </div>

          <div className="card-surface rounded-xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg gold-text">Custom Board Members</h3>
              <button className="btn-ghost text-sm" onClick={() => setShowCustom((v) => !v)}>
                {showCustom ? "Close" : "+ Add custom member"}
              </button>
            </div>
            {custom.length > 0 && (
              <ul className="mb-3 space-y-1 text-sm">
                {custom.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-md bg-surface px-3 py-2">
                    <span>{m.name} — <span className="text-ink-secondary">{m.role}</span> <span className="badge ml-1">{ARCHETYPE_LABELS[m.archetype]}</span></span>
                    <button className="text-xs text-ink-secondary hover:text-gold" onClick={() => setCustom((c) => c.filter((x) => x.id !== m.id))}>remove</button>
                  </li>
                ))}
              </ul>
            )}
            {showCustom && (
              <CustomMemberForm
                onAdd={(m) => {
                  setCustom((c) => [...c, m]);
                  setShowCustom(false);
                }}
              />
            )}
          </div>

          <div className="flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn-gold disabled:opacity-50" disabled={members.length < 1} onClick={() => setStep(2)}>
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="card-surface rounded-xl p-6">
            <h2 className="font-display text-xl gold-text">{name}</h2>
            <p className="mt-1 text-sm text-ink-secondary">{purpose}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Summary label="Values" value={values} />
              <Summary label="Goals" value={goals} />
            </div>
            <h3 className="mt-6 mb-2 font-display text-lg gold-text">Board ({members.length})</h3>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm">
                  <span>{m.name} — <span className="text-ink-secondary">{m.role}</span></span>
                  <span className="badge">{ARCHETYPE_LABELS[m.archetype]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-gold disabled:opacity-50" disabled={!canActivate} onClick={activate}>
              Activate Board ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-3 text-sm">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${i <= step ? "btn-gold" : "border border-boardline text-ink-secondary"}`}>{i + 1}</span>
          <span className={i === step ? "gold-text" : "text-ink-secondary"}>{s}</span>
          {i < STEPS.length - 1 && <span className="text-ink-secondary">—</span>}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <div className="text-xs uppercase tracking-wide text-ink-secondary">{label}</div>
      <div className="mt-1 text-sm">{value || "—"}</div>
    </div>
  );
}

const ARCHETYPES: Archetype[] = ["challenger", "sponsor", "expert", "confidant", "connector", "values_anchor"];

function CustomMemberForm({ onAdd }: { onAdd: (m: BoardMember) => void }) {
  const [f, setF] = useState({
    name: "",
    role: "",
    archetype: "expert" as Archetype,
    background: "",
    communicationStyle: "",
    expertise: "",
    values: "",
    blindSpots: "",
    decisionStyle: "",
  });
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="space-y-3 rounded-md border border-boardline p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input-field" placeholder="Name" value={f.name} onChange={set("name")} />
        <input className="input-field" placeholder="Role / title" value={f.role} onChange={set("role")} />
      </div>
      <select className="input-field" value={f.archetype} onChange={set("archetype")}>
        {ARCHETYPES.map((a) => (
          <option key={a} value={a}>{ARCHETYPE_LABELS[a]}</option>
        ))}
      </select>
      <textarea className="input-field" placeholder="Background & expertise" value={f.background} onChange={set("background")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-field" placeholder="Communication style" value={f.communicationStyle} onChange={set("communicationStyle")} />
        <textarea className="input-field" placeholder="Areas of expertise" value={f.expertise} onChange={set("expertise")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-field" placeholder="Key values / philosophy" value={f.values} onChange={set("values")} />
        <textarea className="input-field" placeholder="Blind spots they'll challenge" value={f.blindSpots} onChange={set("blindSpots")} />
      </div>
      <input className="input-field" placeholder="Decision-making style" value={f.decisionStyle} onChange={set("decisionStyle")} />
      <div className="flex justify-end">
        <button
          className="btn-gold disabled:opacity-50"
          disabled={!f.name.trim() || !f.role.trim()}
          onClick={() => onAdd(customInputToMember(f, uid("member")))}
        >
          Add to board
        </button>
      </div>
    </div>
  );
}
