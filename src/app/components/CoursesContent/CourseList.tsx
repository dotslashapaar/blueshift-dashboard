"use client";

import {
  courseColors,
  CourseMetadata,
  courseDifficulty,
  difficultyColors,
} from "@/app/utils/course";
import { usePersistentStore } from "@/stores/store";
import CourseCard from "../CourseCard/CourseCard";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import Divider from "../Divider/Divider";
import CoursesEmpty from "./CoursesEmpty";
import NewCourseFooter from "./NewCourseFooter";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { useStore } from "@/stores/store";
import Button from "../Button/Button";
import ReturningCourseFooter from "./ReturningCourseFooter";
import { useWindowSize } from "usehooks-ts";
import { useEffect } from "react";
import { DifficultyIcon } from "../Icon/icons/Difficulty";

type CoursesContentProps = {
  searchValue?: string;
  initialCourses: CourseMetadata[];
  courseLessons: {
    slug: string;
    totalLessons: number;
    lessons: { number: number; slug: string }[];
  }[];
};

export default function CourseList({
  initialCourses,
  courseLessons,
}: CoursesContentProps) {
  const t = useTranslations();
  const {
    view,
    setView,
    selectedLanguages,
    courseProgress,
    challengeStatuses,
  } = usePersistentStore();
  const { searchValue } = useStore();

  // Filter courses based on search value and selected languages
  // Sort by difficulty (lower number means easier), then by language alphabetically
  const filteredCourses = initialCourses
    .filter((course) => {
      const searchTerm = (searchValue || "").toLowerCase();
      const matchesTitle = t(`courses.${course.slug}.title`)
        .toLowerCase()
        .includes(searchTerm);
      const matchesDifficulty = t(`course_levels.${course.difficulty}`)
        .toLowerCase()
        .includes(searchTerm);
      const matchesSearch = matchesTitle || matchesDifficulty;
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.includes(course.language);
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.language.localeCompare(b.language);
    });

  // In-progress courses are those where the user has started but not completed
  // or has completed but have an associated challenge that is not yet completed.
  const inProgressCourses = filteredCourses.filter(
    (course) =>
      (courseProgress[course.slug] > 0 &&
        courseProgress[course.slug] < course.lessons.length) ||
      (courseProgress[course.slug] === course.lessons.length &&
        !!course.challenge)
  );

  // Completed courses are those where the user has finished all lessons
  // and either has no challenge or the challenge is completed/claimed.
  const completedCourses = filteredCourses.filter((course) => {
    const hasFinishedLessons =
      courseProgress[course.slug] === course.lessons.length;

    return course.challenge
      ? hasFinishedLessons &&
          ["completed", "claimed"].includes(challengeStatuses[course.challenge])
      : hasFinishedLessons;
  });

  const hasNoResults = filteredCourses.length === 0;
  const hasNoFilters = !searchValue && selectedLanguages.length === 0;

  // Helper function to get the current lesson slug
  const getCurrentLessonSlug = (courseSlug: string) => {
    const progress = courseProgress[courseSlug];
    if (!progress) return "";

    // Find the course lessons
    const courseLessonData = courseLessons.find((c) => c.slug === courseSlug);
    if (!courseLessonData) return "";

    // If progress is 0, return empty string (no current lesson)
    if (progress === 0) return "";

    // Find the lesson with matching number
    const currentLesson = courseLessonData.lessons.find(
      (lesson) => lesson.number === progress
    );

    return currentLesson?.slug || "";
  };

  const { width } = useWindowSize();

  useEffect(() => {
    if (width < 768) {
      setView("grid");
    }
  }, [setView, width]);

  return (
    <motion.div
      key={`${view}`}
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
    >
      {hasNoFilters ? (
        <CoursesEmpty type="no_filters" />
      ) : hasNoResults ? (
        <CoursesEmpty type="no_results" />
      ) : (
        <div className="flex flex-col gap-y-8">
          {/* In-progress courses */}
          {inProgressCourses.length > 0 && (
            <>
              <div className="flex items-center gap-x-3">
                <span className="text-lg leading-none font-medium text-secondary">
                  {t("lessons.continue_learning")}
                </span>
              </div>
              <div
                className={classNames(
                  "grid",
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1",
                  "gap-5"
                )}
              >
                {inProgressCourses.map((course) => {
                  const totalLessons =
                    courseLessons.find((c) => c.slug === course.slug)
                      ?.totalLessons || 0;
                  const currentLessonSlug = getCurrentLessonSlug(course.slug);
                  let link = "#";
                  if (currentLessonSlug && course.slug) {
                    link = `/courses/${course.slug}/${currentLessonSlug}`;
                  } else if (course.slug && !currentLessonSlug) {
                    link = `/courses/${course.slug}`;
                  }
                  return (
                    <CourseCard
                      key={course.slug}
                      name={t(`courses.${course.slug}.title`)}
                      language={course.language}
                      color={
                        courseColors[
                          course.language as keyof typeof courseColors
                        ]
                      }
                      difficulty={course.difficulty}
                      link={link}
                      footer={
                        <ReturningCourseFooter
                          courseName={course.slug}
                          completedLessonsCount={courseProgress[course.slug]}
                          totalLessonCount={totalLessons}
                          currentLessonSlug={currentLessonSlug}
                          isChallengeCompleted={
                            !!course.challenge &&
                            ["completed", "claimed"].includes(
                              challengeStatuses[course.challenge]
                            )
                          }
                          challengeSlug={course.challenge}
                        />
                      }
                    />
                  );
                })}
              </div>
              <div className="pt-4 pb-12 relative w-full">
                <Divider />
              </div>
            </>
          )}

          {/* Difficulty Sections */}
          {Object.entries(courseDifficulty).map(
            ([difficultyLevel, difficultyName]) => {
              const difficulty = parseInt(
                difficultyLevel
              ) as keyof typeof courseDifficulty;
              const difficultyCourses = filteredCourses.filter(
                (course) => course.difficulty === difficulty
              );

              if (difficultyCourses.length === 0) return null;

              return (
                <div key={difficulty} className="flex flex-col">
                  <div className="flex flex-col gap-y-8">
                    <div className="flex items-center gap-x-3">
                      <DifficultyIcon size={20 as 16} difficulty={difficulty} />
                      <span
                        className="leading-none font-mono"
                        style={{ color: difficultyColors[difficulty] }}
                      >
                        {t(`course_levels.${difficulty}`)}
                      </span>
                    </div>
                    <div
                      className={classNames(
                        "grid",
                        view === "grid"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          : "grid-cols-1",
                        "gap-5"
                      )}
                    >
                      {difficultyCourses.map((course) => {
                        const totalLessons =
                          courseLessons.find((c) => c.slug === course.slug)
                            ?.totalLessons || 0;
                        const currentLessonSlug = getCurrentLessonSlug(
                          course.slug
                        );
                        const isInProgress = inProgressCourses.some(
                          (c) => c.slug === course.slug
                        );

                        let link = "#";
                        if (currentLessonSlug && course.slug) {
                          link = `/courses/${course.slug}/${currentLessonSlug}`;
                        } else if (course.slug && !currentLessonSlug) {
                          link = `/courses/${course.slug}`;
                        }

                        return (
                          <CourseCard
                            key={course.slug}
                            name={t(`courses.${course.slug}.title`)}
                            language={course.language}
                            color={
                              courseColors[
                                course.language as keyof typeof courseColors
                              ]
                            }
                            difficulty={course.difficulty}
                            link={link}
                            footer={
                              isInProgress ? (
                                <ReturningCourseFooter
                                  courseName={course.slug}
                                  completedLessonsCount={
                                    courseProgress[course.slug]
                                  }
                                  totalLessonCount={totalLessons}
                                  currentLessonSlug={currentLessonSlug}
                                  isChallengeCompleted={
                                    !!course.challenge &&
                                    ["completed", "claimed"].includes(
                                      challengeStatuses[course.challenge]
                                    )
                                  }
                                  challengeSlug={course.challenge}
                                />
                              ) : (
                                <NewCourseFooter
                                  courseSlug={course.slug}
                                  lessonCount={totalLessons}
                                />
                              )
                            }
                          />
                        );
                      })}
                    </div>
                    <div className="pt-4 pb-12 relative w-full">
                      {difficultyCourses.length > 4 && (
                        <Button
                          variant="tertiary"
                          className="left-1/2 transform -translate-x-1/2 !absolute top-1/2 -translate-y-1/2 z-1"
                          icon="Chevron"
                          iconSide="right"
                          label="Load More"
                          iconSize={14}
                        ></Button>
                      )}
                      <Divider />
                    </div>
                  </div>
                </div>
              );
            }
          )}

          {/* Completed Courses */}
          {completedCourses.length > 0 && (
            <>
              <div className="flex items-center gap-x-3">
                <Icon name="SuccessCircle" className="text-brand-secondary" />
                <span className="text-lg leading-none font-medium text-secondary">
                  {t("lessons.completed_courses")}
                </span>
              </div>
              <div
                className={classNames(
                  "grid",
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1",
                  "gap-5"
                )}
              >
                {completedCourses.map((course) => {
                  const currentLessonSlug = getCurrentLessonSlug(course.slug);
                  let link;
                  if (currentLessonSlug && course.slug) {
                    link = `/courses/${course.slug}/${currentLessonSlug}`;
                  } else if (course.slug && !currentLessonSlug) {
                    link = `/courses/${course.slug}`;
                  }
                  return (
                    <CourseCard
                      key={course.slug}
                      name={t(`courses.${course.slug}.title`)}
                      language={course.language}
                      color={
                        courseColors[
                          course.language as keyof typeof courseColors
                        ]
                      }
                      difficulty={course.difficulty}
                      link={link}
                      footer={
                        <ReturningCourseFooter
                          courseName={course.slug}
                          completedLessonsCount={courseProgress[course.slug]}
                          totalLessonCount={course.lessons.length}
                          currentLessonSlug={currentLessonSlug}
                          isChallengeCompleted={true}
                          challengeSlug={course.challenge}
                        />
                      }
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
