import type { Archetype, BoardMember, CustomAttributes } from "@/lib/types";

export interface CustomPersonaInput extends CustomAttributes {
  name: string;
  role: string;
  archetype: Archetype;
}

// Build a persona prompt from the custom attribute form (Path B).
// This is deterministic so it works without an API key. When ANTHROPIC_API_KEY
// is present you can route this through Claude for richer prose (TODO Phase 2).
export function buildCustomPersonaPrompt(input: CustomPersonaInput): string {
  const lines = [
    `Advisory archetype: ${input.archetype}`,
    input.background && `Background and expertise: ${input.background}`,
    input.communicationStyle &&
      `Communication style: ${input.communicationStyle}`,
    input.values && `Core philosophy and values: ${input.values}`,
    input.expertise && `Areas of expertise: ${input.expertise}`,
    input.decisionStyle && `Decision-making style: ${input.decisionStyle}`,
    input.blindSpots &&
      `Biases and blind spots you will deliberately challenge in the presenter: ${input.blindSpots}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function customInputToMember(
  input: CustomPersonaInput,
  id: string
): BoardMember {
  return {
    id,
    name: input.name,
    role: input.role,
    type: "custom",
    archetype: input.archetype,
    personaPrompt: buildCustomPersonaPrompt(input),
    voiceId: null,
    avatarId: null,
    attributes: {
      background: input.background,
      communicationStyle: input.communicationStyle,
      expertise: input.expertise,
      values: input.values,
      blindSpots: input.blindSpots,
      decisionStyle: input.decisionStyle,
    },
  };
}
