import { CourseDifficulty } from "@/app/utils/course";
import { CourseLanguages, RewardsStatus } from "@/app/utils/course";
import React from "react";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import DifficultyBadge from "../DifficultyBadge/DifficultyBadge";
import { motion } from "motion/react";
import Icon from "../Icon/Icon";
import HeadingReveal from "../HeadingReveal/HeadingReveal";

type CourseCardProps = {
  name: string;
  color: string;
  points?: number;
  status?: RewardsStatus;
  language: CourseLanguages;
  difficulty?: CourseDifficulty;
  footer?: React.ReactNode;
  className?: string;
};

export default function CourseCard({
  name,
  color,
  language,
  difficulty,
  footer,
  className,
}: CourseCardProps) {
  const { view } = usePersistentStore();
  return (
    <motion.div
      style={{ "--courseColor": color } as React.CSSProperties}
      className={classNames(
        "gradient-border rounded-2xl pb-8 px-5 relative [background:linear-gradient(180deg,rgb(var(--courseColor),0.03),transparent_75%),linear-gradient(180deg,var(--color-background-card),var(--color-background-card))] before:[background:linear-gradient(180deg,rgba(var(--courseColor),0.1),rgba(var(--courseColor),0.05))]",
        view === "grid" && "pt-5",
        view === "list" && "pt-5 !pb-5",
        className
      )}
    >
      {view === "grid" && difficulty && (
        <div className="absolute top-6 right-5">
          <DifficultyBadge difficulty={difficulty} />
        </div>
      )}
      <div
        className={classNames(
          "flex",
          view === "grid" && "flex-col gap-y-24",
          view === "list" && "flex-row justify-between"
        )}
      >
        <div
          className={classNames(
            "flex",
            view === "grid" && "flex-col gap-y-6 items-start",
            view === "list" && "flex items-center gap-x-4"
          )}
        >
          <img
            src={`/graphics/${language.toLowerCase()}-course.svg`}
            className="h-16 -ml-1.5 [filter:drop-shadow(0_6px_4px_rgba(0,0,0,0.25))]"
          />
          <div className="flex flex-col gap-y-2.5">
            <div className="flex items-center gap-x-3">
              <HeadingReveal
                headingLevel="h3"
                text={language}
                className="font-mono font-medium leading-none tracking-normal"
                color={`rgb(${color})`}
                cursorColor={`rgb(${color})`}
                splitBy="chars"
                baseDelay={0.2}
              />
              {view === "list" && difficulty && (
                <DifficultyBadge
                  difficulty={difficulty}
                  className="relative bottom-[2px]"
                />
              )}
            </div>
            <div className="text-xl font-medium text-primary leading-none">
              {name}
            </div>
          </div>
        </div>
        {footer && footer}
      </div>
    </motion.div>
  );
}
