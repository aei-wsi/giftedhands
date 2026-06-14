import { NextRequest, NextResponse } from "next/server";
import { orchestrateBoardResponse } from "@/lib/ai/orchestrator";
import type { RespondRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: RespondRequest;
  try {
    body = (await req.json()) as RespondRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.presentation?.trim()) {
    return NextResponse.json(
      { error: "presentation is required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.members) || body.members.length === 0) {
    return NextResponse.json(
      { error: "at least one board member is required" },
      { status: 400 }
    );
  }

  try {
    const result = await orchestrateBoardResponse(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("orchestrate error", err);
    return NextResponse.json(
      { error: "Board failed to respond. Check ANTHROPIC_API_KEY and model." },
      { status: 500 }
    );
  }
}
