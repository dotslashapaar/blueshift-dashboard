import { ReactNode } from "react";

interface ChallengeTitleProps {
  children: ReactNode;
}

export function ChallengeTitle({children}: ChallengeTitleProps) {
  return (
    <div className="text-primary font-medium text-2xl">
      {children}
    </div>
  );
}
