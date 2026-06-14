"use client";

import { useEffect, useRef, useState } from "react";
import type { PresentationType } from "@/lib/types";

interface Props {
  onSubmit: (text: string, type: PresentationType) => void;
  busy?: boolean;
}

type Tab = "type" | "speak" | "upload";

export default function PresentationInput({ onSubmit, busy }: Props) {
  const [tab, setTab] = useState<Tab>("type");
  const [text, setText] = useState("");

  function submit(type: PresentationType) {
    if (!text.trim()) return;
    onSubmit(text.trim(), type);
  }

  return (
    <div className="card-surface rounded-xl p-5">
      <div className="mb-4 flex gap-2">
        {(["type", "speak", "upload"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm capitalize transition ${
              tab === t ? "btn-gold" : "btn-ghost"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "type" && (
        <div>
          <textarea
            className="input-field min-h-[180px] resize-y font-body"
            placeholder="Present a thought, problem, or idea to your board…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-1 text-right text-xs text-ink-secondary">
            {text.length} characters
          </div>
        </div>
      )}

      {tab === "speak" && (
        <SpeakTab value={text} onChange={setText} />
      )}

      {tab === "upload" && <UploadTab onText={setText} value={text} />}

      <div className="mt-4 flex justify-end">
        <button
          className="btn-gold disabled:opacity-50"
          disabled={!text.trim() || busy}
          onClick={() => submit(tab === "type" ? "text" : tab === "speak" ? "voice" : "document")}
        >
          {busy ? "The board is deliberating…" : "Present to the Board"}
        </button>
      </div>
    </div>
  );
}

// ── Web Speech API tab ──
function SpeakTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      }
      if (finalText) onChange((value ? value + " " : "") + finalText.trim());
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => rec.stop?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-md border border-boardline p-4 text-sm text-ink-secondary">
        Your browser doesn’t support the Web Speech API. Type your presentation
        instead, or wire the Whisper API fallback (Phase 2).
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={toggle} className={listening ? "btn-gold" : "btn-ghost"}>
          {listening ? "■ Stop" : "● Start speaking"}
        </button>
        {listening && (
          <div className="flex items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1 animate-pulse rounded bg-gold"
                style={{ height: `${8 + ((i * 7) % 18)}px`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}
      </div>
      <textarea
        className="input-field min-h-[140px] resize-y"
        placeholder="Live transcription will appear here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── File upload tab ──
function UploadTab({
  onText,
  value,
}: {
  onText: (v: string) => void;
  value: string;
}) {
  const [note, setNote] = useState<string>("");

  async function handleFile(file: File) {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      onText(await file.text());
      setNote(`Loaded ${file.name}`);
    } else {
      setNote(
        `"${file.name}" needs server-side extraction (pdf-parse / mammoth) — wired in Phase 2. Paste the text below for now.`
      );
    }
  }

  return (
    <div>
      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-boardline p-8 text-center text-sm text-ink-secondary transition hover:border-gold"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        <span className="mb-1 text-2xl">⇪</span>
        Drag & drop a PDF, DOCX, or TXT — or click to choose
        <input
          type="file"
          accept=".txt,.pdf,.docx,.doc,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
      {note && <div className="mt-2 text-xs text-gold-light">{note}</div>}
      <textarea
        className="input-field mt-3 min-h-[120px] resize-y"
        placeholder="Extracted text (editable before submitting)…"
        value={value}
        onChange={(e) => onText(e.target.value)}
      />
    </div>
  );
}
