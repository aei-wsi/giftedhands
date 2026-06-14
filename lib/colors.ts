// Deterministic avatar color + initials for a member, derived from name.
const PALETTE = [
  "#C9A84C",
  "#5B8DEF",
  "#E07A5F",
  "#3D9970",
  "#9B5DE5",
  "#E8A87C",
  "#4ECDC4",
  "#F25F5C",
];

export function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
