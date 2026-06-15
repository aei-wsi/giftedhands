import Anthropic from "@anthropic-ai/sdk";
import type {
  BoardMember,
  ConversationTurn,
  PersonaResponse,
  RespondRequest,
} from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";
import { generateBoardSynthesis } from "@/lib/ai/synthesis";
import { ANTHROPIC_MODEL as MODEL, anthropicApiKey, hasAnthropic } from "@/lib/ai/key";

export { hasAnthropic };

function client(): Anthropic {
  return new Anthropic({ apiKey: anthropicApiKey() });
}

// Inject live board context into a member's static persona prompt.
export function buildPersonaSystemPrompt(
  member: BoardMember,
  board: RespondRequest["board"]
): string {
  const userName = board.userName || "the presenter";
  return `You are ${member.name} serving as a board member in The Boardroom, advising ${userName}.

${member.personaPrompt}

When responding to a board presentation:
- Stay deeply in character — speak as ${member.name} would based on your documented work and philosophy.
- Be candid and direct, not flattering.
- Draw on your documented frameworks and lived experience.
- Ask the probing question ${member.name} would ask.
- Keep your response to 150-250 words.
- End with a single, specific, actionable recommendation, prefixed with "Recommendation:".

Current board context:
- Board purpose: ${board.purpose || "(not specified)"}
- User's stated values: ${board.values || "(not specified)"}
- User's goals: ${board.goals || "(not specified)"}`;
}

function historyToMessages(
  history: ConversationTurn[] = []
): Anthropic.MessageParam[] {
  return history.map((turn) => ({
    role: turn.speaker === "user" ? ("user" as const) : ("assistant" as const),
    content:
      turn.speaker === "user"
        ? turn.content
        : `${turn.speakerName ? turn.speakerName + ": " : ""}${turn.content}`,
  }));
}

export async function getPersonaResponse(
  member: BoardMember,
  board: RespondRequest["board"],
  presentation: string,
  history: ConversationTurn[] = []
): Promise<PersonaResponse> {
  if (!hasAnthropic()) {
    return mockPersonaResponse(member, presentation);
  }

  const systemPrompt = buildPersonaSystemPrompt(member, board);
  const messages: Anthropic.MessageParam[] = [
    ...historyToMessages(history),
    { role: "user", content: `Board Presentation:\n\n${presentation}` },
  ];

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages,
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return {
    memberId: member.id,
    memberName: member.name,
    archetype: member.archetype,
    text,
  };
}

// Fan out to all members in parallel, then synthesize.
export async function orchestrateBoardResponse(req: RespondRequest): Promise<{
  responses: PersonaResponse[];
  synthesis: string;
  mocked: boolean;
}> {
  const mocked = !hasAnthropic();

  const responses = await Promise.all(
    req.members.map((member) =>
      getPersonaResponse(member, req.board, req.presentation, req.history)
    )
  );

  const synthesis = await generateBoardSynthesis(responses, req.presentation);

  return { responses, synthesis, mocked };
}

// ── Deterministic mock used when ANTHROPIC_API_KEY is absent ──
export function mockPersonaResponse(
  member: BoardMember,
  presentation: string
): PersonaResponse {
  const topic = presentation.trim().slice(0, 120).replace(/\s+/g, " ");
  const label = ARCHETYPE_LABELS[member.archetype];
  const text = `[Demo response — set ANTHROPIC_API_KEY for live advice]

As your ${label}, ${member.name} here. On "${topic}${
    presentation.length > 120 ? "…" : ""
  }": I'd start by confronting the brutal facts of where you actually are versus where you want to be. The instinct to move fast is good, but get specific about the one outcome that matters most before you spread yourself thin. Name the assumption you're least sure about and design the cheapest possible test of it this week.

Recommendation: Write down the single most important decision this raises, then take one concrete, reversible action toward it in the next 72 hours.`;
  return {
    memberId: member.id,
    memberName: member.name,
    archetype: member.archetype,
    text,
  };
}
