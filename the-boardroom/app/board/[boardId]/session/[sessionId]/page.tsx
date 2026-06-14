"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Board, ResponseMode, Session } from "@/lib/types";
import { getBoard, getSession } from "@/lib/store";
import ResponseThread from "@/components/session/ResponseThread";
import BoardMemo from "@/components/session/BoardMemo";
import LiveBoardroom from "@/components/session/LiveBoardroom";

export default function SessionPage() {
  const { boardId, sessionId } = useParams<{ boardId: string; sessionId: string }>();
  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [mode, setMode] = useState<ResponseMode>("chat");

  useEffect(() => {
    setBoard(getBoard(boardId) ?? null);
    setSession(getSession(sessionId) ?? null);
  }, [boardId, sessionId]);

  if (session === undefined || board === undefined)
    return <main className="mx-auto max-w-4xl px-6 py-10 text-ink-secondary">Loading…</main>;
  if (!session || !board)
    return <main className="mx-auto max-w-4xl px-6 py-10 text-ink-secondary">Session not found.</main>;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/board/${boardId}`} className="text-sm text-ink-secondary hover:text-gold">← {board.name}</Link>

      <div className="mt-4 card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wide text-ink-secondary">Presentation</div>
        <p className="mt-1 whitespace-pre-wrap">{session.presentationText}</p>
      </div>

      <div className="my-6 flex justify-center gap-2">
        {(["chat", "document", "live"] as ResponseMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-md px-4 py-1.5 text-sm capitalize ${mode === m ? "btn-gold" : "btn-ghost"}`}>
            {m === "live" ? "Live ⭐" : m}
          </button>
        ))}
      </div>

      {mode === "chat" && (
        <ResponseThread
          responses={session.responses}
          members={board.members}
          board={{ purpose: board.purpose, values: board.values, goals: board.goals }}
          presentation={session.presentationText}
        />
      )}

      {mode === "document" && (
        <BoardMemo
          topic={session.title || session.presentationText.slice(0, 60)}
          presenter="You"
          date={new Date(session.createdAt).toLocaleDateString()}
          responses={session.responses}
          synthesis={session.synthesis || ""}
        />
      )}

      {mode === "live" && <LiveBoardroom responses={session.responses} />}
    </main>
  );
}
