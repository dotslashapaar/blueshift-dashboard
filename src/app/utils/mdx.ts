import { CourseMetadata, LessonMetadata } from "./course";
import { notFound } from "next/navigation";

import { courses } from "@/app/content/courses/courses";

export async function getCourse(courseSlug: string): Promise<CourseMetadata> {
  const course = courses.find(
    (course) => course.slug === courseSlug
  );

  if (!course) {
    notFound();
  }

  return {
    ...structuredClone(course),
    lessons: course.lessons.map((lesson, index) => ({
      ...structuredClone(lesson),
      lessonNumber: index + 1
    }))
  }
}

export async function getAllCourses(): Promise<CourseMetadata[]> {
  return structuredClone(courses);

}

export async function getCourseLessons(
  courseSlug: string
): Promise<LessonMetadata[]> {
  const course = await getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  return structuredClone(course.lessons)
}
