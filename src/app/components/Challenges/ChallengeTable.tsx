"use client";

import { anticipate } from "motion";
import Button from "../Button/Button";
import { motion } from "motion/react";
import classNames from "classnames";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import Divider from "../Divider/Divider";
import React from "react";

export default function ChallengeTable() {
  interface ChallengeRequirement {
    title: string;
    status: "passed" | "failed" | "incomplete";
  }
  const requirementsExample: ChallengeRequirement[] = [
    {
      title: "Test 1 Requirement",
      status: "passed",
    },
    {
      title: "Test 2 Requirement",
      status: "failed",
    },
    {
      title: "Test 3 Requirement",
      status: "incomplete",
    },
  ];

  const completedRequirementsCount = requirementsExample.filter(
    (requirement) => requirement.status === "passed"
  ).length;

  const allIncomplete = requirementsExample.every(
    (requirement) => requirement.status === "incomplete"
  );

  return (
    <div className="flex flex-col gap-y-8 w-full px-1.5 pt-1.5 pb-12 border rounded-2xl border-border bg-background-card">
      <div className="gap-y-6 sm:gap-y-0 flex sm:flex-row flex-col items-center justify-between px-6 py-5 rounded-[10px] bg-background-card-foreground">
        <div className="flex flex-col gap-y-4 w-full sm:w-1/2">
          <span className="font-medium">
            {completedRequirementsCount}/{requirementsExample.length} Tests
            Passed
          </span>
          <div
            className={classNames(
              "h-[8px] w-full flex items-center gap-x-0.5 justify-start relative p-px bg-background rounded-full"
            )}
          >
            {!allIncomplete ? (
              <>
                {requirementsExample.map((requirement, index) => (
                  <motion.div
                    key={requirement.title}
                    className={classNames(
                      "first:rounded-l-full last:rounded-r-full left-[1px]",
                      requirement.status === "passed" &&
                        "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00E66B]",
                      requirement.status === "failed" &&
                        "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#FF285A]",
                      requirement.status === "incomplete" && "bg-background"
                    )}
                    initial={{
                      width: `0%`,
                      height: 6,
                    }}
                    animate={{
                      width: `${100 / requirementsExample.length}%`,
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
        />
      </div>

      <div className="flex flex-col gap-y-4 px-6">
        {requirementsExample.map((requirement) => (
          <React.Fragment key={requirement.title}>
            <div
              className="flex items-center justify-between"
              key={requirement.title}
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
