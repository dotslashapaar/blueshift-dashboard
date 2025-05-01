"use client";

import { useEffect } from "react";
import ShiftGoal from "./ShiftGoal";
import { usePersistentStore, useStore } from "@/stores/store";
import ConnectWalletRecommended from "./ConnectWalletRecommended";
import { useIsClient } from "usehooks-ts";
import { getAllCourses } from "@/app/utils/mdx";

export default function GlobalModals() {
  const { connectionRecommendedViewed, courseStatus, setCourseStatus } =
    usePersistentStore();
  const { setOpenedModal } = useStore();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    // Initialize course statuses
    const initializeCourseStatuses = async () => {
      const courses = await getAllCourses();
      courses.forEach((course) => {
        if (!courseStatus[course.slug]) {
          setCourseStatus(course.slug, "Locked");
        }
      });
    };

    initializeCourseStatuses();

    setTimeout(() => {
      if (!connectionRecommendedViewed) {
        setOpenedModal("connect-wallet-recommended");
      }
    }, 1000);
  }, [
    connectionRecommendedViewed,
    setOpenedModal,
    isClient,
    courseStatus,
    setCourseStatus,
  ]);

  return (
    <>
      <ShiftGoal />
      <ConnectWalletRecommended />
    </>
  );
}
