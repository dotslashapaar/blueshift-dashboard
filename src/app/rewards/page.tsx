import { createTranslation } from "@/i18n/server";
import HeadingReveal from "../components/HeadingReveal/HeadingReveal";
import Rewards from "../components/RewardsContent/Rewards";

export default async function RewardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { t } = await createTranslation(resolvedParams.locale, "common");

  return (
    <div className="flex flex-col w-full gap-y-8">
      <div className="relative px-4 pt-14 md:pt-14 max-w-app md:px-8 lg:px-14 mx-auto w-full [background:linear-gradient(180deg,rgba(0,179,179,0.04)_0%,rgba(0,179,179,0)_100%),linear-gradient(180deg,rgba(17,20,26,0.35)_0%,rgba(17,20,26,0)_100%)]">
        <div className="flex flex-col gap-y-2">
          <span className="text-secondary font-medium text-xl leading-none">
            {t("rewards.subtitle")}
          </span>
          <span className="sr-only">{t("rewards.title")}</span>
          <HeadingReveal
            text={t("rewards.title")}
            headingLevel="h1"
            className="text-3xl font-semibold"
          />
        </div>
      </div>
      <Rewards />
    </div>
  );
}
