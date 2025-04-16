"use client";

import { motion } from "motion/react";
import Icon from "../Icon/Icon";
import { useEffect, useState } from "react";
import { anticipate } from "motion";
import classNames from "classnames";
import i18n from "@/i18n/client";
export default function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<{ id: string; text: string }[]>([]);
  const { t } = i18n;
  useEffect(() => {
    // Get all h3 elements from the article
    const article = document.querySelector("article");
    if (!article) return;

    const h3Elements = article.querySelectorAll("h3");
    const sections = Array.from(h3Elements).map((h3) => ({
      id: h3.id,
      text: h3.textContent || "",
    }));
    setSections(sections);

    // Create intersection observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    // Observe all h3 elements
    h3Elements.forEach((h3) => observer.observe(h3));

    return () => {
      h3Elements.forEach((h3) => observer.unobserve(h3));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
      className="h-max lg:sticky top-32 md:col-span-3 flex flex-col gap-y-8"
    >
      <div className="flex items-center space-x-2">
        <Icon name="Table" />
        <span className="font-medium font-mono text-primary">
          {t("contents.contents")}
        </span>
      </div>
      <div className="flex space-x-5 items-stretch">
        {/* Scroll Spy Background */}
        <div className="w-[3px] bg-background-card rounded-full"></div>
        <div className="flex flex-col gap-y-5 w-max">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`relative font-medium text-secondary transition hover:text-primary`}
            >
              {activeSection === section.id && (
                <motion.div
                  className={classNames(
                    "absolute -left-[calc(24px-1px)] w-[3px] bg-brand-secondary",
                    {
                      // Add top rounding if first section
                      "rounded-t-full":
                        activeSection === section.id &&
                        sections[0].id === section.id,
                      // Add bottom rounding if last section
                      "rounded-b-full":
                        activeSection === section.id &&
                        sections[sections.length - 1].id === section.id,
                    }
                  )}
                  style={{ height: "24px" }}
                  layoutId={`article`}
                  transition={{ duration: 0.4, ease: anticipate }}
                />
              )}
              {section.text}
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Icon name="Github" />
        <span className="font-medium font-mono text-primary">
          {t("contents.view_source")}
        </span>
      </div>
    </motion.div>
  );
}
