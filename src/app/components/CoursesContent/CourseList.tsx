"use client";

import { courseColors, CourseMetadata } from "@/app/utils/course";
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

const courseSections = {
  Anchor: {
    icon: "Anchor",
    title: "languages.anchor",
  },
  Rust: {
    icon: "Rust",
    title: "languages.rust",
  },
  Typescript: {
    icon: "Typescript",
    title: "languages.typescript",
  },
  Assembly: {
    icon: "Assembly",
    title: "languages.assembly",
  },
  Research: {
    icon: "Research",
    title: "languages.research",
  },
} as const;

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
  const isProgressEmpty = Object.keys(courseProgress).length === 0;

  // Filter courses based on search value and selected languages
  // Sort by difficulty (lower number means easier)
  const filteredCourses = initialCourses
    .filter((course) => {
      const matchesSearch = t(`courses.${course.slug}.title`)
        .toLowerCase()
        .includes((searchValue || "").toLowerCase());
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.includes(course.language);
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => a.difficulty - b.difficulty);

  // In-progress courses are those where the user has started but not completed
  // or has completed but has an associated challenge that is not yet completed.
  const inProgressCourses = filteredCourses.filter(
    (course) =>
      (courseProgress[course.slug] > 0 &&
        courseProgress[course.slug] < course.lessons.length) ||
      (courseProgress[course.slug] === course.lessons.length &&
        !!course.challenge),
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
  const showGetStarted =
    hasNoFilters ||
    selectedLanguages.length === Object.keys(courseSections).length;

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
      (lesson) => lesson.number === progress,
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
        <>
          {/* Featured Courses For New Users */}
          {isProgressEmpty && showGetStarted ? (
            <div className="flex flex-col gap-y-8">
              <div className="flex items-center gap-x-3">
                <Icon name="Flag" className="text-brand-secondary" />
                <span className="text-lg leading-none font-medium text-secondary">
                  {t("lessons.get_started")}
                </span>
              </div>
              <div
                className={classNames(
                  "grid",
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1",
                  "gap-5",
                )}
              >
                {filteredCourses
                  .filter((course) => course.isFeatured)
                  .map((course) => {
                    const totalLessons =
                      courseLessons.find((c) => c.slug === course.slug)
                        ?.totalLessons || 0;
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
                        color={course.color}
                        difficulty={course.difficulty}
                        link={link}
                        footer={
                          <NewCourseFooter
                            courseSlug={course.slug}
                            lessonCount={totalLessons}
                          />
                        }
                      />
                    );
                  })}
              </div>
              <div className="pt-4 pb-12 relative w-full">
                <Divider />
              </div>
            </div>
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
                      "gap-5",
                    )}
                  >
                    {inProgressCourses.map((course) => {
                      const totalLessons =
                        courseLessons.find((c) => c.slug === course.slug)
                          ?.totalLessons || 0;
                      const currentLessonSlug = getCurrentLessonSlug(
                        course.slug,
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
                          color={course.color}
                          difficulty={course.difficulty}
                          link={link}
                          footer={
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
                                  challengeStatuses[course.challenge],
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

              {/* Open Courses Sections */}
              {Object.entries(courseSections).map(([language, section]) => {
                const languageCourses = filteredCourses.filter(
                  (course) =>
                    course.language === language &&
                    courseProgress[course.slug] === undefined,
                );

                if (languageCourses.length === 0) return null;

                return (
                  <div key={language} className="flex flex-col">
                    <div className="flex flex-col gap-y-8 ">
                      <div className="flex items-center gap-x-3">
                        <div
                          className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                          style={{
                            backgroundColor: `rgb(${courseColors[section.icon]},0.10)`,
                          }}
                        >
                          <Icon name={section.icon} size={16 as 14} />
                        </div>
                        <span className="text-lg leading-none font-medium text-secondary">
                          {t(section.title)}
                        </span>
                      </div>
                      <div
                        className={classNames(
                          "grid",
                          view === "grid"
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1",
                          "gap-5",
                        )}
                      >
                        {languageCourses.map((course) => {
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
                              color={course.color}
                              difficulty={course.difficulty}
                              link={link}
                              footer={
                                <NewCourseFooter
                                  courseSlug={course.slug}
                                  lessonCount={course.lessons.length}
                                />
                              }
                            />
                          );
                        })}
                      </div>
                      <div className="pt-4 pb-12 relative w-full">
                        {languageCourses.length > 4 && (
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
              })}

              {/* Completed Courses */}
              {completedCourses.length > 0 && (
                <>
                  <div className="flex items-center gap-x-3">
                    <Icon
                      name="SuccessCircle"
                      className="text-brand-secondary"
                    />
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
                      "gap-5",
                    )}
                  >
                    {completedCourses.map((course) => {
                      const currentLessonSlug = getCurrentLessonSlug(
                        course.slug,
                      );
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
                          color={course.color}
                          difficulty={course.difficulty}
                          link={link}
                          footer={
                            <ReturningCourseFooter
                              courseName={course.slug}
                              completedLessonsCount={
                                courseProgress[course.slug]
                              }
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
        </>
      )}
    </motion.div>
  );
}
