"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Board, Session } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { getBoard, getSessions } from "@/lib/store";
import { colorFor, initials } from "@/lib/colors";

export default function BoardDashboard() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setBoard(getBoard(boardId) ?? null);
    setSessions(getSessions(boardId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [boardId]);

  if (board === undefined) return <Shell><p className="text-ink-secondary">Loading…</p></Shell>;
  if (board === null)
    return (
      <Shell>
        <p className="text-ink-secondary">Board not found. <Link href="/board/create" className="gold-text">Create one →</Link></p>
      </Shell>
    );

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{board.name}</h1>
          <p className="mt-1 max-w-2xl text-ink-secondary">{board.purpose}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/board/${board.id}/members`} className="btn-ghost">Members</Link>
          <Link href={`/board/${board.id}/session/new`} className="btn-gold">Present to board</Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl gold-text">The Board ({board.members.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {board.members.map((m) => (
            <div key={m.id} className="card-surface flex items-center gap-3 rounded-lg p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-black" style={{ background: colorFor(m.name) }}>
                {initials(m.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-sm">{m.name}</div>
                <span className="badge mt-1">{ARCHETYPE_LABELS[m.archetype]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl gold-text">Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-secondary">No sessions yet. Present something to your board to begin.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link href={`/board/${board.id}/session/${s.id}`} className="card-surface flex items-center justify-between rounded-lg p-4 transition hover:border-gold">
                  <span className="truncate">{s.title || s.presentationText.slice(0, 60)}</span>
                  <span className="text-xs text-ink-secondary">{new Date(s.createdAt).toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm text-ink-secondary hover:text-gold">← All boards</Link>
      <div className="mt-4">{children}</div>
    </main>
  );
}
