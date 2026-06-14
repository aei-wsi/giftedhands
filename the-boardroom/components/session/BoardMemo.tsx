"use client";

import type { PersonaResponse } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";

interface Props {
  topic: string;
  presenter: string;
  date: string;
  responses: PersonaResponse[];
  synthesis: string;
}

// Document-mode board memo. Export uses the browser print dialog (Save as PDF);
// swap for react-pdf / puppeteer server rendering in Phase 3.
export default function BoardMemo({ topic, presenter, date, responses, synthesis }: Props) {
  function exportPdf() {
    window.print();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <button className="btn-gold" onClick={exportPdf}>
          Export as PDF
        </button>
      </div>

      <div id="board-memo" className="card-surface mx-auto max-w-3xl rounded-xl p-8 font-mono text-sm leading-relaxed">
        <h2 className="font-display text-2xl gold-text">BOARD SESSION MEMO</h2>
        <div className="mt-2 space-y-0.5 text-ink-secondary">
          <div>Date: {date}</div>
          <div>Presented by: {presenter}</div>
          <div>Topic: {topic}</div>
        </div>

        <hr className="my-5 border-boardline" />
        <h3 className="mb-3 font-display text-lg gold-text">MEMBER RESPONSES</h3>
        <div className="space-y-5">
          {responses.map((r) => (
            <div key={r.memberId}>
              <div className="font-semibold">
                {r.memberName} <span className="text-ink-secondary">| {ARCHETYPE_LABELS[r.archetype]}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-ink-primary">{r.text}</p>
            </div>
          ))}
        </div>

        <hr className="my-5 border-boardline" />
        <h3 className="mb-3 font-display text-lg gold-text">BOARD CONSENSUS</h3>
        <p className="whitespace-pre-wrap">{synthesis}</p>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          #board-memo {
            background: #fff !important;
            border: none !important;
            color: #000 !important;
            max-width: none !important;
          }
          #board-memo .gold-text {
            color: #9a7830 !important;
          }
        }
      `}</style>
    </div>
  );
}
