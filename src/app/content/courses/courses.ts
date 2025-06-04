import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

const allCourses: CourseMetadata[] = withCourseNumber([
  {
    slug: "anchor-vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Vault",
    lessons: [
      { slug: "introduction" },
      { slug: "code" },
    ],
    challenge: "anchor-vault",
  },
  {
    slug: "anchor-escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Escrow",
    lessons: [
      { slug: "introduction" },
      { slug: "code" },
    ],
    challenge: "anchor-escrow",
  },
  {
    slug: "anchor-memo",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Memo",
    lessons: [{ slug: "lesson" }],
    challenge: "anchor-memo",
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Vault",
    lessons: [
      { slug: "introduction" },
      { slug: "code" },
    ],
    challenge: "pinocchio-vault",
  },
  {
    slug: "pinocchio-memo",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Memo",
    lessons: [{ slug: "lesson" }],
    challenge: "pinocchio-memo",
  },
  {
    slug: "assembly-memo",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Assembly Memo",
    lessons: [{ slug: "lesson" }],
    challenge: "assembly-memo",
  },
  {
    slug: "quantum-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    unitName: "Quantum Vault",
    lessons: [{ slug: "introduction-to-quantum-vault" }],
  },
  {
    slug: "your-first-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    unitName: "SPL Token Mint",
    lessons: [{ slug: "understanding-spl-tokens" }],
    challenge: "your-first-spl-token",
  },
  {
    slug: "research-crateless-program",
    language: "Research",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    unitName: "Byte by Byte",
    lessons: [{ slug: "lesson" }],
    challenge: "research-crateless-program",
  }
]);

const releasedCourses = (
  process.env.NEXT_PUBLIC_RELEASED_COURSES?.split(",") ?? []
).map((course) => course.trim());

export const courses = allCourses.filter((course) => {
  return (
    process.env.NEXT_PUBLIC_RELEASE_ALL_COURSES?.trim() === "true" ||
    releasedCourses.includes(course.slug)
  );
});
