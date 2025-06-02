import { CourseMetadata, LessonMetadata } from "./course";
import { notFound } from "next/navigation";

import { courses } from "@/app/content/courses/courses";
import { challenges } from "@/app/content/challenges/challenges";
import { ChallengeMetadata } from "./challenges";

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

export async function getAllChallenges(): Promise<ChallengeMetadata[]> {
  return structuredClone(challenges);
}