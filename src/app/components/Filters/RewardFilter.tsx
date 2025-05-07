"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import classNames from "classnames";
import Icon from "../Icon/Icon";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";
import { RewardsStatus, rewardsStatus } from "@/app/utils/course";
import Checkbox from "../Checkbox/Checkbox";
import { usePersistentStore } from "@/stores/store";
import Divider from "../Divider/Divider";

interface FiltersProps {
  className?: string;
}

export default function RewardFilter({ className }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const { selectedRewardStatus, toggleRewardStatus } = usePersistentStore();
  const t = useTranslations();

  const allStatuses: ReadonlyArray<RewardsStatus> = rewardsStatus;
  const displayText =
    selectedRewardStatus.length === allStatuses.length
      ? t("rewards.filter__label")
      : selectedRewardStatus.length === 1
        ? selectedRewardStatus[0]
        : `${selectedRewardStatus.length} ${t("rewards.filter__selected_statuses")}`;

  const toggleAllStatuses = () => {
    if (selectedRewardStatus.length === allStatuses.length) {
      // If all are selected, deselect all
      allStatuses.forEach((status) => {
        if (selectedRewardStatus.includes(status)) {
          toggleRewardStatus(status);
        }
      });
    } else {
      // If not all are selected, select all
      allStatuses.forEach((status) => {
        if (!selectedRewardStatus.includes(status)) {
          toggleRewardStatus(status);
        }
      });
    }
  };

  const handleStatusClick = (status: RewardsStatus) => {
    if (selectedRewardStatus.length === allStatuses.length) {
      // If "All" is selected, deselect all and select only the clicked status
      allStatuses.forEach((s) => {
        if (selectedRewardStatus.includes(s)) {
          toggleRewardStatus(s);
        }
      });
      toggleRewardStatus(status);
    } else {
      // Normal toggle behavior
      toggleRewardStatus(status);
    }
  };

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div
      className="relative"
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
    >
      <button
        onMouseDown={() => setIsOpen(!isOpen)}
        className={classNames(
          "cursor-pointer w-[160px] gap-x-4 pl-3 pr-4 py-3 transition outline-transparent focus-within:outline-border-active relative h-[50px] bg-card border hover:border-border-active border-border bg-background-card rounded-xl flex items-center justify-start",
          className
        )}
      >
        <Icon name="Filter" className="text-tertiary" />
        <span className="text-tertiary text-sm font-medium">{displayText}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: anticipate }}
            className={classNames(
              "border border-border z-50 rounded-xl flex w-max flex-col gap-y-1 absolute top-[calc(100%+6px)] p-1 bg-background-card",
              className
            )}
          >
            <button
              onClick={toggleAllStatuses}
              className="flex items-center gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-background-card-foreground"
            >
              <Checkbox
                checked={selectedRewardStatus.length === allStatuses.length}
              />
              <span className="text-sm font-medium leading-none text-secondary">
                {t("rewards.filter__all_statuses")}
              </span>
            </button>
            <Divider />
            <div className={classNames("flex relative flex-col gap-y-1")}>
              <AnimatePresence>
                {selectedRewardStatus.length === allStatuses.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1, ease: anticipate }}
                    className={classNames(
                      "absolute top-0 left-0 w-full h-full bg-background-card-foreground rounded-lg"
                    )}
                  />
                )}
              </AnimatePresence>
              {allStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  className={classNames(
                    "flex items-center relative gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-background-card-foreground",
                    selectedRewardStatus.includes(status) &&
                      selectedRewardStatus.length !== allStatuses.length &&
                      "bg-background-card-foreground"
                  )}
                >
                  <Checkbox
                    theme="secondary"
                    className="z-10 relative"
                    checked={selectedRewardStatus.includes(status)}
                  />
                  <div className="flex items-center gap-x-2 relative z-10">
                    <Icon className="text-tertiary" name={status} />
                    <span
                      className={classNames(
                        "text-sm font-medium leading-none text-secondary",
                        selectedRewardStatus.includes(status) && "!text-primary"
                      )}
                    >
                      {t(`reward_statuses.${status}`)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
