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