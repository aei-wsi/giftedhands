"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Board } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { getBoard } from "@/lib/store";

export default function MembersPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null | undefined>(undefined);

  useEffect(() => setBoard(getBoard(boardId) ?? null), [boardId]);

  if (!board)
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 text-ink-secondary">
        {board === null ? "Board not found." : "Loading…"}
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href={`/board/${boardId}`} className="text-sm text-ink-secondary hover:text-gold">← {board.name}</Link>
      <div className="mt-4 mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl gold-text">Board Members</h1>
        <Link href="/board/create" className="btn-ghost text-sm">Build another board</Link>
      </div>
      <div className="space-y-4">
        {board.members.map((m) => (
          <details key={m.id} className="card-surface rounded-lg p-5">
            <summary className="cursor-pointer list-none">
              <span className="font-display text-lg">{m.name}</span>
              <span className="ml-2 text-sm text-ink-secondary">{m.role}</span>
              <span className="badge ml-2">{ARCHETYPE_LABELS[m.archetype]}</span>
              <span className="badge ml-1">{m.type === "real_person" ? "real" : "custom"}</span>
            </summary>
            <pre className="mt-3 whitespace-pre-wrap rounded-md bg-surface p-4 font-mono text-xs leading-relaxed text-ink-secondary">
              {m.personaPrompt}
            </pre>
          </details>
        ))}
      </div>
    </main>
  );
}
