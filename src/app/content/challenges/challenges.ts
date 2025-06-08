import { ChallengeMetadata } from "@/app/utils/challenges";

const allChallenges: ChallengeMetadata[] = [
  {
    slug: "anchor-vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Vault",
    apiPath: "/v1/verify/anchor/vault",
    requirements: [
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
    ],
    collectionMintAddress: "53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz",
  },
  {
    slug: "anchor-escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Escrow",
    apiPath: "/v1/verify/anchor/escrow",
    requirements: [
      { instructionKey: "make" },
      { instructionKey: "take" },
      { instructionKey: "refund" },
    ],
    collectionMintAddress: "2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L",
  },
  {
    slug: "anchor-memo",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Memo",
    apiPath: "/v1/verify/anchor/memo",
    requirements: [{ instructionKey: "log" }],
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Vault",
    apiPath: "/v1/verify/pinocchio/vault",
    requirements: [
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
    ],
    collectionMintAddress: "AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK",
  },
  {
    slug: "pinocchio-memo",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Memo",
    apiPath: "/v1/verify/pinocchio/memo",
    requirements: [{ instructionKey: "log" }],
  },
  {
    slug: "assembly-memo",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Assembly Memo",
    apiPath: "/v1/verify/assembly/memo",
    requirements: [{ instructionKey: "log" }],
  },
  {
    slug: "your-first-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    unitName: "SPL Token Mint",
    apiPath: "/v1/verify/spf-token/create-mint",
    requirements: [{ instructionKey: "create_mint" }],
  },
];

const releasedChallengesSetting = process.env.NEXT_PUBLIC_RELEASED_CHALLENGES?.trim();

export const challenges = allChallenges.filter((challenge) => {
  // If the setting is undefined, null, or an empty string, release no challenges.
  if (!releasedChallengesSetting) {
    return false;
  }

  // If the setting is "*", release all challenges.
  if (releasedChallengesSetting === "*") {
    return true;
  }

  // Otherwise, treat the setting as a comma-separated list of challenge slugs.
  const releasedSlugs = releasedChallengesSetting
    .split(",")
    .map((slug) => slug.trim())
    .filter(slug => slug.length > 0); // Ensure empty strings from trailing/multiple commas are ignored

  return releasedSlugs.includes(challenge.slug);
});
