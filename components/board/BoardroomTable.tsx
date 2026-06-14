"use client";

import { colorFor, initials } from "@/lib/colors";

interface Seat {
  name: string;
  speaking?: boolean;
}

// Top-down SVG of a boardroom table with a seat per member.
export default function BoardroomTable({ seats }: { seats: Seat[] }) {
  const cx = 200;
  const cy = 130;
  const rx = 150;
  const ry = 90;
  const n = Math.max(seats.length, 1);

  return (
    <svg viewBox="0 0 400 260" className="w-full max-w-xl">
      <defs>
        <radialGradient id="tabletop" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1c2333" />
          <stop offset="100%" stopColor="#0d1220" />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#tabletop)"
        stroke="rgba(201,168,76,0.35)"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize="13"
        fill="rgba(201,168,76,0.5)"
        fontFamily="Georgia, serif"
        letterSpacing="3"
      >
        THE BOARDROOM
      </text>
      {seats.map((seat, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * (rx + 22);
        const y = cy + Math.sin(angle) * (ry + 22);
        const color = colorFor(seat.name);
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={16}
              fill={color}
              stroke={seat.speaking ? "#E8C86E" : "rgba(255,255,255,0.1)"}
              strokeWidth={seat.speaking ? 3 : 1}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#1a1407"
            >
              {initials(seat.name)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
