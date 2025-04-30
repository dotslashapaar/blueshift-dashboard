import { useTranslations } from "next-intl";

export default function RewardsEmpty() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <img
        src="/graphics/empty-state-filters.svg"
        alt="Empty State Filters"
        className="sm:w-[500px]"
      />

      <div className="flex flex-col items-center justify-center gap-y-3 -mt-20 mx-auto w-[300px]">
        <span className="text-lg font-medium text-primary leading-none text-center">
          {t("rewards.empty_title")}
        </span>
        <span className="text-secondary leading-[140%] text-center">
          {t("rewards.empty_description")}
        </span>
      </div>
    </div>
  );
}
