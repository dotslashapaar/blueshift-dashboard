"use client";

import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentStore } from "@/stores/store";
interface CoursePaginationProps {
  currentLesson: number;
  totalLessons: number;
  currentLessonName: string;
  nextLessonSlug: string;
  previousLessonSlug: string;
  className?: string;
  courseName: string;
}

export default function CoursePagination({
  currentLesson,
  totalLessons,
  currentLessonName,
  nextLessonSlug,
  previousLessonSlug,
  className,
  courseName,
}: CoursePaginationProps) {
  const { courseProgress, setCourseProgress } = usePersistentStore();

  const router = useRouter();
  const [isFixed, setIsFixed] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCourseProgress(courseName, currentLesson);
  }, [currentLesson]);

  return (
    <motion.div
      layoutId="course-pagination"
      className={classNames(
        "md:max-w-[350px] bg-background-card-foreground px-6 py-6 flex flex-col gap-y-4 rounded-xl border border-border",
        isFixed && "fixed left-1/2 -translate-x-1/2 bottom-8 z-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            router.push(
              `/courses/${courseName.toLowerCase()}/${previousLessonSlug}`
            );
          }}
          disabled={!previousLessonSlug}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
          )}
        >
          <Icon name="ArrowLeft" />
        </button>
        <span className="text-tertiary font-medium max-w-[60%] truncate">
          {currentLessonName}
        </span>
        <button
          onClick={() => {
            router.push(
              `/courses/${courseName.toLowerCase()}/${nextLessonSlug}`
            );
          }}
          disabled={!nextLessonSlug}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
          )}
        >
          <Icon name="ArrowRight" />
        </button>
      </div>
      <div
        className={classNames(
          "flex items-center w-full gap-x-2.5 min-w-[275px] px-1.5"
        )}
      >
        <div className="h-[8px] w-full flex items-center justify-start relative p-px bg-background-card rounded-full">
          <motion.div
            layoutId="course-pagination-progress"
            className="absolute [background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00FFFF] left-[1px] rounded-full"
            initial={{
              width: `${(currentLesson / totalLessons) * 100}%`,
              height: 6,
            }}
            animate={{
              width: `${(currentLesson / totalLessons) * 100}%`,
              height: 6,
            }}
            transition={{ duration: 0.4, ease: anticipate }}
          />
        </div>
        <span className="font-bold text-xs text-tertiary flex-shrink-0 font-geist-mono">
          {currentLesson}/{totalLessons}
        </span>
      </div>
    </motion.div>
  );
}
