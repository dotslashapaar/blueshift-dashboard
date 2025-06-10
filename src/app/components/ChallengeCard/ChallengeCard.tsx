import { CourseDifficulty } from "@/app/utils/course";
import { CourseLanguages } from "@/app/utils/course";
import React, { useRef } from "react";
import classNames from "classnames";
import DifficultyBadge from "../DifficultyBadge/DifficultyBadge";
import HeadingReveal from "../HeadingReveal/HeadingReveal";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";

type ChallengeCardProps = {
  name: string;
  color: string;
  points?: number;
  language: CourseLanguages;
  difficulty?: CourseDifficulty;
  footer?: React.ReactNode;
  className?: string;
  link?: string;
};

export default function ChallengeCard({
  name,
  color,
  language,
  difficulty,
  footer,
  className,
  link,
}: ChallengeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    transform,
    isHovered,
    direction,
    swooshAngle,
    handleMouseEnter,
    handleMouseLeave,
  } = useDirectionalHover(cardRef);

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--courseColor": color,
          "--swoosh-angle": `${swooshAngle}deg`,
          // transform: `translate(${transform.x}px, ${transform.y}px)`,
        } as React.CSSProperties
      }
      className={classNames(
        "transition-transform flex overflow-hidden duration-300 animate-card-swoosh",
        "gradient-border rounded-[18px] pt-5 pb-8 px-5 aspect-square sm:aspect-[3/4] relative [background:linear-gradient(180deg,rgb(var(--courseColor),0.05),transparent_75%),linear-gradient(180deg,#11141A_0%,#0B0E14_125%)]",
        "before:[background:linear-gradient(145deg,rgba(97,99,107,0.25)_30%,rgba(129,105,196,0.33)_40%,rgba(142,179,212,0.33)_45%,rgba(157,211,187,0.33)_50%,rgba(189,199,128,0.33)_55%,rgba(145,119,94,0.33)_60%,rgba(97,99,107,0.25)_70%),linear-gradient(180deg,rgba(173,185,210,0.05)_0%,rgba(173,185,210,0.05)_100%)]",
        isHovered && `swoosh-${direction}`,
        className
      )}
    >
      {link && (
        <Link href={link} className="absolute inset-0 z-1 w-full h-full"></Link>
      )}
      {difficulty && (
        <div className="absolute top-6 right-5">
          <DifficultyBadge difficulty={difficulty} />
        </div>
      )}
      <div
        className={classNames(
          "flex flex-col gap-y-24 flex-grow justify-between"
        )}
      >
        <div className={classNames("flex", "flex-col gap-y-6 items-start")}>
          <img
            src={`/graphics/challenge-${language.toLowerCase()}.svg`}
            className="h-16 -ml-1.5 [filter:drop-shadow(0_6px_4px_rgba(0,0,0,0.25))]"
          />
          <div className="flex flex-col gap-y-2.5">
            <div className="flex items-center gap-x-3">
              <HeadingReveal
                headingLevel="h3"
                text={language}
                className="font-mono font-medium leading-none tracking-normal"
                color={`rgb(${color})`}
                cursorColor={`rgb(${color})`}
                splitBy="chars"
                baseDelay={0.2}
              />
            </div>
            <div className="text-xl font-medium text-primary leading-[120%]">
              {name}
            </div>
          </div>
        </div>
        {footer && footer}
      </div>
    </motion.div>
  );
}
