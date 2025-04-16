import { readdir, readFile } from "node:fs/promises";
import { join } from "path";
import { CourseMetadata, LessonMetadata } from "./course";
import matter from "gray-matter";
import { notFound } from "next/navigation";

const coursesPath = join(process.cwd(), "src/app/content/courses");

export async function getCourse(courseSlug: string): Promise<CourseMetadata> {
  try {
    const filePath = join(coursesPath, courseSlug, "index.mdx");
    const source = await readFile(filePath, "utf8");

    // Parse frontmatter using gray-matter
    const { data } = matter(source);
    return data as CourseMetadata;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      notFound();
    }
    throw error;
  }
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  try {
    const filePath = join(coursesPath, courseSlug, `${lessonSlug}.mdx`);
    const source = await readFile(filePath, "utf8");

    // Parse frontmatter using gray-matter
    const { data, content } = matter(source);

    return {
      frontmatter: data as LessonMetadata,
      content,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      notFound();
    }
    throw error;
  }
}

export async function getAllCourses(): Promise<
  { slug: string; metadata: CourseMetadata }[]
> {
  const courses = await readdir(coursesPath);

  const coursePromises = courses.map(async (courseSlug) => {
    const metadata = await getCourse(courseSlug);
    return {
      slug: courseSlug,
      metadata,
    };
  });

  return Promise.all(coursePromises);
}

export async function getCourseLessons(
  courseSlug: string
): Promise<LessonMetadata[]> {
  const coursePath = join(coursesPath, courseSlug);
  const files = await readdir(coursePath);

  const lessonPromises = files
    .filter((file) => file !== "index.mdx" && file.endsWith(".mdx"))
    .map(async (file) => {
      const filePath = join(coursePath, file);
      const source = await readFile(filePath, "utf8");

      // Parse frontmatter using gray-matter
      const { data } = matter(source);
      return data as LessonMetadata;
    });

  return Promise.all(lessonPromises);
}
