"use client";

import Link from "next/link";
import Button from "../Button/Button";
import i18n from "@/i18n/client";
import { CourseMetadata } from "@/app/utils/course";
import { useCurrentLessonSlug } from "@/hooks/useCurrentLessonSlug";

interface BackToCourseButtonProps {
  course: CourseMetadata;
}

export default function BackToCourseButton({
  course,
}: BackToCourseButtonProps) {
  const lastLessonSlug = useCurrentLessonSlug(course);
  const { t } = i18n;

  return (
    <Link href={`/courses/${course.slug}/${lastLessonSlug}`} className="!mt-4">
      <Button
        label={t("challenges.back_to_lessons")}
        icon="ArrowLeft"
        variant="secondary"
      />
    </Link>
  );
}
