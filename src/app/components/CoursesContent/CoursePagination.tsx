"use client";

import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentStore } from "@/stores/store";
import Link from "next/link";
import Icon from "../Icon/Icon";
interface CoursePaginationProps {
  lessons: {
    title: string;
    slug: string;
  }[];
  currentLesson: number;
  className?: string;
  courseSlug: string;
}

export default function CoursePagination({
  currentLesson,
  lessons,
  className,
  courseSlug,
}: CoursePaginationProps) {
  const { setCourseProgress } = usePersistentStore();

  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isFixed, setIsFixed] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCourseProgress(courseSlug, currentLesson);
  }, [courseSlug, currentLesson, setCourseProgress]);

  return (
    <motion.div
      layoutId="course-pagination"
      className={classNames(
        "gradient-border !fixed xl:!sticky z-50 py-5 xl:pb-8 px-4 col-span-3 h-max left-1/2 xl:left-auto -translate-x-1/2 xl:translate-x-0 bottom-8 xl:bottom-auto xl:top-24 bg-background-card-foreground xl:[background:linear-gradient(180deg,rgba(0,179,179,0.08),rgba(0,179,179,0.02)),#11141A] flex flex-col gap-y-4 rounded-xl  xl:before:[background:linear-gradient(180deg,rgba(0,179,179,0.12),transparent)]",
        className
      )}
    >
      <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px]">
        <button
          onClick={() => {
            router.push(
              `/courses/${courseSlug}/${lessons[currentLesson - 2].slug}`
            );
          }}
          disabled={currentLesson === 1}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
          )}
        >
          <Icon name="ArrowLeft" />
        </button>
        <span className="font-semibold">
          {lessons[currentLesson - 1].title}
        </span>
        <button
          onClick={() => {
            router.push(
              `/courses/${courseSlug}/${lessons[currentLesson].slug}`
            );
          }}
          disabled={currentLesson === lessons.length}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
          )}
        >
          <Icon name="ArrowRight" />
        </button>
      </div>
      <div className="flex-col hidden xl:flex gap-y-4 pl-0">
        <span className="font-mono text-sm pl-1 text-secondary">Lessons</span>
        <div className="flex flex-col gap-y-3 pl-0">
          {lessons.map((lesson, index) => (
            <Link
              href={`/courses/${courseSlug}/${lesson.slug}`}
              key={lesson.slug}
              className="flex items-center gap-x-4 group"
            >
              <div
                className={classNames(
                  "w-[18px] group-last:before:!hidden before:w-[2px] before:bg-mute before:h-[18px] before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[calc(100%+2px)] h-[18px] relative flex items-center justify-center rounded-full border-2 border-mute",
                  index === currentLesson - 1 && "!border-brand-secondary"
                )}
              >
                {index === currentLesson - 1 && (
                  <motion.div
                    layoutId="lesson-pagination"
                    transition={{ duration: 0.1, ease: anticipate }}
                    className={classNames(
                      "w-[8px] h-[8px] rounded-full bg-brand-secondary"
                    )}
                  ></motion.div>
                )}
              </div>
              <span
                className={classNames(
                  "text-tertiary/70 hover:text-secondary font-medium truncate transition",
                  index === currentLesson - 1 && "!text-primary"
                )}
              >
                {lesson.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
