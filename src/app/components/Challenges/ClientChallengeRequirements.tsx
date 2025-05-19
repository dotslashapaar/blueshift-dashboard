"use client";

import { useTranslations } from "next-intl";
import Icon from "../Icon/Icon";
import TSChallengeEnv from "@/app/components/TSChallengeEnv/TSChallengeEnv";
import { ReactNode } from "react";

interface ChallengeRequirementsProps {
  content: ReactNode
  currentCode: string;
  onCodeChange: (newCode: string) => void;
}

export default function ChallengeRequirements({
  content,
  currentCode,
  onCodeChange,
}: ChallengeRequirementsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2 text-brand-secondary">
          <Icon name="Challenge" />
          <div className="font-medium font-mono">
            {t("challenge_page.requirements_title").toUpperCase()}
          </div>
        </div>
        {content}
      </div>

      <TSChallengeEnv initialCode={currentCode} onCodeChange={onCodeChange} />
    </div>
  );
}
