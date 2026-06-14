// ── Domain types for The Boardroom ──

export type Archetype =
  | "challenger"
  | "sponsor"
  | "expert"
  | "confidant"
  | "connector"
  | "values_anchor";

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  challenger: "Challenger",
  sponsor: "Sponsor",
  expert: "Expert",
  confidant: "Confidant",
  connector: "Connector",
  values_anchor: "Values Anchor",
};

export type MemberType = "real_person" | "custom";

export interface BoardMember {
  id: string;
  boardId?: string;
  name: string;
  role: string;
  type: MemberType;
  archetype: Archetype;
  personaPrompt: string;
  voiceId?: string | null;
  avatarId?: string | null;
  attributes?: CustomAttributes | null;
}

export interface CustomAttributes {
  background?: string;
  communicationStyle?: string;
  expertise?: string;
  values?: string;
  blindSpots?: string;
  decisionStyle?: string;
}

export interface Board {
  id: string;
  userId?: string;
  name: string;
  purpose: string;
  values: string;
  goals: string;
  charterText?: string;
  members: BoardMember[];
  createdAt: string;
  updatedAt: string;
}

export type PresentationType = "text" | "voice" | "document";
export type ResponseMode = "document" | "chat" | "live";

export interface PersonaResponse {
  memberId: string;
  memberName: string;
  archetype: Archetype;
  text: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
}

export interface ConversationTurn {
  id: string;
  sessionId: string;
  speaker: "user" | string; // "user" or a memberId
  speakerName?: string;
  content: string;
  turnOrder: number;
  createdAt: string;
}

export interface Session {
  id: string;
  boardId: string;
  title: string;
  presentationText: string;
  presentationType: PresentationType;
  status: "active" | "completed";
  responses: PersonaResponse[];
  synthesis?: string;
  turns: ConversationTurn[];
  createdAt: string;
}

export interface RespondRequest {
  presentation: string;
  members: BoardMember[];
  board: Pick<Board, "purpose" | "values" | "goals"> & { userName?: string };
  history?: ConversationTurn[];
  mode?: ResponseMode;
}

export interface RespondResponse {
  responses: PersonaResponse[];
  synthesis: string;
  mocked: boolean;
}

// ── Live boardroom discussion (conversational round-table) ──
export type DiscussionFlow = "organic" | "moderated" | "hybrid";
export type ChairMode = "dedicated" | "member" | "none";

export type TurnKind =
  | "open"
  | "react"
  | "challenge"
  | "agree"
  | "build"
  | "moderate"
  | "consensus";

export interface DiscussionTurn {
  speakerId: string; // a member id, or "chair"
  speakerName: string;
  archetype?: Archetype; // undefined for the chair
  addressedToId?: string;
  addressedToName?: string;
  kind: TurnKind;
  text: string;
}

export interface DiscussRequest {
  presentation: string;
  members: BoardMember[];
  board: Pick<Board, "purpose" | "values" | "goals"> & { userName?: string };
  flow: DiscussionFlow;
  chair: ChairMode;
  chairMemberId?: string;
}

export interface DiscussResponse {
  turns: DiscussionTurn[];
  chairName?: string;
  chairId?: string;
  mocked: boolean;
}
