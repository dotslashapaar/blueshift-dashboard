import { useTranslations } from "next-intl";
import Courses from "../components/CoursesContent/Courses";
import HeadingReveal from "../components/HeadingReveal/HeadingReveal";
import CrosshairCorners from "../components/Graphics/CrosshairCorners";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-col w-full gap-y-8">
      <div className="w-full [background:linear-gradient(180deg,rgba(17,20,26,0.35)_0%,rgba(17,20,26,0)_100%)]">
        <div className="px-4 pt-14 md:pt-14 max-w-app md:px-8 lg:px-14 mx-auto w-full">
          <div className="flex flex-col gap-y-2">
            <div className="relative w-max">
              <span className="text-secondary font-medium text-xl leading-none font-mono">
                {t("lessons.subtitle")}
              </span>
              <CrosshairCorners
                size={5}
                spacingTop={4}
                spacingBottom={1}
                spacingX={5}
              />
            </div>
            <span className="sr-only">{t("lessons.title")}</span>
            <HeadingReveal
              text={t("lessons.title")}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />
          </div>
        </div>
      </div>

      <Courses />
    </div>
  );
}
