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
      { slug: "anchor-instructions" },
      { slug: "conclusions" },
    ],
  },
  {
    slug: "introduction-to-pinocchio",
    language: "Rust",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "pinocchio-101" },
      { slug: "pinocchio-accounts" },
      { slug: "pinocchio-instructions" },
      { slug: "conclusions" },
    ],
  },
  {
    slug: "secp256r1-on-solana",
    language: "Rust",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "secp256r1-with-anchor" },
      { slug: "secp256r1-with-pinocchio" },
      { slug: "conclusions" },
    ],
  },
  {
    slug: "token-2022-program",
    language: "Rust",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "token-extensions" },
      { slug: "conclusions" },
    ],
  },
  {
    slug: "token-2022-with-web3js",
    language: "Typescript",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "transfer-fee-extension" },
      { slug: "mint-close-authority-extension" },
      { slug: "default-account-state-extension" },
      { slug: "immutable-owner-extension" },
      { slug: "memo-transfer-extension" },
      { slug: "non-transferable-extension" },
      { slug: "interest-bearing-extension" },
      { slug: "cpi-guard-extension" },
      { slug: "permanent-delegate-extension" },
    ],
  },
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