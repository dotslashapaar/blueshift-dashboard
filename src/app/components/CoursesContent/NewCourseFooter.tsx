import Link from "next/link";
import Button from "../Button/Button";
import i18n from "@/i18n/client";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";

type NewCourseFooterProps = {
  courseSlug: string;
  lessonCount: number;
};

export default function NewCourseFooter({
  lessonCount,
  courseSlug,
}: NewCourseFooterProps) {
  const { t } = i18n;

  const { view } = usePersistentStore();

  return (
    <div
      className={classNames(
        "flex",
        view === "list" &&
          "ml-auto flex-col items-end gap-y-2.5 justify-center",
        view === "grid" && "w-full justify-between items-end"
      )}
    >
      <span className="text-sm text-tertiary font-mono">
        {lessonCount} {t("lessons.lessons")}
      </span>
      <Link href={`/courses/${courseSlug}`}>
        <Button
          variant="primary"
          size="md"
          label={t("lessons.start_course")}
          icon="Claim"
          iconSide="right"
        />
      </Link>
    </div>
  );
}
