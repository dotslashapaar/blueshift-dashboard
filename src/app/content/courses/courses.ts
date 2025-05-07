import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

export const courses: CourseMetadata[] = withCourseNumber([
  {
    slug: "anchor-vault",
    title: "Vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      {
        slug: "lesson",
        title: "Vault",
      },
    ],
    challenge: {
      title: "Challenge: Anchor Vault",
      apiPath: "/v1/verify/anchor/vault",
      requirements: [
        {
          title: "Challenge 1: Taking deposits",
          description:
            "Your program should allow a user to deposit SOL into their own vault.",
          instructionKey: "deposit",
        },
        {
          title: "Challenge 2: Allowing withdrawal",
          description:
            "The vault owner should be able to withdraw SOL from their vault.",
          instructionKey: "withdraw",
        },
      ],
    },
  },
  {
    slug: "anchor-escrow",
    title: "Escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      {
        slug: "lesson",
        title: "Escrow",
      },
    ],
    challenge: {
      title: "Challenge: Anchor Escrow",
      apiPath: "/v1/verify/anchor/escrow",
      requirements: [
        {
          title: "Challenge 1: Making an escrow swap deal",
          description:
            "Your program should allow a user to create a swap order secured by an escrow.",
          instructionKey: "make",
        },
        {
          title: "Challenge 2: Taking an escrow swap deal",
          description:
            "Your program should allow a user to take an escrow swap deal.",
          instructionKey: "take",
        },
        {
          title: "Challenge 3: Canceling an escrow swap deal",
          description:
            "Your program should allow a user to cancel an escrow swap deal and refund the maker.",
          instructionKey: "refund",
        },
      ],
    },
  },
  {
    slug: "pinocchio-vault",
    title: "Pinocchio Vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [
      {
        slug: "lesson",
        title: "Getting Started with Pinocchio",
      },
    ],
    challenge: {
      title: "Challenge: Pinocchio Vault",
      apiPath: "/v1/verify/native/vault",
      requirements: [
        {
          title: "Challenge 1: Taking deposits",
          description:
            "Your program should allow a user to deposit SOL into their own vault.",
          instructionKey: "deposit",
        },
        {
          title: "Challenge 2: Allowing withdrawal",
          description:
            "The vault owner should be able to withdraw SOL from their vault.",
          instructionKey: "withdraw",
        },
      ],
    },
  },
  {
    slug: "quantum-vault",
    title: "Quantum Vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    lessons: [
      {
        slug: "introduction-to-quantum-vault",
        title: "Introduction to Quantum Vault",
      },
    ],
    challenge: {
      title: "Challenge: Quantum Vault",
      apiPath: "/v1/verify/quantum/vault",
      requirements: [],
    }
  },
  {
    slug: "your-first-spl-token",
    title: "Your First SPL Token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    lessons: [
      {
        slug: "understanding-spl-tokens",
        title: "Understanding SPL Tokens",
      },
    ],
    challenge: {
      title: "Challenge: Minting an SPL Token",
      apiPath: "/v1/verify/spl-token/mint",
      requirements: [],
    }
  },
]);
