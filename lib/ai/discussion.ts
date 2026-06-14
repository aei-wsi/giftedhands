import Anthropic from "@anthropic-ai/sdk";
import type {
  BoardMember,
  DiscussRequest,
  DiscussResponse,
  DiscussionTurn,
  TurnKind,
} from "@/lib/types";
import { ARCHETYPE_LABELS } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function resolveChair(req: DiscussRequest): { name?: string; id?: string } {
  if (req.chair === "none") return {};
  if (req.chair === "member") {
    const m =
      req.members.find((x) => x.id === req.chairMemberId) ||
      req.members.find((x) => x.archetype === "sponsor") ||
      req.members.find((x) => x.archetype === "values_anchor") ||
      req.members[0];
    return m ? { name: m.name, id: m.id } : {};
  }
  return { name: "The Board Chair", id: "chair" };
}

export async function orchestrateBoardDiscussion(
  req: DiscussRequest
): Promise<DiscussResponse> {
  const chair = resolveChair(req);
  if (!process.env.ANTHROPIC_API_KEY) {
    return { turns: mockDiscussion(req, chair), chairName: chair.name, chairId: chair.id, mocked: true };
  }
  try {
    const turns = await claudeDiscussion(req, chair);
    return { turns, chairName: chair.name, chairId: chair.id, mocked: false };
  } catch (e) {
    console.error("discussion generation failed, falling back to mock", e);
    return { turns: mockDiscussion(req, chair), chairName: chair.name, chairId: chair.id, mocked: true };
  }
}

function memberSummary(m: BoardMember): string {
  const firstLines = m.personaPrompt.split("\n").slice(0, 3).join(" ");
  return firstLines.replace(/\s+/g, " ").slice(0, 240);
}

async function claudeDiscussion(
  req: DiscussRequest,
  chair: { name?: string; id?: string }
): Promise<DiscussionTurn[]> {
  const dedicatedChair = req.chair === "dedicated";
  const chairLine = chair.name
    ? dedicatedChair
      ? `There is a neutral facilitator, "The Board Chair" (speakerId "chair"), who does NOT give advice — they open the room, hand off between members, and deliver the closing consensus.`
      : `${chair.name} also acts as the chair, opening and closing the discussion in addition to giving their own advice.`
    : `There is no facilitator — members self-organize.`;

  const flowLine =
    req.flow === "organic"
      ? "ORGANIC: members spontaneously react to, build on, and challenge EACH OTHER by name. No rigid order. Disagreement and energy are welcome."
      : req.flow === "moderated"
      ? "MODERATED: the chair drives the conversation, calling on members by name and managing the back-and-forth."
      : "HYBRID: the chair opens and closes, but members drive the middle with free reactions and interjections.";

  const roster = req.members
    .map(
      (m) =>
        `- id:${m.id} | ${m.name} (${ARCHETYPE_LABELS[m.archetype]}): ${memberSummary(m)}`
    )
    .join("\n");

  const prompt = `Simulate a realistic, lively BOARDROOM DISCUSSION — a real conversation, not a series of isolated speeches — where a personal board of advisors debates the presenter's situation.

Presenter context:
- Purpose: ${req.board.purpose || "(unspecified)"}
- Values: ${req.board.values || "(unspecified)"}
- Goals: ${req.board.goals || "(unspecified)"}

Presentation:
"""${req.presentation}"""

Board members (stay deeply true to each persona):
${roster}

Chair: ${chairLine}
Flow: ${flowLine}

Return ONLY a JSON object of this exact shape (no prose, no markdown fences):
{"turns":[{"speakerId":"<member id or 'chair'>","kind":"open|react|challenge|agree|build|moderate|consensus","addressedToId":"<member id, optional>","text":"<25-70 words, first person, in character>"}]}

Rules:
- 10 to 16 turns total.
- Members must respond to EACH OTHER: when reacting, set addressedToId to that member's id and name them in the text.
- Vary the kinds — include genuine challenges and agreements, not just openings.
- Keep each turn 25-70 words, punchy and conversational.
- ${chair.name ? `Use speakerId "chair" only if the chair is the dedicated facilitator; otherwise the chair is the member id.` : "No chair turns."}
- End with one or two turns of kind "consensus" (spoken by ${dedicatedChair ? `the chair` : `the chair/most senior voice`}) summarizing agreement, the key tension, and exactly 3 action items.`;

  const res = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no JSON in model output");
  const parsed = JSON.parse(raw.slice(start, end + 1)) as {
    turns: Array<{ speakerId: string; kind: TurnKind; addressedToId?: string; text: string }>;
  };

  return parsed.turns
    .filter((t) => t && t.text && t.speakerId)
    .map((t) => enrich(t, req, chair));
}

