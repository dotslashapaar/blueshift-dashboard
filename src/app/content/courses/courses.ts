import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

const allCourses: CourseMetadata[] = withCourseNumber([
  {
    slug: "introduction-to-anchor",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "anchor-101" },
      { slug: "anchor-accounts" },
    ],
  },
  {
    slug: "anchor-memo",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: "anchor-memo",
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
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
    lessons: [{ slug: "lesson" }],
    challenge: "pinocchio-memo",
  },
  {
    slug: "assembly-memo",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: "assembly-memo",
  },
  {
    slug: "quantum-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    lessons: [{ slug: "introduction-to-quantum-vault" }],
  },
  {
    slug: "your-first-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "understanding-spl-tokens" }],
    challenge: "your-first-spl-token",
  },
  {
    slug: "research-crateless-program",
    language: "Research",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: "research-crateless-program",
  }
]);

const releasedCoursesSetting = process.env.NEXT_PUBLIC_RELEASED_COURSES?.trim();

export const courses = allCourses.filter((course) => {
  // If the setting is undefined, null, or an empty string, release no courses.
  if (!releasedCoursesSetting) {
    return false;
  }

  // If the setting is "*", release all courses.
  if (releasedCoursesSetting === "*") {
    return true;
  }

  // Otherwise, treat the setting as a comma-separated list of course slugs.
  const releasedSlugs = releasedCoursesSetting
    .split(",")
    .map((slug) => slug.trim())
    .filter(slug => slug.length > 0); // Ensure empty strings from trailing/multiple commas are ignored

  return releasedSlugs.includes(course.slug);
});