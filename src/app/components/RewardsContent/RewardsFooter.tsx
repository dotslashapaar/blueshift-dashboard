import Button from "../Button/Button";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import Icon from "../Icon/Icon";
import { CourseMetadata } from "@/app/utils/course";
import useMintNFT from "@/hooks/useMintNFT";

type RewardsFooterProps = {
  course: CourseMetadata;
};

export default function RewardsFooter({ course }: RewardsFooterProps) {
  const t = useTranslations();
  const { courseStatus } = usePersistentStore();
  const status = courseStatus[course.slug];
  const { view } = usePersistentStore();
  const { mint } = useMintNFT();

  const handleMint = async () => {
    console.log("minting")
    mint(course)
      .catch((error) => {
        console.error("Error minting NFT:", error);
      });
  };

  return (
    <div
      className={classNames(
        "relative z-10 flex",
        view === "list" &&
          "ml-auto flex-col items-end gap-y-2.5 justify-center",
        view === "grid" && "w-full justify-between items-end"
      )}
    >
      {status === "Locked" && (
        <span className="text-tertiary font-medium gap-x-1.5 flex items-center">
          <Icon name="Locked" />
          {t("rewards.locked_description")}
        </span>
      )}
      {status === "Unlocked" && (
        <Button
          variant="primary"
          size="md"
          label={t("rewards.claim")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
          onClick={handleMint}
        />
      )}
      {status === "Claimed" && (
        <Button
          variant="primary"
          size="md"
          label={t("rewards.view_nft")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
          disabled
        />
      )}
    </div>
  );
}
