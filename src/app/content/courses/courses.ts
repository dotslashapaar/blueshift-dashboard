import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

export const courses: CourseMetadata[] = withCourseNumber([
  {
    slug: "anchor-vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "lesson" },
    ],
    challenge: {
      apiPath: "/v1/verify/anchor/vault",
      requirements: [
        { instructionKey: "deposit" },
        { instructionKey: "withdraw" },
      ],
    },
  },
  {
    slug: "anchor-escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "lesson" },
    ],
    challenge: {
      apiPath: "/v1/verify/anchor/escrow",
      requirements: [
        { instructionKey: "make", },
        { instructionKey: "take", },
        { instructionKey: "refund", },
      ],
    },
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [
      { slug: "lesson" },
    ],
    challenge: {
      apiPath: "/v1/verify/native/vault",
      requirements: [
        { instructionKey: "deposit" },
        { instructionKey: "withdraw" },
      ],
    },
  },
  {
    slug: "quantum-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    lessons: [
      { slug: "introduction-to-quantum-vault" },
    ],
    challenge: {
      apiPath: "/v1/verify/quantum/vault",
      requirements: [],
    }
  },
  {
    slug: "your-first-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    lessons: [
      { slug: "understanding-spl-tokens" },
    ],
    challenge: {
      apiPath: "/v1/verify/spl-token/mint",
      requirements: [],
    }
  },
]);
