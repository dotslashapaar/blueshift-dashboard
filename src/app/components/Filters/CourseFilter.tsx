"use client";
import { useRef, useState } from "react";

import classNames from "classnames";
import i18n from "../../../i18n/client";
import Icon from "../Icon/Icon";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";
import { courseLanguages, CourseLanguages } from "@/app/utils/course";
import Checkbox from "../Checkbox/Checkbox";
import { IconName } from "../Icon/icons";
import { usePersistentStore } from "@/stores/store";
import Divider from "../Divider/Divider";

interface FiltersProps {
  className?: string;
}

export default function CourseFilter({ className }: FiltersProps) {
  const { t } = i18n;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const { selectedLanguages, toggleLanguage } = usePersistentStore();

  const allLanguages = Object.keys(courseLanguages) as CourseLanguages[];
  const displayText =
    selectedLanguages.length === allLanguages.length
      ? "All Languages"
      : selectedLanguages.length === 1
        ? selectedLanguages[0]
        : `${selectedLanguages.length} Languages`;

  const toggleAllLanguages = () => {
    if (selectedLanguages.length === allLanguages.length) {
      // If all are selected, deselect all
      allLanguages.forEach((lang) => {
        if (selectedLanguages.includes(lang)) {
          toggleLanguage(lang);
        }
      });
    } else {
      // If not all are selected, select all
      allLanguages.forEach((lang) => {
        if (!selectedLanguages.includes(lang)) {
          toggleLanguage(lang);
        }
      });
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
              onClick={toggleAllLanguages}
              className="flex items-center gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-background-card-foreground"
            >
              <Checkbox
                checked={selectedLanguages.length === allLanguages.length}
              />
            </button>
            <Divider />
            <div className={classNames("flex relative flex-col gap-y-1")}>
              <AnimatePresence>
                {selectedLanguages.length === allLanguages.length && (
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
              {allLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => toggleLanguage(language)}
                  className={classNames(
                    "flex items-center relative gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-background-card-foreground",
                    selectedLanguages.includes(language) &&
                      selectedLanguages.length !== allLanguages.length &&
                      "bg-background-card-foreground"
                  )}
                >
                  <Checkbox
                    className="z-10 relative"
                    checked={selectedLanguages.includes(language)}
                  />
                  <div className="flex items-center gap-x-2 relative z-10">
                    <Icon name={language as IconName} />
                    <span
                      className={classNames(
                        "text-sm font-medium leading-none text-secondary",
                        selectedLanguages.includes(language) && "!text-primary"
                      )}
                    >
                      {language}
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
