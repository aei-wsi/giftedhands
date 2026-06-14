"use client";

import type { Face } from "@/lib/avatarFace";

function clampc(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function shadeC(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = clampc((n >> 16) + amt);
  const g = clampc(((n >> 8) & 255) + amt);
  const b = clampc((n & 255) + amt);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function Hair({ face }: { face: Face }) {
  const c = face.hairColor;
  switch (face.hair) {
    case "short":
      return <path d="M58 88 q-6 -58 42 -60 q48 2 42 60 q-12 -32 -42 -32 q-30 0 -42 32Z" fill={c} />;
    case "buzz":
      return <path d="M62 86 q-2 -48 38 -50 q40 2 38 50 q-10 -24 -38 -24 q-28 0 -38 24Z" fill={c} opacity={0.9} />;
    case "bob":
      return <path d="M52 126 q-10 -82 48 -86 q58 4 48 86 q-6 -36 -18 -48 q-30 -16 -60 0 q-12 12 -18 48Z" fill={c} />;
    case "long":
      return <path d="M50 148 Q42 50 100 44 Q158 50 150 148 Q152 84 130 62 Q100 46 70 62 Q48 84 50 148Z" fill={c} />;
    case "bald":
      return (
        <>
          <path d="M62 100 Q60 84 72 78" stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M138 100 Q140 84 128 78" stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
        </>
      );
    default:
      return null;
  }
}

// Procedurally generated headshot framed like a webcam feed. The mouth group
// carries className "av-mouth" so the parent tile can animate it when speaking.
export default function GeneratedAvatar({ face }: { face: Face }) {
  const skinDark = shadeC(face.skin, -30);
  return (
    <svg className="av-bust" viewBox="0 0 200 210" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <path d="M16 210 Q16 150 58 136 L142 136 Q184 150 184 210 Z" fill={face.jacket} />
      <path d="M84 210 Q100 168 116 210 Z" fill={shadeC(face.jacket, -18)} />
      <rect x="90" y="126" width="20" height="22" rx="6" fill={face.skin} />
      <path d="M86 134 L100 160 L114 134 L124 142 L100 178 L76 142 Z" fill="#f2f3f7" />
      <ellipse cx="60" cy="96" rx="8" ry="9" fill={face.skin} />
      <ellipse cx="140" cy="96" rx="8" ry="9" fill={face.skin} />
      <ellipse cx="100" cy="92" rx="40" ry="46" fill={face.skin} />
      <Hair face={face} />
      <path d="M74 80 q9 -5 17 0" stroke={face.hairColor} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M109 80 q9 -5 17 0" stroke={face.hairColor} strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx="82" cy="90" rx="4.4" ry="5.4" fill="#2c2622" />
      <ellipse cx="118" cy="90" rx="4.4" ry="5.4" fill="#2c2622" />
      {face.glasses && (
        <g stroke="#2b2b2b" strokeWidth={2.6} fill="rgba(255,255,255,.06)" opacity={0.85}>
          <circle cx="82" cy="90" r="12" />
          <circle cx="118" cy="90" r="12" />
          <path d="M94 90h12" />
        </g>
      )}
      <path d="M100 95 l-4 13 q4 3 8 0" stroke={skinDark} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <g className="av-mouth">
        <path d="M88 118 q12 11 24 0 q-12 5 -24 0Z" fill="#8a4a47" />
      </g>
    </svg>
  );
}
