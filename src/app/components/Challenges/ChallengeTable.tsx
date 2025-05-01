"use client";

import { anticipate } from "motion";
import Button from "../Button/Button";
import { motion } from "motion/react";
import classNames from "classnames";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import React, { useState, useEffect } from "react";
import {
  ChallengeRequirement,
  VerificationApiResponse,
} from "@/app/hooks/useChallengeFileUploadVerification";
import Icon from "../Icon/Icon";
import Divider from "../Divider/Divider";
import HeadingReveal from "../HeadingReveal/HeadingReveal";
import { usePersistentStore } from "@/stores/store";
import ChallengeCompleted from "../Modals/ChallengeComplete";
import Link from "next/link";

interface ChallengeTableProps {
  onUploadClick: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
  isLoading: boolean;
  error: string | null;
  verificationData: VerificationApiResponse | null;
  courseSlug: string;
}

export default function ChallengeTable({
  onUploadClick,
  requirements,
  completedRequirementsCount,
  allIncomplete,
  isLoading,
  error,
  verificationData,
  courseSlug,
}: ChallengeTableProps) {
  const [selectedRequirement, setSelectedRequirement] =
    useState<ChallengeRequirement | null>(null);

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const { setCourseStatus, courseStatus } = usePersistentStore();

  useEffect(() => {
    if (verificationData) {
      const firstFailedRequirement = requirements.find(
        (req) => req.status === "failed"
      );
      if (firstFailedRequirement) {
        setSelectedRequirement(firstFailedRequirement);
      }

      // Check if all requirements are successful
      const allRequirementsPassed = requirements.every(
        (req) => req.status === "passed"
      );
      if (allRequirementsPassed) {
        setTimeout(() => {
          setCourseStatus(courseSlug, "Unlocked");
          setIsCompletedModalOpen(true);
        }, 1000);
      }
    }
  }, [verificationData, requirements, setCourseStatus, courseSlug]);

  return (
    <div>
      <ChallengeCompleted
        isOpen={isCompletedModalOpen}
        onClose={() => setIsCompletedModalOpen(false)}
      />
      <div className="relative flex flex-col gap-y-4 w-full overflow-hidden px-1.5 pt-1.5 pb-12 border rounded-2xl border-border bg-background-card">
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
                Challenge Complete
              </span>
              <span className="text-tertiary">
                You have already completed this challenge.
              </span>
            </div>
            <Link href="/">
              <Button
                variant="primary"
                size="md"
                icon="Lessons"
                label="View Other Courses"
              />
            </Link>
          </motion.div>
        )}
        <div
          className={classNames(
            "gap-y-6 sm:gap-y-0 flex sm:flex-row flex-col items-center justify-between px-6 py-5 rounded-[10px] bg-background-card-foreground"
          )}
        >
          <div className="flex flex-col gap-y-4 w-full sm:w-1/2">
            <span className="font-medium">
              {completedRequirementsCount}/{requirements.length} Tests Passed
            </span>
            <div
              className={classNames(
                "h-[8px] w-full flex items-center gap-x-0.5 justify-start relative p-px bg-background rounded-full"
              )}
            >
              {!allIncomplete ? (
                <>
                  {requirements.map((requirement, index) => (
                    <motion.div
                      key={requirement.instructionKey}
                      className={classNames(
                        "first:rounded-l-full last:rounded-r-full left-[1px]",
                        requirement.status === "passed" &&
                          "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00E66B]",
                        requirement.status === "failed" &&
                          "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#FF285A]",
                        // Make incomplete segments transparent to show the parent background
                        requirement.status === "incomplete" && "bg-transparent"
                      )}
                      initial={{
                        width: `0%`,
                        height: 6,
                      }}
                      animate={{
                        // Use derived requirements length for width calculation
                        width: `${100 / requirements.length}%`,
                        height: 6,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: anticipate,
                        delay: 0.2 * index,
                      }}
                    />
                  ))}
                </>
              ) : (
                // Initial state when all are incomplete
                <div className="w-4 h-1.5 [background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#ADB9D2] rounded-l-full" />
              )}
            </div>
          </div>

          <Button
            variant="primary"
            icon="Upload"
            size="lg"
            label="Upload Program"
            className="w-full sm:w-auto"
            onClick={onUploadClick}
          />
        </div>

        <div className="flex flex-col gap-y-2 px-2">
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
                "flex flex-col gap-y-4 group px-4 enabled:hover:cursor-pointer py-3 rounded-xl transition duration-200 enabled:hover:bg-background-card-foreground/50",
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
                key={requirement.title}
              >
                <span className="font-medium">{requirement.title}</span>
                {!isLoading && !error ? (
                  <div className="flex items-center gap-x-4">
                    <ChallengeBadge
                      label={requirement.status}
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
                // Show logs
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
                          text="PROGRAM LOGS"
                          headingLevel="h3"
                          className="font-mono px-3"
                          color="#00ffff"
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
  );
}
