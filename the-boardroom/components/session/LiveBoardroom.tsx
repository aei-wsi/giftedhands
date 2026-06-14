"use client";

import { useState } from "react";
import type { PersonaResponse } from "@/lib/types";
import MemberTile from "@/components/board/MemberTile";
import BoardroomTable from "@/components/board/BoardroomTable";

interface Props {
  responses: PersonaResponse[];
}

// Live Boardroom layout. Phase 4 replaces the play loop with ElevenLabs audio +
// HeyGen/Tavus streaming video and Web Speech API mic capture.
export default function LiveBoardroom({ responses }: Props) {
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [spoken, setSpoken] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);

  async function runRoundTable() {
    setPlaying(true);
    setSpoken(new Set());
    for (let i = 0; i < responses.length; i++) {
      setActiveIdx(i);
      // Stub for the speak duration; Phase 4 ties this to audio/video length.
      await new Promise((r) => setTimeout(r, 1800));
      setSpoken((prev) => new Set(prev).add(i));
    }
    setActiveIdx(-1);
    setPlaying(false);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center">
        <BoardroomTable
          seats={responses.map((r, i) => ({ name: r.memberName, speaking: i === activeIdx }))}
        />
        <button className="btn-gold mt-3 disabled:opacity-50" disabled={playing} onClick={runRoundTable}>
          {playing ? "Round-table in session…" : "▶ Begin round-table"}
        </button>
        <p className="mt-2 max-w-md text-center text-xs text-ink-secondary">
          Demo round-table cycles each member’s turn. Phase 4 streams lip-synced
          avatars (HeyGen/Tavus) with ElevenLabs voices and live mic input.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {responses.map((r, i) => (
          <div key={r.memberId}>
            <MemberTile
              name={r.memberName}
              archetype={r.archetype}
              state={i === activeIdx ? "speaking" : spoken.has(i) ? "done" : "idle"}
            />
            {(i === activeIdx || spoken.has(i)) && (
              <div className="card-surface mt-2 max-h-40 overflow-y-auto rounded-lg p-3 text-xs leading-relaxed">
                {r.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
