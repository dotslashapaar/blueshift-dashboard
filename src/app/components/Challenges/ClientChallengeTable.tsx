"use client";

import { useTranslations } from "next-intl";
import { anticipate } from "motion";
import Button from "../Button/Button";
import { motion } from "motion/react";
import classNames from "classnames";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import React, { useState, useEffect } from "react";
import {
  ChallengeRequirement,
  VerificationApiResponse,
} from "@/hooks/useChallengeVerifier";
import Icon from "../Icon/Icon";
import Divider from "../Divider/Divider";
import HeadingReveal from "../HeadingReveal/HeadingReveal";
import { usePersistentStore } from "@/stores/store";
import ChallengeCompleted from "../Modals/ChallengeComplete";
import { Link } from "@/i18n/navigation";
import { LogMessage } from "@/hooks/useEsbuildRunner";
import { CourseMetadata } from "@/app/utils/course";

interface ChallengeTableProps {
  onRunCodeClick: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
  isLoading: boolean;
  error: string | null;
  verificationData: VerificationApiResponse | null;
  course: CourseMetadata;
  isCodeRunning: boolean;
  runnerLogs: LogMessage[];
  isEsbuildReady: boolean;
  onRedoChallenge: () => void;
}

export default function ChallengeTable({
  requirements,
  isLoading,
  error,
  verificationData,
  course,
  isCodeRunning,
  runnerLogs,
  isEsbuildReady,
  onRedoChallenge,
}: ChallengeTableProps) {
  const t = useTranslations();
  const [selectedRequirement, setSelectedRequirement] =
    useState<ChallengeRequirement | null>(null);

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const { setCourseStatus, courseStatus } = usePersistentStore();
  const courseSlug = course.slug;

  useEffect(() => {
    if (verificationData) {
      const firstFailedRequirement = requirements.find(
        (req) => req.status === "failed"
      );
      if (firstFailedRequirement) {
        setSelectedRequirement(firstFailedRequirement);
      }

      const allRequirementsPassed = requirements.every(
        (req) => req.status === "passed"
      );
      if (allRequirementsPassed) {
        setTimeout(() => {
          if (courseStatus[courseSlug] === "Locked") {
            setCourseStatus(courseSlug, "Unlocked");
          }
          setIsCompletedModalOpen(true);
        }, 1000);
      }
    }
  }, [verificationData, requirements, setCourseStatus, courseSlug]);

  const overallIsLoading = isCodeRunning || !isEsbuildReady;
  

  return (
    <div className="w-full flex">
      <ChallengeCompleted
        isOpen={isCompletedModalOpen}
        onClose={() => setIsCompletedModalOpen(false)}
        course={course}
      />
      <div className="bg-background-card/50 rounded-b-xl lg:rounded-none w-full min-w-full lg:min-w-[400px] px-4 lg:px-6 lg:right-4 lg:border-l border-l-border lg:pt-6 flex flex-col lg:gap-y-8 justify-between overflow-hidden pb-6">
        {(courseStatus[courseSlug] === "Unlocked" ||
          courseStatus[courseSlug] === "Claimed") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 inset-0 w-full h-full bg-background/80 backdrop-blur gap-y-5 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center gap-y-1">
              <span className="text-lg font-medium text-primary">
                {t("ChallengePage.challenge_completed.title")}
              </span>
              <span className="text-tertiary">
                {t("ChallengePage.challenge_completed.body")}
              </span>
            </div>
            <Link href="/">
              <Button
                variant="primary"
                size="md"
                icon="Lessons"
                label={t(
                  "ChallengePage.challenge_completed.view_other_courses"
                )}
              />
            </Link>
            <div className="relative w-full">
              <div className="font-mono absolute text-xs text-mute top-1/2 z-10 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 bg-background">
                {t(`ChallengePage.challenge_completed.divider_label`).toUpperCase()}
              </div>
              <div className="w-full h-[1px] bg-border absolute"></div>
            </div>
            <Button
              variant="secondary"
              size="md"
              icon="Refresh"
              label={t("ChallengePage.challenge_completed.redo")}
              onClick={() => {
                onRedoChallenge();
                setIsCompletedModalOpen(false);
              }}
            />
          </motion.div>
        )}

        <div className="order-2 lg:order-1 flex flex-col gap-y-4 pt-8 lg:pt-0 lg:border-t-0">
          {runnerLogs.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-4 items-start overflow-hidden bg-background pt-4 px-1 pb-1 rounded-xl border border-border">
                <HeadingReveal
                  baseDelay={0.1}
                  text="EXECUTION LOGS"
                  headingLevel="h3"
                  className="font-mono px-3 text-sm"
                  color="#FFFFFF"
                />
                <div className="px-2 w-full">
                  <Divider />
                </div>
                <div className="max-w-full sm:max-w-[400px] overflow-x-scroll flex flex-col gap-y-1 items-start px-3 pr-5 pb-2 w-max max-h-80 custom-scrollbar font-geist-mono text-xs">
                  {runnerLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={classNames("text-start text-nowrap py-0.5", {
                        "text-[#ff5555] font-bold":
                          log.type === "ERROR" ||
                          log.type === "EXECUTION_ERROR" ||
                          log.type === "WORKER_ERROR" ||
                          log.type === "VERIFICATION_ERROR",
                        "text-[#f1fa8c]": log.type === "WARN",
                        "text-[#8be9fd]":
                          log.type === "INFO" || log.type === "SYSTEM",
                        "text-[#6272a4]": log.type === "DEBUG",
                        "text-[#f8f8f2]": log.type === "LOG",
                      })}
                    >
                      <span className="font-semibold mr-1.5 text-[#f8f8f2]">{`[${log.timestamp.toLocaleTimeString()}]`}</span>
                      <span
                        className={`font-bold ${
                          log.type === "SYSTEM"
                            ? "text-[#bd93f9]"
                            : log.type === "LOG"
                              ? "text-[#50fa7b]"
                              : ""
                        }`}
                      >{`[${log.type}]`}</span>
                      <span className="ml-1.5">
                        {Array.isArray(log.payload)
                          ? log.payload
                              .map((p) =>
                                typeof p === "object"
                                  ? JSON.stringify(p)
                                  : String(p)
                              )
                              .join(" ")
                          : String(log.payload)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-y-2">
            {requirements.map((requirement) => (
              <motion.button
                onClick={() => {
                  if (selectedRequirement === requirement) {
                    setSelectedRequirement(null);
                  } else {
                    setSelectedRequirement(requirement);
                  }
                }}
                disabled={requirement.status === "incomplete"}
                type="button"
                className={classNames(
                  "flex flex-col gap-y-4 group enabled:hover:cursor-pointer py-3 rounded-xl transition duration-200 enabled:hover:bg-background-card-foreground/50",
                  selectedRequirement === requirement &&
                    "pb-6 bg-background-card-foreground/50",
                  selectedRequirement !== null &&
                    selectedRequirement !== requirement &&
                    "opacity-40"
                )}
                key={requirement.instructionKey}
              >
                <div
                  className="flex items-center justify-between"
                  key={requirement.instructionKey}
                >
                  <span className="font-medium text-sm">
                    {t(
                      `courses.${courseSlug}.challenge.requirements.${requirement.instructionKey}.title`
                    )}
                  </span>
                  {!isLoading && !error ? (
                    <div className="flex items-center gap-x-4">
                      <ChallengeBadge
                        label={t(
                          `ChallengePage.test_results.${requirement.status}`
                        )}
                        variant={requirement.status}
                      />
                      <Icon
                        name="Chevron"
                        className={classNames(
                          "transition-transform",
                          requirement.status === "incomplete" && "opacity-40",
                          selectedRequirement === requirement && "rotate-180"
                        )}
                        size={14}
                      />
                    </div>
                  ) : (
                    <ChallengeBadge label="Loading" variant="loading" />
                  )}

                  {!isLoading && error && (
                    <div className="text-xs font-medium">
                      An error occured. Please try again.
                    </div>
                  )}
                </div>

                {selectedRequirement === requirement && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                    className="flex flex-col gap-y-4"
                  >
                    <Divider />
                    {verificationData?.results?.find(
                      (result) =>
                        result.instruction === requirement.instructionKey
                    ) && (
                      <div className="flex flex-col gap-y-2 text-sm">
                        <div className="flex flex-col gap-y-4 items-start overflow-hidden bg-background pt-4 px-1 pb-1 rounded-xl">
                          <HeadingReveal
                            baseDelay={0.1}
                            text="VERIFICATION LOGS"
                            headingLevel="h3"
                            className="font-mono px-3"
                            color="#FFA726"
                          />
                          <div className="px-2 w-full">
                            <Divider />
                          </div>
                          <div className="flex gap-x-2 items-center w-full">
                            <div className="flex flex-col gap-y-2 pt-1 pb-2">
                              {verificationData.results.find(
                                (result) =>
                                  result.instruction ===
                                  requirement.instructionKey
                              )?.message && (
                                <HeadingReveal
                                  baseDelay={0}
                                  text="ERROR"
                                  headingLevel="h3"
                                  splitBy="chars"
                                  speed={0.1}
                                  color="#FF5555"
                                  className="font-mono px-3 flex-shrink-0 w-max sticky left-0"
                                />
                              )}
                              {verificationData.results
                                .find(
                                  (result) =>
                                    result.instruction ===
                                    requirement.instructionKey
                                )
                                ?.program_logs?.map((log, index) => (
                                  <HeadingReveal
                                    baseDelay={index * 0.1}
                                    text="PROGRAM"
                                    headingLevel="h3"
                                    key={log}
                                    splitBy="chars"
                                    speed={0.1}
                                    className="font-mono px-3 flex-shrink-0 w-max sticky left-0"
                                  />
                                ))}
                            </div>
                            <div className="flex flex-col gap-y-2 items-start px-1 overflow-x-auto pr-5 pb-2">
                              {verificationData.results.find(
                                (result) =>
                                  result.instruction ===
                                  requirement.instructionKey
                              )?.message && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: anticipate,
                                    delay: 0.8,
                                  }}
                                  className="text-start w-full font-geist-mono font-medium text-nowrap text-[#FF5555]"
                                >
                                  {
                                    verificationData.results.find(
                                      (result) =>
                                        result.instruction ===
                                        requirement.instructionKey
                                    )?.message
                                  }
                                </motion.span>
                              )}
                              {verificationData.results
                                .find(
                                  (result) =>
                                    result.instruction ===
                                    requirement.instructionKey
                                )
                                ?.program_logs?.map((log, index) => (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: anticipate,
                                      delay: 1 + index * 0.1,
                                    }}
                                    key={index}
                                    className="text-start font-geist-mono font-medium text-nowrap text-secondary"
                                  >
                                    {log.slice(7, log.length)}
                                  </motion.span>
                                ))}
                            </div>
                          </div>

                          <div className="bg-background-card/80 rounded-lg px-4 py-2 flex gap-x-4 text-sm font-medium w-full justify-between items-center">
                            <Icon
                              name="ShiftArrow"
                              size={14}
                              className="text-brand-primary"
                            />
                            <div className="flex items-center gap-x-2">
                              <div>
                                <span className="text-text-tertiary">
                                  Compute Units:{" "}
                                </span>
                                <span className="font-medium text-brand-secondary">
                                  {
                                    verificationData.results.find(
                                      (result) =>
                                        result.instruction ===
                                        requirement.instructionKey
                                    )?.compute_units_consumed
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-text-tertiary">
                                  Execution Time:{" "}
                                </span>
                                <span className="font-medium text-brand-secondary">
                                  {
                                    verificationData.results.find(
                                      (result) =>
                                        result.instruction ===
                                        requirement.instructionKey
                                    )?.execution_time
                                  }
                                  ms
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
