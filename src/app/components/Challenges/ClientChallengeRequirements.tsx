"use client";

import { useTranslations } from "next-intl";
import Icon from "../Icon/Icon";
import { CourseMetadata } from "@/app/utils/course";
import TSChallengeEnv from "@/app/components/TSChallengeEnv/TSChallengeEnv";

interface ChallengeRequirementsProps {
  course: CourseMetadata;
  currentCode: string;
  onCodeChange: (newCode: string) => void;
}

export default function ChallengeRequirements({
  course,
  currentCode,
  onCodeChange,
}: ChallengeRequirementsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-y-12 w-full h-full min-h-[35dvh] lg:min-h-[65dvh]">
      {/* <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2 text-brand-secondary">
          <Icon name="Challenge" />
          <div className="font-medium font-mono">
            {t("challenge_page.requirements_title").toUpperCase()}
          </div>
        </div>
        <div className="text-primary font-medium text-2xl">
          {t(`courses.${course.slug}.challenge.title`)}
        </div>
      </div>
      <div className="custom-scrollbar max-h-[350px] overflow-y-scroll flex pr-2 sm:pr-10 pt-8 -mt-8 flex-col gap-y-12 pb-12 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]">
        {course.challenge.requirements.map((req, index) => (
          <div key={index} className="flex flex-col gap-y-3">
            <span className="font-medium text-primary">
              {t(
                `courses.${course.slug}.challenge.requirements.${req.instructionKey}.title`
              )}
            </span>
            <p className="text-secondary leading-[160%]">
              {t(
                `courses.${course.slug}.challenge.requirements.${req.instructionKey}.description`
              )}
            </p>
          </div>
        ))}
      </div> */}
      <TSChallengeEnv
        initialCode={currentCode}
        onCodeChange={onCodeChange}
        challengeTitle={t(`courses.${course.slug}.challenge.title`)}
      />
    </div>
  );
}
