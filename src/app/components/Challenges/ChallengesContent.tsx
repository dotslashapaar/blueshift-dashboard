"use client";

import { useState } from "react";
import { usePersistentStore } from "@/stores/store";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import i18n from "@/i18n/client";
import { CourseMetadata } from "@/app/utils/course";
import ChallengeRequirements from "./ChallengeRequirements";
import ChallengeTable from "./ChallengeTable";
import Link from "next/link";
import { useCurrentLessonSlug } from "@/hooks/useCurrentLessonSlug";

export default function ChallengesContent({
  currentCourse,
}: {
  currentCourse: CourseMetadata;
}) {
  // Replace with real connection later
  const [isUserConnected] = useState(true);
  const { courseProgress } = usePersistentStore();
  const { t } = i18n;
  const isCourseCompleted =
    courseProgress[currentCourse.slug] === currentCourse.lessons.length;
  const lastLessonSlug = useCurrentLessonSlug(currentCourse);

  return (
    <div className="relative w-full h-full">
      {!isUserConnected ? (
        <div className="absolute z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col gap-y-4 sm:!-mt-24 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="text-center text-lg sm:text-xl font-medium leading-none">
              {t("challenges.connect_wallet")}
            </div>
            <div className="text-center text-secondary mx-auto sm:w-2/3 w-full">
              {t("challenges.connect_wallet_description")}
            </div>
          </div>
          <Button
            label="Connect wallet"
            variant="primary"
            size="lg"
            className="!w-[2/3]"
            icon="Wallet"
          />
        </div>
      ) : (
        <>
          {/* Overlay for locked course */}
          {!isCourseCompleted && (
            <div className="absolute z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col gap-y-4 sm:!-mt-24 max-w-[90dvw]">
                <div className="text-center justify-center text-lg sm:text-xl font-medium leading-none gap-x-2 items-center flex">
                  <Icon name="Locked" className="text-secondary" />
                  {t("challenges.locked")}
                </div>
                <div className="text-center text-secondary mx-auto w-full">
                  {t("challenges.locked_description")}
                </div>
              </div>
              <Link href={`/courses/${currentCourse.slug}/${lastLessonSlug}`}>
                <Button
                  label="Back to Course"
                  variant="primary"
                  size="lg"
                  className="!w-[2/3]"
                  icon="ArrowLeft"
                />
              </Link>
            </div>
          )}
          <div className="px-4 py-14 max-w-app md:px-8 lg:px-14 mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-24">
            <ChallengeRequirements />
            <ChallengeTable />
          </div>
        </>
      )}
    </div>
  );
}
