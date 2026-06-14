"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Board } from "@/lib/types";
import { getBoards } from "@/lib/store";
import { ARCHETYPE_LABELS } from "@/lib/types";

export default function Home() {
  const [boards, setBoards] = useState<Board[] | null>(null);

  useEffect(() => {
    setBoards(getBoards());
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="text-center">
        <div className="badge mb-4">A personal board of directors, on demand</div>
        <h1 className="font-display text-5xl leading-tight md:text-6xl">
          The <span className="gold-text">Boardroom</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-secondary">
          Present a thought, problem, or idea and receive candid,
          character-consistent counsel from a curated board of AI advisors —
          grounded in the frameworks of the people you admire.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/board/create" className="btn-gold">
            Build your board
          </Link>
          <a href="#how" className="btn-ghost">
            How it works
          </a>
        </div>
      </header>

      {boards && boards.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl gold-text">Your boards</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {boards.map((b) => (
              <Link
                key={b.id}
                href={`/board/${b.id}`}
                className="card-surface rounded-xl p-5 transition hover:border-gold"
              >
                <div className="font-display text-lg">{b.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                  {b.purpose || "No purpose set"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {b.members.slice(0, 5).map((m) => (
                    <span key={m.id} className="badge">
                      {m.name.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="how" className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "1 · Charter",
            d: "Define your purpose, values, and 1–3 year goals so the board advises in context.",
          },
          {
            t: "2 · Compose",
            d: "Pick from 15 real-person personas or craft custom advisors with their own archetype.",
          },
          {
            t: "3 · Present",
            d: "Type, speak, or upload. The board responds in a memo, a chat, or a live round-table.",
          },
        ].map((c) => (
          <div key={c.t} className="card-surface rounded-xl p-6">
            <div className="font-display text-lg gold-text">{c.t}</div>
            <p className="mt-2 text-sm text-ink-secondary">{c.d}</p>
          </div>
        ))}
      </section>

      <footer className="mt-20 border-t border-boardline pt-6 text-center text-xs text-ink-secondary">
        Archetypes: {Object.values(ARCHETYPE_LABELS).join(" · ")}
      </footer>
    </main>
  );
}
