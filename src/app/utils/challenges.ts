const courseLanguages = {
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

const courseDifficulty = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
} as const;

const difficultyColors = {
  1: "#00C7E6",
  2: "#00E66B",
  3: "#E6D700",
  4: "#FF285A",
} as const;

const courseStatus = {
  Incomplete: "Incomplete",
  Complete: "Complete",
  Challenge_Completed: "Challenge_Completed",
} as const;

export const challengeStatus = ["open", "completed", "claimed"] as const;

export type ChallengeMetadata = {
  slug: string;
  language: CourseLanguages;
  color: string;
  difficulty: CourseDifficulty;
  isFeatured: boolean;
  unitName: string;
  apiPath: string;
  requirements: {
    instructionKey: string;
  }[];
  collectionMintAddress?: string;
};

export type ChallengeStatus = (typeof challengeStatus)[number];
type CourseLanguages = keyof typeof courseLanguages;
type CourseDifficulty = keyof typeof courseDifficulty;
