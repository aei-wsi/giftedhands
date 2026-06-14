"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Archetype,
  BoardMember,
  ChairMode,
  DiscussionFlow,
  DiscussionTurn,
  TurnKind,
} from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { faceFor } from "@/lib/avatarFace";
import { colorFor, initials } from "@/lib/colors";
import GeneratedAvatar from "@/components/avatar/GeneratedAvatar";

interface Props {
  members: BoardMember[];
  board: { purpose: string; values: string; goals: string };
  presentation: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REACTION_LABEL: Partial<Record<TurnKind, string>> = {
  challenge: "🤨 challenged",
  agree: "👍 agrees",
  build: "💡 builds on it",
  react: "💬 responding",
};
const KIND_VERB: Record<TurnKind, string> = {
  open: "opens",
  react: "responds to",
  challenge: "challenges",
  agree: "agrees with",
  build: "builds on",
  moderate: "chairs",
  consensus: "sums up",
};

interface Seat {
  id: string;
  name: string;
  archetype?: Archetype;
  isChair?: boolean;
}

const FLOWS: { v: DiscussionFlow; label: string }[] = [
  { v: "organic", label: "Organic" },
  { v: "moderated", label: "Moderated" },
  { v: "hybrid", label: "Hybrid" },
];
const CHAIRS: { v: ChairMode; label: string }[] = [
  { v: "dedicated", label: "Board Chair" },
  { v: "member", label: "A member" },
  { v: "none", label: "No chair" },
];

// Live Boardroom — a conversational round-table. Members react to and challenge
// each other (driven by /api/session/discuss), a chair can steer, and the tiles
// react in real time. Phase 4 swaps GeneratedAvatar for HeyGen/Tavus streams.
export default function LiveBoardroom({ members, board, presentation }: Props) {
  const [flow, setFlow] = useState<DiscussionFlow>("organic");
  const [chair, setChair] = useState<ChairMode>("dedicated");
  const [turns, setTurns] = useState<DiscussionTurn[] | null>(null);
  const [chairName, setChairName] = useState<string | undefined>();
  const [chairId, setChairId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [caption, setCaption] = useState("");
  const [running, setRunning] = useState(false);
  const [reaction, setReaction] = useState<{ id: string; label: string } | null>(null);
  const [nodId, setNodId] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const runId = useRef(0);
  const transcriptEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeIdx]);

  const play = useCallback(
    async (list: DiscussionTurn[]) => {
      const myRun = ++runId.current;
      setRunning(true);
      setActiveIdx(-1);
      setCaption("");
      setReaction(null);
      setNodId(null);
      for (let i = 0; i < list.length; i++) {
        if (runId.current !== myRun) return;
        const turn = list[i];
        setActiveIdx(i);
        setCaption("");
        const label = turn.addressedToId ? REACTION_LABEL[turn.kind] : undefined;
        setReaction(turn.addressedToId && label ? { id: turn.addressedToId, label } : null);
        setNodId(
          turn.addressedToId ||
            members.find((m) => m.id !== turn.speakerId)?.id ||
            null
        );
        const text = turn.text.replace(/\s+/g, " ").trim();
        const window = Math.min(Math.max(text.length * 16, 1800), 8000);
        const step = Math.max(window / Math.max(text.length, 1), 8);
        for (let c = 0; c <= text.length; c += 3) {
          if (runId.current !== myRun) return;
          setCaption(text.slice(0, c));
          await sleep(step * 3);
        }
        setCaption(text);
        await sleep(turn.kind === "moderate" ? 480 : 760);
      }
      if (runId.current !== myRun) return;
      setActiveIdx(-1);
      setRunning(false);
      setReaction(null);
      setNodId(null);
    },
    [members]
  );

  const fetchDiscussion = useCallback(
    async (f: DiscussionFlow, c: ChairMode) => {
      runId.current++; // cancel any running playback
      setLoading(true);
      setError(null);
      setTurns(null);
      setActiveIdx(-1);
      setCaption("");
      setRunning(false);
      try {
        const res = await fetch("/api/session/discuss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ presentation, members, board, flow: f, chair: c }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to convene the board");
        const data = await res.json();
        setTurns(data.turns);
        setChairName(data.chairName);
        setChairId(data.chairId);
        setLoading(false);
        play(data.turns);
      } catch (e: any) {
        setError(e.message || "Something went wrong");
        setLoading(false);
      }
    },
    [presentation, members, board, play]
  );

