import { IconName } from "@/app/components/Icon/icons";

export const challengeLanguages = {
  Anchor: "Anchor",
  Rust: "Rust",
  Typescript: "TypeScript",
  Assembly: "Assembly",
  Research: "Research",
} as const;

export const challengeColors = {
  Anchor: "221,234,224",
  Rust: "255,173,102",
  Typescript: "105,162,241",
  Assembly: "140,255,102",
  Research: "0,255,255",
} as const;

export const challengeDifficulty = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
} as const;

export const challengeStatus = ["open", "completed", "claimed"] as const;

export type ChallengeMetadata = {
  slug: string;
  language: ChallengeLanguages;
  color: string;
  difficulty: ChallengeDifficulty;
  isFeatured: boolean;
  unitName: string;
  apiPath: string;
  pages?: {
    slug: string;
  }[];
  requirements: {
    instructionKey: string;
  }[];
  collectionMintAddress?: string;
};

export type ChallengeStatus = (typeof challengeStatus)[number];
type ChallengeLanguages = keyof typeof challengeLanguages;
type ChallengeDifficulty = keyof typeof challengeDifficulty;

export const challengeStatusToIconName = (status: ChallengeStatus): IconName => {
  switch (status) {
    case "open":
      return "Open";
    case "completed":
      return "Completed";
    case "claimed":
      return "Claimed";
    default:
      return "Open"; // Fallback icon
  }
}