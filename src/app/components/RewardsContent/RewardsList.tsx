"use client";

import {CourseMetadata} from "@/app/utils/course";

import {usePersistentStore} from "@/stores/store";
import CourseCard from "../CourseCard/CourseCard";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import i18n from "@/i18n/client";
import Divider from "../Divider/Divider";
import RewardsEmpty from "./RewardsEmpty";
import RewardsFooter from "./RewardsFooter";
import {motion} from "motion/react";
import {anticipate} from "motion";
import {useWindowSize} from "usehooks-ts";
import {useEffect} from "react";

const rewardSections = {
  Unclaimed: {
    icon: "Unclaimed",
    title: "rewards.Unclaimed",
  },
  Locked: {
    icon: "Locked",
    title: "rewards.locked",
  },
  Claimed: {
    icon: "Claimed",
    title: "rewards.claimed",
  },
} as const;

type RewardsListProps = {
  initialCourses: CourseMetadata[];
};

export default function RewardsList({ initialCourses }: RewardsListProps) {
  const { t } = i18n;
  const { view, setView, selectedRewardStatus } = usePersistentStore();

  const filteredRewards = initialCourses.filter((course) => {
    return selectedRewardStatus.length === 0 ||
      (course.status &&
        selectedRewardStatus.includes(course.status));
  });

  const hasNoResults = filteredRewards.length === 0;
  const hasNoFilters = selectedRewardStatus.length === 0;

  const { width } = useWindowSize();

  useEffect(() => {
    if (width < 768) {
      setView("grid");
    }
  }, [width, setView]);

  return (
    <motion.div
      key={`${view}`}
      className="flex flex-col group-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
    >
      {hasNoFilters && <RewardsEmpty />}
      {hasNoResults && <RewardsEmpty />}
      {!hasNoFilters && !hasNoResults && (
        <>
          {/* Reward Sections */}
          {Object.entries(rewardSections).map(([status, section]) => {
            const statusRewards = filteredRewards.filter(
              (reward) => reward.status === status
            );

            if (statusRewards.length === 0) return null;

            return (
              <div key={status} className="flex flex-col group">
                <div className="flex flex-col gap-y-8">
                  <div className="flex items-center gap-x-3">
                    <Icon
                      className="text-brand-secondary"
                      name={section.icon}
                    />
                    <span className="text-lg leading-none font-medium text-secondary">
                      {t(section.title)}
                    </span>
                  </div>
                  <div
                    className={classNames(
                      "grid",
                      view === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1",
                      "gap-5"
                    )}
                  >
                    {statusRewards.map((reward) => (
                      <CourseCard
                        key={reward.slug}
                        name={reward.title}
                        language={reward.language}
                        difficulty={reward.difficulty}
                        status={reward.status}
                        color={reward.color}
                        className={classNames(
                          (status === "Claimed" || status === "Locked") &&
                            "opacity-70"
                        )}
                        footer={
                          <RewardsFooter
                            status={
                              reward.status as
                                | "Claimed"
                                | "Locked"
                                | "Unclaimed"
                            }
                          />
                        }
                      />
                    ))}
                  </div>
                </div>
                <Divider className="my-12 group-last:hidden" />
              </div>
            );
          })}
        </>
      )}
    </motion.div>
  );
}
