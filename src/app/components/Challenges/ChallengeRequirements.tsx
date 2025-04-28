"use client";

import Icon from "../Icon/Icon";
import { challengeMetadata } from "@/app/utils/course";

interface ChallengeRequirementsProps {
  challenge: challengeMetadata
}

export default function ChallengeRequirements({
  challenge
}: ChallengeRequirementsProps) {
  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2 text-brand-secondary">
          <Icon name="Challenge" />
          <div className="font-medium font-mono">CHALLENGE</div>
        </div>
        <div className="text-primary font-medium text-2xl">{challenge.title}</div>
      </div>
      <div className="custom-scrollbar max-h-[350px] overflow-y-scroll flex pr-2 sm:pr-10 pt-8 -mt-8 flex-col gap-y-12 pb-12 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]">
        {challenge.requirements.map((req, index) => (
          <div key={index} className="flex flex-col gap-y-3">
            <span className="font-medium text-primary">{req.title}</span>
            <p className="text-secondary leading-[160%]">{req.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
