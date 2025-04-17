"use client";

import Link from "next/link";
import classNames from "classnames";
import { anticipate, motion } from "motion/react";
import DecryptedText from "../HeadingReveal/DecryptText";
import i18n from "@/i18n/client";
import { useState } from "react";
import { usePersistentStore } from "@/stores/store";
import Icon from "../Icon/Icon";
type ReturningLessonFooterProps = {
  courseName: string;
  completedLessonsCount: number;
  totalLessonCount: number;
  currentLessonSlug: string;
};

export default function ReturningCourseFooter({
  totalLessonCount,
  completedLessonsCount,
  courseName,
  currentLessonSlug,
}: ReturningLessonFooterProps) {
  const { t } = i18n;
  const [isHovering, setIsHovering] = useState(false);
  const { view } = usePersistentStore();

  return (
    <div
      className={classNames(
        "flex flex-col items-start gap-y-6",
        view === "grid" && "w-full"
      )}
    >
      <div
        className={classNames(
          "h-[8px] w-full flex items-center justify-start relative p-px bg-background rounded-full",
          view === "list" && "!hidden"
        )}
      >
        <motion.div
          className="absolute [background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00FFFF] left-[1px] rounded-full"
          initial={{
            width: `0%`,
            height: 6,
          }}
          animate={{
            width: `${(completedLessonsCount / totalLessonCount) * 100}%`,
            height: 6,
          }}
          transition={{ duration: 0.4, ease: anticipate, delay: 0.2 }}
        />
      </div>
      {completedLessonsCount !== totalLessonCount ? (
        <div
          className={classNames(
            "flex",
            view === "grid" && "w-full items-center justify-between",
            view === "list" && "flex-col gap-y-2 items-end"
          )}
        >
          <div className="font-medium flex-shrink-0">
            <span className="text-primary">
              {completedLessonsCount}/{totalLessonCount}{" "}
            </span>
            <span className="text-tertiary">{t("lessons.completed")}</span>
          </div>
          <Link
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            href={`/courses/${courseName}/${currentLessonSlug}`}
            className="text-brand-secondary hover:text-brand-primary transition font-medium"
          >
            <DecryptedText
              isHovering={isHovering}
              text={t("lessons.continue")}
            />
          </Link>
        </div>
      ) : (
        <div
          className={classNames(
            "flex",
            view === "grid" && "w-full items-center justify-between",
            view === "list" && "flex-col gap-y-2 items-end"
          )}
        >
          <div
            className={classNames(
              "font-medium flex-shrink-0",
              view === "grid" && " hidden xl:block"
            )}
          >
            <span className="text-mute">{t("lessons.all_completed")}</span>
          </div>
          <Link
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            href={`/courses/${courseName}/challenge`}
            className="text-brand-secondary hover:text-brand-primary transition font-medium flex items-center gap-x-2"
          >
            <Icon name="Challenge" className="text-brand-secondary" />
            <DecryptedText
              isHovering={isHovering}
              text={t("lessons.take_the_challenge")}
            />
          </Link>
        </div>
      )}
    </div>
  );
}
