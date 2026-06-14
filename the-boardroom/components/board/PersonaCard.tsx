"use client";

import type { Archetype } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { colorFor, initials } from "@/lib/colors";

interface Props {
  name: string;
  role: string;
  archetype: Archetype;
  selected?: boolean;
  onToggle?: () => void;
}

export default function PersonaCard({
  name,
  role,
  archetype,
  selected,
  onToggle,
}: Props) {
  const color = colorFor(name);
  return (
    <button
      type="button"
      onClick={onToggle}
      className="card-surface group relative flex w-full items-start gap-3 rounded-lg p-4 text-left transition hover:border-gold"
      style={selected ? { borderColor: "var(--gold)" } : undefined}
      aria-pressed={selected}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-black"
        style={{ background: color }}
      >
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base leading-tight">{name}</div>
        <div className="truncate text-xs text-ink-secondary">{role}</div>
        <span className="badge mt-2">{ARCHETYPE_LABELS[archetype]}</span>
      </div>
      <div
        className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-xs"
        style={{
          borderColor: selected ? "var(--gold)" : "var(--border)",
          background: selected ? "var(--gold)" : "transparent",
          color: "#1a1407",
        }}
      >
        {selected ? "✓" : ""}
      </div>
    </button>
  );
}
