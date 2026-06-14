"use client";

import type { Archetype } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { colorFor, initials } from "@/lib/colors";

interface Props {
  name: string;
  role?: string;
  archetype: Archetype;
  state?: "idle" | "thinking" | "speaking" | "done";
}

// A video-tile placeholder for Live Boardroom mode. Phase 4 swaps the avatar
// circle for a HeyGen/Tavus streaming <video> element.
export default function MemberTile({ name, role, archetype, state = "idle" }: Props) {
  const color = colorFor(name);
  const ring =
    state === "speaking"
      ? "ring-2 ring-gold shadow-[0_0_24px_rgba(201,168,76,0.45)]"
      : state === "thinking"
      ? "ring-1 ring-gold/40"
      : "ring-1 ring-white/5";
  return (
    <div className={`card-surface relative aspect-video overflow-hidden rounded-xl ${ring}`}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-black"
          style={{ background: color }}
        >
          {initials(name)}
        </div>
        <div className="font-display text-sm">{name}</div>
        {role ? <div className="text-[11px] text-ink-secondary">{role}</div> : null}
      </div>
      <div className="absolute left-2 top-2">
        <span className="badge">{ARCHETYPE_LABELS[archetype]}</span>
      </div>
      {state === "thinking" && (
        <div className="absolute bottom-2 right-2 text-[11px] text-ink-secondary">
          thinking…
        </div>
      )}
      {state === "speaking" && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] text-gold-light">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
          speaking
        </div>
      )}
    </div>
  );
}
