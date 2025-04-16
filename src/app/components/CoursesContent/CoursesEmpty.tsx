import i18n from "@/i18n/client";

type CoursesEmptyProps = {
  type: "no_filters" | "no_results";
};

export default function CoursesEmpty({ type }: CoursesEmptyProps) {
  const { t } = i18n;

  return (
    <div className="flex flex-col items-center justify-center relative">
      {type === "no_filters" && (
        <img
          src="/graphics/empty-state-filters.svg"
          alt="Empty State Filters"
          className="sm:w-[500px]"
        />
      )}
      {type === "no_results" && (
        <img
          src="/graphics/empty-state-search.svg"
          alt="Empty State Results"
          className="sm:w-[500px]"
        />
      )}

      <div className="flex flex-col items-center justify-center gap-y-3 -mt-20 mx-auto w-[300px]">
        <span className="text-lg font-medium text-primary leading-none text-center">
          {type === "no_filters"
            ? t("lessons.empty_filters_title")
            : t("lessons.empty_results_title")}
        </span>
        <span className="text-secondary leading-[140%] text-center">
          {type === "no_filters"
            ? t("lessons.empty_filters_description")
            : t("lessons.empty_results_description")}
        </span>
      </div>
    </div>
  );
}
