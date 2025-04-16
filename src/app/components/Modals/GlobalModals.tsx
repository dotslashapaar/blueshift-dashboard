"use client";

import { useEffect } from "react";
import ShiftGoal from "./ShiftGoal";
import { usePersistentStore, useStore } from "@/stores/store";
import ConnectWalletRecommended from "./ConnectWalletRecommended";
import { useIsClient } from "usehooks-ts";

export default function GlobalModals() {
  const { connectionRecommendedViewed } = usePersistentStore();
  const { setOpenedModal } = useStore();
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) return;

    setTimeout(() => {
      if (!connectionRecommendedViewed) {
        setOpenedModal("connect-wallet-recommended");
      }
    }, 1000);
  }, [connectionRecommendedViewed, setOpenedModal, isClient]);

  return (
    <>
      <ShiftGoal />
      <ConnectWalletRecommended />
    </>
  );
}
