import { getTranslations } from "next-intl/server";
import BackToCourseButton from "@/app/components/Challenges/BackToCourseButton";
import Divider from "@/app/components/Divider/Divider";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import Icon from "@/app/components/Icon/Icon";
import { courseColors } from "@/app/utils/course";
import { getCourse } from "@/app/utils/mdx";
import ProgramChallengesContent from "@/app/components/Challenges/ProgramChallengesContent";
import ClientChallengesContent from "@/app/components/Challenges/ClientChallengesContent";

interface ChallengePageProps {
  params: Promise<{
    courseName: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const resolvedParams = await params;
  const t = await getTranslations();
  const courseMetadata = await getCourse(resolvedParams.courseName);

  return (
    <div className="flex flex-col w-full">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[courseMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
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
            <span className="sr-only">{t(`courses.${courseMetadata.slug}.title`)}</span>
            <HeadingReveal
              text={t(`courses.${courseMetadata.slug}.title`)}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />
            <BackToCourseButton course={courseMetadata} />
          </div>
        </div>
      </div>
      <Divider />

      {courseMetadata.language === "Typescript" ? (
        <ClientChallengesContent currentCourse={courseMetadata} />
      ) : (
        <ProgramChallengesContent currentCourse={courseMetadata} />
      )}
    </div>
  );
}
