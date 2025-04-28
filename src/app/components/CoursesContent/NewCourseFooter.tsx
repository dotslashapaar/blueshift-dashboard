import Link from "next/link";
import Button from "../Button/Button";
import i18n from "@/i18n/client";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import Icon from "../Icon/Icon";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

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
      <div className="flex items-center gap-x-2">
        <ProgressCircle percentFilled={10} />
        <span className="pt-1 text-sm text-tertiary font-mono">
          0 / {lessonCount}
        </span>
      </div>
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