function enrich(
  t: { speakerId: string; kind: TurnKind; addressedToId?: string; text: string },
  req: DiscussRequest,
  chair: { name?: string; id?: string }
): DiscussionTurn {
  const isChair = t.speakerId === "chair" || (chair.id && t.speakerId === chair.id && req.chair === "dedicated");
  const member = req.members.find((m) => m.id === t.speakerId);
  const addressed = req.members.find((m) => m.id === t.addressedToId);
  return {
    speakerId: isChair ? "chair" : t.speakerId,
    speakerName: isChair ? chair.name || "The Board Chair" : member?.name || t.speakerId,
    archetype: isChair ? undefined : member?.archetype,
    addressedToId: addressed?.id,
    addressedToName: addressed?.name,
    kind: t.kind,
    text: t.text.trim(),
  };
}

// ── Deterministic mock discussion (no API key) ──
const OPENERS: Record<string, string> = {
  challenger: "Let me push on this. The story sounds tidy, but where's the brutal fact you're avoiding?",
  sponsor: "Before we go further — who's actually in your corner for this? That changes everything.",
  expert: "Let's ground this in specifics. I want the real numbers and the real constraints, not the vision.",
  confidant: "Can we name the fear underneath this first? That's the thing steering you, not the spreadsheet.",
  connector: "My instinct is you're trying to do this alone. Who could you bring in to de-risk it?",
  values_anchor: "Start with the why. Does this actually serve the purpose you said you cared about?",
};

const REACTIONS: { kind: TurnKind; t: (a: string) => string }[] = [
  { kind: "challenge", t: (a) => `I hear ${a}, but I'd challenge that — you're optimizing for comfort, not the outcome that matters.` },
  { kind: "build", t: (a) => `Building on what ${a} said — that's exactly right, and here's the part they didn't push hard enough on.` },
  { kind: "agree", t: (a) => `${a} is onto something. I agree, and I'd add: the cost of waiting is higher than the cost of being wrong here.` },
  { kind: "react", t: (a) => `Respectfully, ${a}, that's the safe answer. The honest move is messier than that.` },
];

function mockDiscussion(
  req: DiscussRequest,
  chair: { name?: string; id?: string }
): DiscussionTurn[] {
  const topic = req.presentation.replace(/\s+/g, " ").trim().slice(0, 90);
  const turns: DiscussionTurn[] = [];
  const hasChair = !!chair.name;
  const chairTurn = (kind: TurnKind, text: string): DiscussionTurn => ({
    speakerId: "chair",
    speakerName: chair.name || "The Board Chair",
    kind,
    text,
  });

  if (hasChair) {
    turns.push(
      chairTurn(
        "moderate",
        `Let's get into it. On the table: "${topic}${req.presentation.length > 90 ? "…" : ""}". I'll open the floor — let's be candid and build on each other. ${req.members[0]?.name}, start us off.`
      )
    );
  }

  // opening takes
  req.members.forEach((m, i) => {
    turns.push({
      speakerId: m.id,
      speakerName: m.name,
      archetype: m.archetype,
      kind: i === 0 ? "open" : "react",
      addressedToId: i > 0 ? req.members[i - 1].id : undefined,
      addressedToName: i > 0 ? req.members[i - 1].name : undefined,
      text:
        (i > 0 ? `${req.members[i - 1].name}, ` : "") +
        (OPENERS[m.archetype] || "Here's how I see it."),
    });
  });

  // a couple of cross-talk reactions
  if (req.members.length >= 3) {
    const a = req.members[2];
    const b = req.members[0];
    const r = REACTIONS[0];
    turns.push({
      speakerId: a.id,
      speakerName: a.name,
      archetype: a.archetype,
      kind: r.kind,
      addressedToId: b.id,
      addressedToName: b.name,
      text: r.t(b.name),
    });
    const c = req.members[1];
    const d = req.members[2];
    const r2 = REACTIONS[1];
    turns.push({
      speakerId: c.id,
      speakerName: c.name,
      archetype: c.archetype,
      kind: r2.kind,
      addressedToId: d.id,
      addressedToName: d.name,
      text: r2.t(d.name),
    });
  }

  if (hasChair) {
    turns.push(
      chairTurn(
        "moderate",
        `Good tension in the room. Let me bring it together before we lose the thread.`
      )
    );
  }

  turns.push(
    (hasChair
      ? chairTurn
      : (kind: TurnKind, text: string): DiscussionTurn => ({
          speakerId: req.members[0].id,
          speakerName: req.members[0].name,
          archetype: req.members[0].archetype,
          kind,
          text,
        }))(
      "consensus",
      `[Demo discussion — add ANTHROPIC_API_KEY for a live debate] Consensus: the board agrees you must get specific and confront reality before moving. The tension is speed versus a purpose-check first. Action items: (1) write the single decision this raises, (2) define the cheapest reversible test of your riskiest assumption, (3) take one concrete step within 72 hours and report back.`
    )
  );

  return turns;
}
