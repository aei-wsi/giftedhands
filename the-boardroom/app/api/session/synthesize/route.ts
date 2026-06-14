import { NextRequest, NextResponse } from "next/server";
import { generateBoardSynthesis } from "@/lib/ai/synthesis";
import type { PersonaResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { responses: PersonaResponse[]; presentation: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body?.responses) || !body.presentation) {
    return NextResponse.json(
      { error: "responses[] and presentation are required" },
      { status: 400 }
    );
  }

  try {
    const synthesis = await generateBoardSynthesis(
      body.responses,
      body.presentation
    );
    return NextResponse.json({ synthesis });
  } catch (err) {
    console.error("synthesize error", err);
    return NextResponse.json({ error: "Synthesis failed" }, { status: 500 });
  }
}
