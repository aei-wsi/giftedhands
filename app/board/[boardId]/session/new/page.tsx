"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Board, PresentationType, RespondResponse, Session } from "@/lib/types";
import { getBoard, saveSession, uid } from "@/lib/store";
import PresentationInput from "@/components/session/PresentationInput";

export default function NewSessionPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setBoard(getBoard(boardId) ?? null), [boardId]);

  async function present(text: string, type: PresentationType) {
    if (!board) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/session/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentation: text,
          members: board.members,
          board: { purpose: board.purpose, values: board.values, goals: board.goals },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      const data: RespondResponse = await res.json();

      const session: Session = {
        id: uid("sess"),
        boardId: board.id,
        title: text.slice(0, 60),
        presentationText: text,
        presentationType: type,
        status: "completed",
        responses: data.responses,
        synthesis: data.synthesis,
        turns: [],
        createdAt: new Date().toISOString(),
      };
      saveSession(session);
      router.push(`/board/${board.id}/session/${session.id}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setBusy(false);
    }
  }

  if (!board)
    return <main className="mx-auto max-w-3xl px-6 py-10 text-ink-secondary">{board === null ? "Board not found." : "Loading…"}</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/board/${boardId}`} className="text-sm text-ink-secondary hover:text-gold">← {board.name}</Link>
      <h1 className="mb-2 mt-4 font-display text-3xl gold-text">Present to the Board</h1>
      <p className="mb-6 text-sm text-ink-secondary">
        {board.members.map((m) => m.name.split(" ")[0]).join(", ")} are seated and ready.
      </p>
      {error && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      <PresentationInput onSubmit={present} busy={busy} />
    </main>
  );
}
