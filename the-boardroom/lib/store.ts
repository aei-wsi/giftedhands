"use client";

import type { Board, Session } from "@/lib/types";

// A tiny localStorage-backed store so the app is fully runnable without
// Supabase credentials. When NEXT_PUBLIC_SUPABASE_URL is configured you can
// swap these functions for Supabase queries (see supabase/migrations).

const BOARDS_KEY = "boardroom.boards";
const SESSIONS_KEY = "boardroom.sessions";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(
    36
  )}`;
}

// ── Boards ──
export function getBoards(): Board[] {
  return read<Board>(BOARDS_KEY);
}

export function getBoard(id: string): Board | undefined {
  return getBoards().find((b) => b.id === id);
}

export function saveBoard(board: Board): Board {
  const boards = getBoards();
  const idx = boards.findIndex((b) => b.id === board.id);
  const next = { ...board, updatedAt: new Date().toISOString() };
  if (idx >= 0) boards[idx] = next;
  else boards.push(next);
  write(BOARDS_KEY, boards);
  return next;
}

export function deleteBoard(id: string): void {
  write(
    BOARDS_KEY,
    getBoards().filter((b) => b.id !== id)
  );
}

// ── Sessions ──
export function getSessions(boardId?: string): Session[] {
  const all = read<Session>(SESSIONS_KEY);
  return boardId ? all.filter((s) => s.boardId === boardId) : all;
}

export function getSession(id: string): Session | undefined {
  return read<Session>(SESSIONS_KEY).find((s) => s.id === id);
}

export function saveSession(session: Session): Session {
  const sessions = read<Session>(SESSIONS_KEY);
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  write(SESSIONS_KEY, sessions);
  return session;
}
