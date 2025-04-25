"use client";

import Link from "next/link";
import Button from "../Button/Button";

import i18n from "@/i18n/client";
interface CourseChallengeButtonProps {
  isCourseReady: boolean;
  courseSlug: string;
}

export default function CourseChallengeButton({
  isCourseReady = false,
  courseSlug,
}: CourseChallengeButtonProps) {
  const { t } = i18n;
  return (
    <div className="text-center bg-background-card relative xl:absolute xl:left-14 bottom-8 bg-card rounded-2xl px-6 py-5 flex flex-col gap-y-4">
      <span className="font-medium text-secondary">
        {isCourseReady ? t("challenges.ready") : t("challenges.not_ready")}
      </span>
      <Link href={`/courses/${courseSlug}/challenge`}>
        <Button
          disabled={!isCourseReady}
          variant="primary"
          size="lg"
          label={t("challenges.see_challenge")}
          icon="Challenge"
          className="disabled:opacity-40 w-full disabled:cursor-default"
        ></Button>
      </Link>
    </div>
  );
}
