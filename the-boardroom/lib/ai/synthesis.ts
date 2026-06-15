import Anthropic from "@anthropic-ai/sdk";
import type { PersonaResponse } from "@/lib/types";
import { ANTHROPIC_MODEL as MODEL, anthropicApiKey, hasAnthropic } from "@/lib/ai/key";

export async function generateBoardSynthesis(
  responses: PersonaResponse[],
  presentation: string
): Promise<string> {
  if (!hasAnthropic()) {
    return mockSynthesis(responses);
  }

  const prompt = `A board of directors just responded to this presentation:
"${presentation}"

Their individual responses:
${responses.map((r) => `${r.memberName}: ${r.text}`).join("\n\n")}

Generate a 3-paragraph Board Consensus that:
1. Identifies the key themes of agreement across members.
2. Names any significant divergence or tension in the advice.
3. Distills the top 3 action items the presenter should take.

Write in the voice of a senior board secretary — clear, direct, no fluff. After the three paragraphs, output an "ACTION ITEMS:" list with exactly 3 bullet points.`;

  const synthesis = await new Anthropic({
    apiKey: anthropicApiKey(),
  }).messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return synthesis.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function mockSynthesis(responses: PersonaResponse[]): string {
  const names = responses.map((r) => r.memberName).join(", ");
  return `[Demo synthesis — set ANTHROPIC_API_KEY for a live board consensus]

The board (${names}) converges on a single theme: get specific and confront reality before acting. Across the table there is strong agreement that clarity of the core objective must precede speed of execution.

The notable tension is between the challengers, who push for an immediate reversible test, and the values anchors, who want the decision pressure-tested against your stated purpose first. Both are right; sequence them — purpose-check, then fast experiment.

The board recommends you narrow to one decision, make it reversible, and report back the result.

ACTION ITEMS:
- Write down the single most important decision this presentation raises.
- Define the cheapest reversible test of your riskiest assumption.
- Take one concrete action toward it within 72 hours and schedule a board review.`;
}
