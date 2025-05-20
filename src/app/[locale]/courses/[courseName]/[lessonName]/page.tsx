import { getTranslations } from "next-intl/server";
import MdxLayout from "@/app/mdx-layout";
import { getCourse } from "@/app/utils/mdx";
import { courseColors } from "@/app/utils/course";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import CoursePagination from "@/app/components/CoursesContent/CoursePagination";
import { Link } from "@/i18n/navigation";
import Button from "@/app/components/Button/Button";
import LessonTitle from "@/app/components/LessonTitle/LessonTitle";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";
import { notFound } from "next/navigation";

interface LessonPageProps {
  params: Promise<{
    courseName: string;
    lessonName: string;
    locale: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const t = await getTranslations();
  const { courseName, lessonName, locale } = await params;

  let Lesson;
  try {
    const lessonModule = await import(
      `@/app/content/courses/${courseName}/${lessonName}/${locale}.mdx`
      );
    Lesson = lessonModule.default;
  } catch {
    notFound();
  }

  const courseMetadata = await getCourse(courseName);

  // Get all lessons for the course
  const allLessons = courseMetadata.lessons;

  // Find current lesson index
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.slug === lessonName
  );

  // const lessonMetadata = courseMetadata.lessons[currentLessonIndex];

  // Get next lesson slug (if exists)
  const nextLesson = allLessons[currentLessonIndex + 1];
  const nextLessonSlug = nextLesson ? nextLesson.slug : "";

  // Get previous lesson slug (if exists)
  // const previousLesson = allLessons[currentLessonIndex - 1];
  // const previousLessonSlug = previousLesson ? previousLesson.slug : "";

  // Check if this is the last lesson
  // const isLastLesson = currentLessonIndex === allLessons.length - 1;

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[courseMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 pb-20 md:px-8 lg:px-14 max-w-app w-full mx-auto flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2 relative w-max">
              <CrosshairCorners
                size={5}
                spacingTop={2}
                spacingBottom={2}
                spacingX={6}
                style={{
                  color: `rgb(${courseColors[courseMetadata.language]},1)`,
                }}
              />
              <div
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                style={{
                  backgroundColor: `rgb(${courseColors[courseMetadata.language]},0.10)`,
                }}
              >
                <Icon name={courseMetadata.language} size={16 as 14} />
              </div>
              <span
                className="font-medium text-lg font-mono relative top-0.25"
                style={{
                  color: `rgb(${courseColors[courseMetadata.language]})`,
                }}
              >
                {courseMetadata.language}
              </span>
            </div>
            <span className="sr-only">
              {t(`courses.${courseMetadata.slug}.title`)}
            </span>
            <LessonTitle title={t(`courses.${courseMetadata.slug}.title`)} />
          </div>
        </div>{" "}
      </div>

      <Divider />

      <div className="max-w-app flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-13 gap-y-24 lg:gap-y-0 gap-x-0 lg:gap-x-6">
          <CoursePagination
            courseSlug={courseMetadata.slug}
            currentLesson={currentLessonIndex + 1}
            lessons={allLessons.map((lesson) => ({
              title: t(`courses.${courseMetadata.slug}.lessons.${lesson.slug}`),
              slug: lesson.slug,
            }))}
          />
          <div className="pb-8 pt-[36px] -mt-[36px] order-2 lg:order-1 col-span-1 md:col-span-7 flex flex-col gap-y-8 lg:border-border lg:border-x border-border lg:px-6">
            <MdxLayout>
              <Lesson />
            </MdxLayout>

            <div className=" w-full flex items-center flex-col gap-y-10">
              <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
                <span className="text-primary w-auto flex-shrink-0 font-mono">
                  {t("lessons.take_challenge_cta")}
                </span>
                <Link
                  href={`/courses/${courseMetadata.slug}/challenge`}
                  className="w-max"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    label={t("lessons.take_challenge")}
                    icon="Challenge"
                    className="disabled:opacity-40 w-full disabled:cursor-default"
                  ></Button>
                </Link>
              </div>
              {nextLesson && (
                <>
                  <div className="relative w-full -mt-6">
                    <div className="font-mono absolute text-xs text-mute top-1/2 z-10 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 bg-background">
                      {t(`lessons.skip_lesson_divider_title`).toUpperCase()}
                    </div>
                    <div className="w-full h-[1px] bg-border absolute"></div>
                  </div>
                  <Link
                    href={`/courses/${courseMetadata.slug}/${nextLessonSlug}`}
                    className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
                  >
                    <div className="flex items-center gap-x-2">
                      <span className="text-mute text-sm font-mono pt-1">
                        Next Lesson
                      </span>
                      <span className="font-medium text-primary">
                        {t(
                          `courses.${courseMetadata.slug}.lessons.${nextLessonSlug}`
                        )}
                      </span>
                    </div>
                    <Icon
                      name="ArrowRight"
                      className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
