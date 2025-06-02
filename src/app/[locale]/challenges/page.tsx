import { useTranslations } from "next-intl";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import Challenges from "@/app/components/ChallengeCenterContent/Challenges";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";

export default function RewardsPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col w-full gap-y-8">
      <div className="w-full [background:linear-gradient(180deg,rgba(0,179,179,0.04)_0%,rgba(0,179,179,0)_100%),linear-gradient(180deg,rgba(17,20,26,0.35)_0%,rgba(17,20,26,0)_100%)]">
        <div className="relative px-4 pt-14 md:pt-14 max-w-app md:px-8 lg:px-14 mx-auto w-full">
          <div className="flex flex-col gap-y-2">
            <div className="relative w-max">
              <span className="text-secondary font-medium text-xl leading-none font-mono">
                {t("ChallengeCenter.subtitle")}
              </span>
              <CrosshairCorners
                size={5}
                spacingTop={4}
                spacingBottom={1}
                spacingX={5}
              />
            </div>
            <span className="sr-only">{t("ChallengeCenter.title")}</span>
            <HeadingReveal
              text={t("ChallengeCenter.title")}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />
          </div>
        </div>
      </div>
      <Challenges />
    </div>
  );
}
