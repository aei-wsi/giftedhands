// Resolve the Anthropic API key used by The Boardroom's server-side calls.
//
// Why two names: in Claude Code's cloud environment settings, the variable
// ANTHROPIC_API_KEY is reserved by Claude Code itself (the agent authenticates
// through your Anthropic account, not this key), so a value set there may be
// ignored with a warning. To run the *app's* live AI features inside a cloud
// session, set BOARDROOM_ANTHROPIC_API_KEY instead — a non-reserved name that
// is passed straight through to the app. Locally (.env.local), either works.
export function anthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.BOARDROOM_ANTHROPIC_API_KEY;
}

export function hasAnthropic(): boolean {
  return Boolean(anthropicApiKey());
}

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
