import React from "react";

interface ChallengeRequirementListProps {
  children: React.ReactNode;
}

export function RequirementList({children}: ChallengeRequirementListProps) {
  return (
    <div className="custom-scrollbar max-h-[350px] overflow-y-scroll flex pr-2 sm:pr-10 pt-8 flex-col gap-y-12 pb-12 mt-4 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]">
      {children}
    </div>
  );
}
