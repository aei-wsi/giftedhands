// Deterministic generated-avatar faces. The 15 library personas get hand-tuned
// faces; everyone else (custom members) gets a stable face hashed from name.
// These are stylized placeholders — the seam where HeyGen/Tavus avatars land.

export type HairStyle = "short" | "buzz" | "bob" | "long" | "bald";

export interface Face {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  jacket: string;
  glasses: boolean;
}

const SKINS = ["#f0c3a3", "#e8c4a0", "#e6b596", "#d9a574", "#b87a4e", "#8d5a3c", "#6b4226"];
const HAIR_COLORS = ["#181310", "#241a12", "#3a2a1a", "#463729", "#7a5b3a", "#cda84f", "#bdb6aa", "#d2cdc2"];
const JACKETS = ["#33405e", "#3a3f4d", "#7a3b4e", "#6b4a86", "#2f6f56", "#2f6e6a", "#3d4a63", "#5a4a3a"];
const HAIRS: HairStyle[] = ["short", "buzz", "bob", "long"];

// Hand-tuned faces for the launch personas (keyed by their slug id).
const PRESETS: Record<string, Face> = {
  "jim-collins": { skin: "#e6b596", hair: "short", hairColor: "#bdb6aa", jacket: "#33405e", glasses: true },
  "brene-brown": { skin: "#f0c3a3", hair: "bob", hairColor: "#cda84f", jacket: "#7a3b4e", glasses: false },
  "ray-dalio": { skin: "#e7b897", hair: "short", hairColor: "#d2cdc2", jacket: "#3a3f4d", glasses: false },
  "simon-sinek": { skin: "#e6b596", hair: "buzz", hairColor: "#241a12", jacket: "#3d4a63", glasses: false },
  "tiffany-aliche": { skin: "#8d5a3c", hair: "long", hairColor: "#241a12", jacket: "#6b4a86", glasses: false },
  "gary-vaynerchuk": { skin: "#e2af8e", hair: "buzz", hairColor: "#1a1a1a", jacket: "#2f3a4d", glasses: false },
  "deb-liu": { skin: "#e8c4a0", hair: "long", hairColor: "#181310", jacket: "#2f6f56", glasses: true },
  "seth-godin": { skin: "#e6b596", hair: "bald", hairColor: "#9a8f80", jacket: "#3a3f4d", glasses: true },
  "matthew-mcconaughey": { skin: "#d9a574", hair: "long", hairColor: "#7a5b3a", jacket: "#5a4a3a", glasses: false },
  "lisa-nichols": { skin: "#8d5a3c", hair: "long", hairColor: "#181310", jacket: "#7a3b4e", glasses: false },
  "tyler-perry": { skin: "#6b4226", hair: "buzz", hairColor: "#181310", jacket: "#33405e", glasses: false },
  "robert-greene": { skin: "#e6b596", hair: "short", hairColor: "#bdb6aa", jacket: "#3a3f4d", glasses: true },
  "ruchika-tulshyan": { skin: "#b87a4e", hair: "long", hairColor: "#181310", jacket: "#6b4a86", glasses: false },
  "keith-ferrazzi": { skin: "#e2af8e", hair: "buzz", hairColor: "#463729", jacket: "#2f6e6a", glasses: false },
  "napoleon-hill": { skin: "#e8c4a0", hair: "short", hairColor: "#d2cdc2", jacket: "#5a4a3a", glasses: true },
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function faceFor(memberId: string, name: string): Face {
  if (PRESETS[memberId]) return PRESETS[memberId];
  const h = hash(name || memberId);
  return {
    skin: SKINS[h % SKINS.length],
    hair: HAIRS[(h >> 3) % HAIRS.length],
    hairColor: HAIR_COLORS[(h >> 6) % HAIR_COLORS.length],
    jacket: JACKETS[(h >> 9) % JACKETS.length],
    glasses: ((h >> 12) & 1) === 1,
  };
}
