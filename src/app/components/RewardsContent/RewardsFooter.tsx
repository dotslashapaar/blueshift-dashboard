import Button from "../Button/Button";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import Icon from "../Icon/Icon";

type RewardsFooterProps = {
  status: "Claimed" | "Locked" | "Unclaimed";
};

export default function RewardsFooter({ status }: RewardsFooterProps) {
  const t = useTranslations();

  const { view } = usePersistentStore();

  return (
    <div
      className={classNames(
        "relative z-10 flex",
        view === "list" &&
          "ml-auto flex-col items-end gap-y-2.5 justify-center",
        view === "grid" && "w-full justify-between items-end"
      )}
    >
      {status === "Unclaimed" && (
        <Button
          variant="primary"
          size="md"
          label={t("rewards.claim")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
        />
      )}
      {status === "Locked" && (
        <span className="text-tertiary font-medium gap-x-1.5 flex items-center">
          <Icon name="Locked" />
          {t("rewards.locked_description")}
        </span>
      )}
      {status === "Claimed" && (
        <Button
          variant="primary"
          size="md"
          label={t("rewards.view_nft")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
        />
      )}
    </div>
  );
}
