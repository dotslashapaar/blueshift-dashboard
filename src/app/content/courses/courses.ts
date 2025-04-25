import {CourseMetadata, withCourseNumber} from "@/app/utils/course";

export const courses: CourseMetadata[] = withCourseNumber([
  {
    slug: "anchor-vault",
    title: "Vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    status: "Unclaimed",
    lessons: [
      {
        slug: "lesson",
        title: "Vault",
      },
    ]
  },
  {
    slug: "anchor-escrow",
    title: "Escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    status: "Unclaimed",
    lessons: [
      {
        slug: "lesson",
        title: "Escrow",
      },
    ]
  },
  {
    slug: "pinocchio-vault",
    title: "Pinocchio Vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    status: "Unclaimed",
    lessons: [
      {
        slug: "lesson",
        title: "Getting Started with Pinocchio",
      },
    ]
  },
  {
    slug: "quantum-vault",
    title: "Quantum Vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    status: "Claimed",
    lessons: [
      {
        slug: "introduction-to-quantum-vault",
        title: "Introduction to Quantum Vault",
      },
    ]
  },
  {
    slug: "your-first-spl-token",
    title: "Your First SPL Token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    status: "Locked",
    lessons: [
      {
        slug: "understanding-spl-tokens",
        title: "Understanding SPL Tokens",
      },
    ]
  }
])