  useEffect(() => {
    fetchDiscussion("organic", "dedicated");
    return () => {
      runId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeFlow(f: DiscussionFlow) {
    setFlow(f);
    fetchDiscussion(f, chair);
  }
  function changeChair(c: ChairMode) {
    setChair(c);
    fetchDiscussion(flow, c);
  }

  const seats: Seat[] = [
    ...(chair === "dedicated" && chairName ? [{ id: "chair", name: chairName, isChair: true }] : []),
    ...members.map((m) => ({ id: m.id, name: m.name, archetype: m.archetype, isChair: chairId === m.id })),
  ];

  const activeTurn = activeIdx >= 0 && turns ? turns[activeIdx] : null;
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div>
      {/* settings + meeting bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-boardline bg-surface/60 px-4 py-2.5 text-sm">
          <Segmented label="Flow" value={flow} options={FLOWS} onChange={changeFlow} disabled={loading} />
          <Segmented label="Chair" value={chair} options={CHAIRS} onChange={changeChair} disabled={loading} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-boardline bg-surface/60 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC{" "}
            <span className="text-ink-secondary">{mmss}</span>
          </div>
          <div className="text-ink-secondary">
            {seats.length} at the table{chair !== "none" && chairName ? ` · chaired by ${chairName}` : " · self-organized"}
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost px-3 py-1 text-xs disabled:opacity-40" disabled={loading || running || !turns} onClick={() => turns && play(turns)}>
              ▶ Replay
            </button>
            <button className="btn-ghost px-3 py-1 text-xs disabled:opacity-40" disabled={loading} onClick={() => fetchDiscussion(flow, chair)}>
              ↻ New discussion
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {/* tiles */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {seats.map((seat) => {
              const face = faceFor(seat.id, seat.name);
              const isSpeaking = activeTurn?.speakerId === seat.id;
              const isReacting = reaction?.id === seat.id;
              const isNod = nodId === seat.id && !isSpeaking;
              return (
                <div
                  key={seat.id}
                  className={`relative aspect-video overflow-hidden rounded-xl border bg-card transition ${
                    isSpeaking
                      ? "tile-speaking -translate-y-0.5 border-[#3BD17A] shadow-[0_0_0_2px_#3BD17A,0_0_28px_rgba(59,209,122,0.35)]"
                      : isReacting
                      ? "border-gold shadow-[0_0_0_1px_rgba(201,168,76,0.6)]"
                      : "border-white/5"
                  } ${isNod ? "tile-nod" : ""}`}
                >
                  <div className="absolute inset-0" style={{ background: "radial-gradient(85% 75% at 50% 26%, #263048, #0a0f1a)" }} />
                  <div className={isSpeaking ? "" : "opacity-90 saturate-[0.85]"}>
                    <GeneratedAvatar face={face} />
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                    {seat.isChair && <span className="badge">Chair</span>}
                    {seat.archetype && <span className="badge">{ARCHETYPE_LABELS[seat.archetype]}</span>}
                  </div>
                  {isReacting && reaction && (
                    <div className="reaction-chip absolute left-2 top-2 rounded-full bg-background/85 px-2 py-1 text-[11px] text-gold-light backdrop-blur">
                      {reaction.label}
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
                    {seat.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* caption / lower third */}
          <div className="mt-4 flex min-h-[84px] items-start gap-4 rounded-xl border border-boardline bg-gradient-to-b from-card/60 to-surface/90 px-5 py-4">
            <div className="whitespace-nowrap font-display text-sm text-gold-light">
              {loading ? "Convening…" : activeTurn ? activeTurn.speakerName : "—"}
              <span className="block font-body text-[11px] font-normal text-ink-secondary">
                {activeTurn
                  ? activeTurn.addressedToName
                    ? `${KIND_VERB[activeTurn.kind]} ${activeTurn.addressedToName}`
                    : ARCHETYPE_LABELS[activeTurn.archetype as Archetype] || "chair"
                  : loading
                  ? "the board is gathering"
                  : "discussion complete"}
              </span>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-primary">
              {loading ? (
                <span className="text-ink-secondary">Generating a live {flow} discussion{chair !== "none" ? ` with ${chairName || "a chair"}` : ""}…</span>
              ) : (
                <>
                  {caption}
                  {running && <span className="cap-cursor">&nbsp;</span>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* live transcript rail */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-ink-secondary">Live transcript</h3>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {(turns || []).map((t, i) => {
              const seen = i <= activeIdx;
              const isCur = i === activeIdx;
              return (
                <div key={i} className={`rounded-lg border px-2.5 py-2 text-xs transition ${isCur ? "border-[#3BD17A]/40 bg-[#3BD17A]/10" : "border-transparent"} ${seen ? "opacity-100" : "opacity-35"}`}>
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-black" style={{ background: t.speakerId === "chair" ? "#C9A84C" : colorFor(t.speakerName) }}>
                      {initials(t.speakerName)}
                    </span>
                    <span className="font-medium">{t.speakerName.split(" ")[0]}</span>
                    {t.addressedToName && <span className="text-ink-secondary">→ {t.addressedToName.split(" ")[0]}</span>}
                  </div>
                  <p className="leading-snug text-ink-secondary">{t.text}</p>
                </div>
              );
            })}
            <div ref={transcriptEnd} />
          </div>
        </aside>
      </div>

      {/* control bar */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <Ctrl label="You · live" active>🎙</Ctrl>
        <Ctrl label="Camera">🎥</Ctrl>
        <Ctrl label="Raise hand">✋</Ctrl>
        <Ctrl label="Memo">📄</Ctrl>
        <button className="rounded-full bg-[#b3392f] px-5 py-2.5 text-sm font-semibold text-white">Leave room</button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-secondary">
        Generated avatar placeholders. Phase 4 streams lip-synced HeyGen/Tavus video with ElevenLabs voices and live mic input.
      </p>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-secondary">{label}</span>
      <div className="flex rounded-md border border-boardline p-0.5">
        {options.map((o) => (
          <button
            key={o.v}
            disabled={disabled}
            onClick={() => o.v !== value && onChange(o.v)}
            className={`rounded px-2.5 py-1 text-xs transition disabled:opacity-50 ${
              o.v === value ? "bg-gold text-black" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Ctrl({ children, label, active }: { children: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg ${active ? "border-gold bg-card" : "border-boardline bg-card"}`}>
        {children}
      </div>
      <span className="text-[10px] text-ink-secondary">{label}</span>
    </div>
  );
}
