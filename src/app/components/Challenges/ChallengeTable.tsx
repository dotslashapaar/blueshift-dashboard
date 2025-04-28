"use client";

import { anticipate } from "motion";
import Button from "../Button/Button";
import { motion } from "motion/react";
import classNames from "classnames";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import Divider from "../Divider/Divider";
import React from "react";
import { ChallengeRequirement } from "@/app/hooks/useChallengeFileUploadVerification";

interface ChallengeTableProps {
  onUploadClick: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
}

export default function ChallengeTable({
  onUploadClick,
  requirements,
  completedRequirementsCount,
  allIncomplete,
}: ChallengeTableProps) {
  return (
    <div className="flex flex-col gap-y-8 w-full px-1.5 pt-1.5 pb-12 border rounded-2xl border-border bg-background-card">
      <div className="gap-y-6 sm:gap-y-0 flex sm:flex-row flex-col items-center justify-between px-6 py-5 rounded-[10px] bg-background-card-foreground">
        <div className="flex flex-col gap-y-4 w-full sm:w-1/2">
          <span className="font-medium">
            {completedRequirementsCount}/{requirements.length} Tests Passed
          </span>
          <div
            className={classNames(
              "h-[8px] w-full flex items-center gap-x-0.5 justify-start relative p-px bg-background rounded-full",
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
                      requirement.status === "incomplete" && "bg-transparent",
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

      <div className="flex flex-col gap-y-4 px-6">
        {requirements.map((requirement) => (
          <React.Fragment key={requirement.instructionKey}>
            <div
              className="flex items-center justify-between"
              key={requirement.title} // Keep title key for inner div if needed, but Fragment needs a stable key
            >
              <span className="font-medium">{requirement.title}</span>
              <ChallengeBadge
                label={requirement.status}
                variant={requirement.status}
              />
            </div>
            <Divider className="last:hidden" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
