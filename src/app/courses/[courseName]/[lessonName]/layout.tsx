import MdxLayout from "@/app/mdx-layout";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import { getCourse, getLesson, getCourseLessons } from "@/app/utils/mdx";
import { courseColors } from "@/app/utils/course";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import CourseChallengeButton from "@/app/components/CoursesContent/CourseChallengeButton";
import CoursePagination from "@/app/components/CoursesContent/CoursePagination";
import Link from "next/link";

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
    <div className="flex flex-col w-full">
      <div
        className="px-4 py-14 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[courseMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <Icon name={courseMetadata.language} />
            <span
              className="font-medium text-xl font-mono relative top-0.25"
              style={{ color: `rgb(${courseColors[courseMetadata.language]})` }}
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
        <CoursePagination
          currentLesson={currentLessonIndex + 1}
          totalLessons={sortedLessons.length}
          currentLessonName={lessonMetadata.title}
          previousLessonSlug={previousLessonSlug}
          nextLessonSlug={nextLessonSlug}
          courseName={courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}
        />
      </div>

      <Divider />

      <div className="flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[64px] max-w-[1100px]">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-y-24 lg:gap-y-0 lg:gap-x-12 gap-x-0">
          <TableOfContents />
          <div className="col-span-1 md:col-span-7 flex flex-col gap-y-8">
            <MdxLayout>{children}</MdxLayout>
            {nextLesson && (
              <Link
                href={`/courses/${courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}/${nextLessonSlug}`}
                className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
              >
                <div className="flex items-center gap-x-2">
                  <span className="text-mute text-sm">Next Lesson</span>
                  <span className="font-medium text-primary">
                    {nextLesson?.title}
                  </span>
                </div>
                <Icon
                  name="ArrowRight"
                  className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
                />
              </Link>
            )}
          </div>
        </div>
        <CourseChallengeButton
          isCourseReady={isLastLesson}
          courseName={courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}
        />
      </div>
    </div>
  );
}
