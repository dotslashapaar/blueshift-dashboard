"use client";

import { useEffect } from "react";
import ShiftGoal from "./ShiftGoal";
import { usePersistentStore, useStore } from "@/stores/store";
import ConnectWalletRecommended from "./ConnectWalletRecommended";
import { useIsClient } from "usehooks-ts";
import { getAllChallenges } from "@/app/utils/mdx";

export default function GlobalModals() {
  const { connectionRecommendedViewed, challengeStatuses, setChallengeStatus } =
    usePersistentStore();
  const { setOpenedModal } = useStore();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    // Initialize challenge statuses
    const initializeChallengeStatuses = async () => {
      const challenges = await getAllChallenges();
      challenges.forEach((challenge) => {
        if (!challengeStatuses[challenge.slug]) {
          setChallengeStatus(challenge.slug, "open");
        }
      });
    };

    initializeChallengeStatuses();

    setTimeout(() => {
      if (!connectionRecommendedViewed) {
        setOpenedModal("connect-wallet-recommended");
      }
    }, 1000);
  }, [
    connectionRecommendedViewed,
    setOpenedModal,
    isClient,
    challengeStatuses,
    setChallengeStatus,
  ]);

  return (
    <>
      <ShiftGoal />
      <ConnectWalletRecommended />
    </>
  );
}
