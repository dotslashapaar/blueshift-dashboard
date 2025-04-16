"use client";

import Link from "next/link";
import Button from "../Button/Button";
import { usePersistentStore } from "@/stores/store";
import i18n from "@/i18n/client";

interface BackToCourseButtonProps {
  courseSlug: string;
  courseLessons?: {
    number: number;
    slug: string;
  }[];
}

export default function BackToCourseButton({
  courseSlug,
  courseLessons = [],
}: BackToCourseButtonProps) {
  const { courseProgress } = usePersistentStore();
  const { t } = i18n;

  // Get the current lesson slug based on course progress
  const getCurrentLessonSlug = () => {
    const progress = courseProgress[courseSlug];
    if (!progress || !courseLessons) return "";

    // Find the lesson with matching number
    const currentLesson = courseLessons.find(
      (lesson) => lesson.number === progress
    );

    return currentLesson?.slug || "";
  };

  const lastLessonSlug = getCurrentLessonSlug();

  return (
    <Link href={`/courses/${courseSlug}/${lastLessonSlug}`} className="!mt-4">
      <Button
        label={t("challenges.back_to_lessons")}
        icon="ArrowLeft"
        variant="secondary"
      />
    </Link>
  );
}
