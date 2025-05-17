"use client";

import { useState } from "react";
import { usePersistentStore } from "@/stores/store";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import { CourseMetadata } from "@/app/utils/course";
import ChallengeRequirements from "./ProgramChallengeRequirements";
import ChallengeTable from "./ProgramChallengeTable";
import { Link } from "@/i18n/navigation";
import { useCurrentLessonSlug } from "@/hooks/useCurrentLessonSlug";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import { AnimatePresence, motion } from "motion/react";
import { anticipate } from "motion";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function ChallengesContent({
  currentCourse,
}: {
  currentCourse: CourseMetadata;
}) {
  // Replace with real connection later
  const [isUserConnected] = useState(true);
  const { courseProgress } = usePersistentStore();
  const t = useTranslations();
  const isCourseCompleted =
    courseProgress[currentCourse.slug] === currentCourse.lessons.length;
  const lastLessonSlug = useCurrentLessonSlug(currentCourse);
  const challenge = currentCourse.challenge;

  if (!apiBaseUrl) {
    console.error("API Base URL is not defined in the environment variables.");
  }

  const verificationEndpoint = challenge?.apiPath
    ? `${apiBaseUrl}${challenge.apiPath}`
    : "";

  const {
    isLoading,
    error,
    uploadProgram,
    requirements,
    completedRequirementsCount,
    allIncomplete,
    verificationData,
  } = useChallengeVerifier({
    verificationEndpoint: verificationEndpoint,
    challenge: challenge!,
  });

  // Remove the handleUploadClick function as it's now inside the hook

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
          <AnimatePresence>
            {!isCourseCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
          {challenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.4, ease: anticipate },
              }}
              exit={{ opacity: 0 }}
              className="px-4 py-14 relative max-w-app md:px-8 lg:px-14 mx-auto w-full min-h-[calc(100dvh-250px)] grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-24"
            >
              <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-full border-l border-border bg-gradient-to-b from-background-card/50 to-transparent"></div>
              <ChallengeRequirements course={currentCourse} />

              <ChallengeTable
                isLoading={isLoading}
                error={error}
                onUploadClick={uploadProgram}
                requirements={requirements}
                completedRequirementsCount={completedRequirementsCount}
                allIncomplete={allIncomplete}
                verificationData={verificationData}
                courseSlug={currentCourse.slug}
              />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
