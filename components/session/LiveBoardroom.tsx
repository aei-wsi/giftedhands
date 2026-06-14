"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PersonaResponse } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { faceFor } from "@/lib/avatarFace";
import { colorFor, initials } from "@/lib/colors";
import GeneratedAvatar from "@/components/avatar/GeneratedAvatar";

interface Props {
  responses: PersonaResponse[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Live Boardroom — webcam-style tiles, generated avatars that "talk", streaming
// captions, and an auto-advancing round-table. Phase 4 swaps GeneratedAvatar for
// HeyGen/Tavus streaming video and the caption timing for ElevenLabs audio.
export default function LiveBoardroom({ responses }: Props) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [spoken, setSpoken] = useState<Set<number>>(new Set());
  const [caption, setCaption] = useState("");
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(0);
  const cancelled = useRef(false);

  // session timer
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const runRoundTable = useCallback(async () => {
    cancelled.current = false;
    setRunning(true);
    setSpoken(new Set());
    for (let i = 0; i < responses.length; i++) {
      if (cancelled.current) return;
      setActiveIdx(i);
      setCaption("");
      const text = responses[i].text.replace(/\s+/g, " ").trim();
      const window = Math.min(Math.max(text.length * 18, 2800), 9000);
      const step = Math.max(window / text.length, 8);
      for (let c = 0; c <= text.length; c += 3) {
        if (cancelled.current) return;
        setCaption(text.slice(0, c));
        await sleep(step * 3);
      }
      setCaption(text);
      setSpoken((prev) => new Set(prev).add(i));
      await sleep(700);
    }
    setActiveIdx(-1);
    setRunning(false);
  }, [responses]);

  // auto-start the round-table once
  useEffect(() => {
    runRoundTable();
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = activeIdx >= 0 ? responses[activeIdx] : null;
  const upNext = running && activeIdx >= 0 ? (activeIdx + 1) % responses.length : -1;
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div>
      {/* meeting bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-boardline bg-surface/60 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-red-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          REC <span className="text-ink-secondary">{mmss}</span>
        </div>
        <div className="text-ink-secondary">{responses.length} board members present</div>
        <button
          className="btn-ghost px-3 py-1 text-xs disabled:opacity-50"
          disabled={running}
          onClick={runRoundTable}
        >
          {running ? "Round-table in session…" : "▶ Replay round-table"}
        </button>
      </div>

      <div className="flex gap-4">
        {/* stage */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {responses.map((r, i) => {
              const face = faceFor(r.memberId, r.memberName);
              const isSpeaking = i === activeIdx;
              const isThinking = i === upNext && !spoken.has(i);
              return (
                <div
                  key={r.memberId}
                  className={`relative aspect-video overflow-hidden rounded-xl border bg-card transition ${
                    isSpeaking
                      ? "tile-speaking -translate-y-0.5 border-[#3BD17A] shadow-[0_0_0_2px_#3BD17A,0_0_28px_rgba(59,209,122,0.35)]"
                      : isThinking
                      ? "border-gold/50"
                      : "border-white/5"
                  }`}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(85% 75% at 50% 26%, #263048, #0a0f1a)",
                    }}
                  />
                  <div className={isSpeaking ? "" : "opacity-90 saturate-[0.85]"}>
                    <GeneratedAvatar face={face} />
                  </div>
                  <span className="badge absolute right-2 top-2">
                    {ARCHETYPE_LABELS[r.archetype]}
                  </span>
                  {isThinking && (
                    <div className="absolute left-2 top-2 text-[11px] text-ink-secondary">
                      thinking…
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="absolute bottom-3 right-2 flex h-5 items-end gap-[3px]">
                      {[0, 1, 2, 3, 4].map((b) => (
                        <span key={b} className="eq-bar" style={{ animationDelay: `${b * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-xs backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3BD17A]" />
                    {r.memberName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* live caption / lower third */}
          <div className="mt-4 flex min-h-[78px] items-start gap-4 rounded-xl border border-boardline bg-gradient-to-b from-card/60 to-surface/90 px-5 py-4">
            <div className="whitespace-nowrap font-display text-sm text-gold-light">
              {active ? active.memberName : "—"}
              <span className="block font-body text-[11px] font-normal text-ink-secondary">
                {active ? ARCHETYPE_LABELS[active.archetype] : "round-table complete"}
              </span>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-primary">
              {caption}
              {running && <span className="cap-cursor">&nbsp;</span>}
            </div>
          </div>
        </div>

        {/* round-table rail */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-ink-secondary">
            Round-table order
          </h3>
          <ul className="space-y-1.5">
            {responses.map((r, i) => {
              const status = spoken.has(i)
                ? "spoke ✓"
                : i === activeIdx
                ? "speaking"
                : i === upNext
                ? "up next"
                : "waiting";
              return (
                <li
                  key={r.memberId}
                  className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm ${
                    i === activeIdx
                      ? "border-[#3BD17A]/40 bg-[#3BD17A]/10"
                      : "border-transparent"
                  }`}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-black"
                    style={{ background: colorFor(r.memberName) }}
                  >
                    {initials(r.memberName)}
                  </span>
                  <span className="truncate">{r.memberName.split(" ")[0]}</span>
                  <span
                    className={`ml-auto text-[10px] ${
                      i === activeIdx
                        ? "text-[#3BD17A]"
                        : spoken.has(i)
                        ? "text-gold-light"
                        : "text-ink-secondary"
                    }`}
                  >
                    {status}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 rounded-xl border border-boardline bg-card p-3 text-[12px] text-ink-secondary">
            <span className="font-semibold text-gold-light">Board Secretary</span> —
            synthesizing consensus &amp; action items as the round-table proceeds.
          </div>
        </aside>
      </div>

      {/* control bar */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <Ctrl label="You · live" active>🎙</Ctrl>
        <Ctrl label="Camera">🎥</Ctrl>
        <Ctrl label="Ask board">✋</Ctrl>
        <Ctrl label="Memo">📄</Ctrl>
        <button className="rounded-full bg-[#b3392f] px-5 py-2.5 text-sm font-semibold text-white">
          Leave room
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-secondary">
        Generated avatar placeholders. Phase 4 streams lip-synced HeyGen/Tavus
        video with ElevenLabs voices and live mic input.
      </p>
    </div>
  );
}

function Ctrl({
  children,
  label,
  active,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg ${
          active ? "border-gold bg-card" : "border-boardline bg-card"
        }`}
      >
        {children}
      </div>
      <span className="text-[10px] text-ink-secondary">{label}</span>
    </div>
  );
}
