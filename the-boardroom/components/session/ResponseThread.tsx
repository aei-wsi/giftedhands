"use client";

import { useState } from "react";
import type { BoardMember, ConversationTurn, PersonaResponse, RespondRequest } from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { colorFor, initials } from "@/lib/colors";

interface Props {
  responses: PersonaResponse[];
  members: BoardMember[];
  board: RespondRequest["board"];
  presentation: string;
}

interface ThreadItem {
  kind: "member" | "user";
  memberId?: string;
  name: string;
  text: string;
}

// Chat-style threaded responses with the ability to reply to any member.
export default function ResponseThread({ responses, members, board, presentation }: Props) {
  const [items, setItems] = useState<ThreadItem[]>(
    responses.map((r) => ({ kind: "member", memberId: r.memberId, name: r.memberName, text: r.text }))
  );
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendReply(member: BoardMember) {
    if (!draft.trim()) return;
    setBusy(true);
    const userText = draft.trim();
    setItems((prev) => [...prev, { kind: "user", name: "You", text: userText }]);
    setDraft("");

    const history: ConversationTurn[] = items.map((it, i) => ({
      id: String(i),
      sessionId: "thread",
      speaker: it.kind === "user" ? "user" : it.memberId || "member",
      speakerName: it.name,
      content: it.text,
      turnOrder: i,
      createdAt: new Date().toISOString(),
    }));

    try {
      const res = await fetch("/api/session/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentation: `Earlier you advised on: "${presentation.slice(0, 200)}". The presenter now replies: "${userText}"`,
          members: [member],
          board,
          history,
        } satisfies RespondRequest),
      });
      const data = await res.json();
      const reply = data.responses?.[0];
      if (reply) {
        setItems((prev) => [...prev, { kind: "member", memberId: member.id, name: member.name, text: reply.text }]);
      }
    } finally {
      setBusy(false);
      setReplyTo(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const member = members.find((m) => m.id === item.memberId);
        const color = colorFor(item.name);
        const isUser = item.kind === "user";
        return (
          <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-black"
              style={{ background: isUser ? "#9CA3AF" : color }}
            >
              {initials(item.name)}
            </div>
            <div className={`max-w-2xl flex-1 ${isUser ? "text-right" : ""}`}>
              <div className={`mb-1 flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
                <span className="font-display text-sm">{item.name}</span>
                {member && <span className="badge">{ARCHETYPE_LABELS[member.archetype]}</span>}
              </div>
              <div className="card-surface inline-block whitespace-pre-wrap rounded-xl px-4 py-3 text-left text-sm leading-relaxed">
                {item.text}
              </div>
              {!isUser && member && (
                <div className="mt-1">
                  <button
                    className="text-xs text-ink-secondary underline-offset-2 hover:text-gold hover:underline"
                    onClick={() => setReplyTo(replyTo === member.id ? null : member.id)}
                  >
                    Reply to {member.name}
                  </button>
                </div>
              )}
              {replyTo === item.memberId && member && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="input-field text-sm"
                    placeholder={`Reply to ${member.name}…`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply(member)}
                    autoFocus
                  />
                  <button className="btn-gold text-sm disabled:opacity-50" disabled={busy} onClick={() => sendReply(member)}>
                    {busy ? "…" : "Send"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
