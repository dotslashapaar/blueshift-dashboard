import Button, { ButtonVariant } from "../Button/Button";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import useMintNFT from "@/hooks/useMintNFT";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { Link } from "@/i18n/navigation";
import NFTViewer from "../NFTViewer/NFTViewer";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type ChallengesFooterProps = {
  challenge: ChallengeMetadata;
  setIsNFTViewerOpen: (isOpen: boolean) => void;
  setSelectedChallenge: (challenge: ChallengeMetadata) => void;
};

export default function ChallengesFooter({
  challenge,
  setIsNFTViewerOpen,
  setSelectedChallenge,
}: ChallengesFooterProps) {
  const t = useTranslations();
  const { challengeStatuses } = usePersistentStore();
  const status = challengeStatuses[challenge.slug];
  const { view } = usePersistentStore();
  const { mint } = useMintNFT();
  const auth = useAuth();

  const handleMint = async () => {
    if (!auth.connected) {
      return auth.login();
    }
    console.log("minting");
    mint(challenge).catch((error) => {
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
      {status === "open" && (
        <Link
          href={`/challenges/${challenge.slug}`}
          className="text-brand-secondary hover:text-brand-primary transition font-medium !w-full !min-w-[150px]"
        >
          <Button
            variant={challenge.language.toLowerCase() as ButtonVariant}
            size="md"
            label={t("lessons.take_challenge")}
            icon="Challenge"
            className="!w-full"
            iconSide="left"
          />
        </Link>
      )}
      {status === "completed" && (
        <Button
          variant="primary"
          size="md"
          label={t("ChallengeCenter.claim")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
          onClick={handleMint}
        />
      )}
      {status === "claimed" && (
        <Button
          variant={challenge.language.toLowerCase() as ButtonVariant}
          size="md"
          label={t("ChallengeCenter.view_nft")}
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
          onClick={() => {
            setIsNFTViewerOpen(true);
            setSelectedChallenge(challenge);
          }}
        />
      )}
    </div>
  );
}
