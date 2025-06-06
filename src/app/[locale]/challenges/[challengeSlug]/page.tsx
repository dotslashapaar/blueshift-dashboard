import { getTranslations } from "next-intl/server";
import MdxLayout from "@/app/mdx-layout";
import Divider from "@/app/components/Divider/Divider";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import Icon from "@/app/components/Icon/Icon";
import { courseColors } from "@/app/utils/course";
import ProgramChallengesContent from "@/app/components/Challenges/ProgramChallengesContent";
import ClientChallengesContent from "@/app/components/Challenges/ClientChallengesContent";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";
import { notFound } from "next/navigation";
import { getChallenge } from "@/app/utils/mdx";
import BackToCourseButtonClient from "@/app/components/Challenges/BackToCourseButtonClient";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    locale: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { challengeSlug, locale } = await params;
  const t = await getTranslations();
  const challengeMetadata = await getChallenge(challengeSlug);

  if (!challengeMetadata) {
    notFound();
  }

  let ChallengeContent;
  try {
    const challengeModule = await import(
      `@/app/content/challenges/${challengeMetadata.slug}/${locale}.mdx`
    );
    ChallengeContent = challengeModule.default;
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[challengeMetadata.language]},0.05) 0%, transpareksant 100%)`,
        }}
      >
        <div className="px-4 py-14 pb-20 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2 relative w-max">
              <CrosshairCorners
                size={5}
                spacingTop={2}
                spacingBottom={2}
                spacingX={6}
                style={{
                  color: `rgb(${courseColors[challengeMetadata.language]},1)`,
                }}
              />
              <div
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                style={{
                  backgroundColor: `rgb(${courseColors[challengeMetadata.language]},0.10)`,
                }}
              >
                <Icon name={challengeMetadata.language} size={16 as 14} />
              </div>
              <span
                className="font-medium text-lg font-mono relative top-0.25"
                style={{
                  color: `rgb(${courseColors[challengeMetadata.language]})`,
                }}
              >
                {challengeMetadata.language}
              </span>
            </div>
            <span className="sr-only">
              {t(`courses.${challengeMetadata.slug}.title`)}
            </span>
            <HeadingReveal
              text={t(`courses.${challengeMetadata.slug}.title`)}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />

            <BackToCourseButtonClient />
          </div>
        </div>
      </div>
      <Divider />

      {challengeMetadata.language === "Typescript" ? (
        <ClientChallengesContent
          currentChallenge={challengeMetadata}
          content={
            <MdxLayout>
              <ChallengeContent />
            </MdxLayout>
          }
        />
      ) : (
        <ProgramChallengesContent
          currentChallenge={challengeMetadata}
          content={
            <MdxLayout>
              <ChallengeContent />
            </MdxLayout>
          }
        />
      )}
    </div>
  );
}
