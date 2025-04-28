import MdxLayout from "@/app/mdx-layout";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import { getCourse, getLesson, getCourseLessons } from "@/app/utils/mdx";
import { courseColors } from "@/app/utils/course";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import CoursePagination from "@/app/components/CoursesContent/CoursePagination";
import Link from "next/link";
import Button from "@/app/components/Button/Button";

interface LessonPageProps {
  params: Promise<{
    courseName: string;
    lessonName: string;
  }>;
  children: React.ReactNode;
}

export default async function LessonPage({
  params,
  children,
}: LessonPageProps) {
  const resolvedParams = await params;
  const courseMetadata = await getCourse(resolvedParams.courseName);
  const { frontmatter: lessonMetadata } = await getLesson(
    resolvedParams.courseName,
    resolvedParams.lessonName
  );

  // Get all lessons for the course
  const allLessons = await getCourseLessons(resolvedParams.courseName);

  // Sort lessons by lessonNumber
  const sortedLessons = allLessons.sort(
    (a, b) => a.lessonNumber - b.lessonNumber
  );

  // Find current lesson index
  const currentLessonIndex = sortedLessons.findIndex(
    (lesson) => lesson.title === lessonMetadata.title
  );

  // Get next lesson slug (if exists)
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const nextLessonSlug = nextLesson ? nextLesson.slug : "";

  // Get previous lesson slug (if exists)
  const previousLesson = sortedLessons[currentLessonIndex - 1];
  const previousLessonSlug = previousLesson ? previousLesson.slug : "";

  // Check if this is the last lesson
  const isLastLesson = currentLessonIndex === sortedLessons.length - 1;

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[courseMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 md:px-8 lg:px-14 max-w-app w-full mx-auto flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <Icon name={courseMetadata.language} />
              <span
                className="font-medium text-xl font-mono relative top-0.25"
                style={{
                  color: `rgb(${courseColors[courseMetadata.language]})`,
                }}
              >
                {courseMetadata.language}
              </span>
            </div>
            <span className="sr-only">{courseMetadata.title}</span>
            <HeadingReveal
              text={courseMetadata.title}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />
          </div>
        </div>{" "}
      </div>

      <Divider />

      <div className="max-w-app flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-13 gap-y-24 lg:gap-y-0 gap-x-0 lg:gap-x-6">
          <CoursePagination
            courseName={courseMetadata.title}
            currentLesson={currentLessonIndex + 1}
            lessons={sortedLessons.map((lesson) => ({
              title: lesson.title,
              slug: lesson.slug,
            }))}
          />
          <div className="pb-8 pt-[36px] -mt-[36px] order-2 lg:order-1 col-span-1 md:col-span-7 flex flex-col gap-y-8 lg:border-border lg:border-x border-border lg:px-6">
            <MdxLayout>{children}</MdxLayout>
            {nextLesson && (
              <div className=" w-full flex items-center flex-col gap-y-10">
                <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
                  <span className="text-primary w-auto flex-shrink-0 font-mono">
                    Ready to take the challenge?
                  </span>
                  <Link
                    href={`/courses/${courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}/challenge`}
                    className="w-max"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      label="Take Challenge"
                      icon="Challenge"
                      className="disabled:opacity-40 w-full disabled:cursor-default"
                    ></Button>
                  </Link>
                </div>
                <div className="relative w-full -mt-6">
                  <div className="font-mono absolute text-xs text-mute top-1/2 z-10 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 bg-background">
                    OR SKIP TO NEXT LESSON
                  </div>
                  <div className="w-full h-[1px] bg-border absolute"></div>
                </div>
                <Link
                  href={`/courses/${courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}/${nextLessonSlug}`}
                  className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-mute text-sm font-mono pt-1">
                      Next Lesson
                    </span>
                    <span className="font-medium text-primary">
                      {nextLesson?.title}
                    </span>
                  </div>
                  <Icon
                    name="ArrowRight"
                    className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
                  />
                </Link>
              </div>
            )}
          </div>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
