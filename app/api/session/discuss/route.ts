import { NextRequest, NextResponse } from "next/server";
import { orchestrateBoardDiscussion } from "@/lib/ai/discussion";
import type { DiscussRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: DiscussRequest;
  try {
    body = (await req.json()) as DiscussRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.presentation?.trim() || !Array.isArray(body.members) || body.members.length === 0) {
    return NextResponse.json(
      { error: "presentation and members are required" },
      { status: 400 }
    );
  }

  try {
    const result = await orchestrateBoardDiscussion({
      flow: body.flow || "organic",
      chair: body.chair || "dedicated",
      chairMemberId: body.chairMemberId,
      presentation: body.presentation,
      members: body.members,
      board: body.board || { purpose: "", values: "", goals: "" },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("discuss error", err);
    return NextResponse.json({ error: "Discussion failed" }, { status: 500 });
  }
}
