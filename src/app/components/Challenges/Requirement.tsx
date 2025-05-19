import React from "react";

interface RequirementProps {
  title: string;
  description: string;
}

export function Requirement({ title, description }: RequirementProps) {
  return (
    <div className="flex flex-col gap-y-3">
      <span className="font-medium text-primary">{title}</span>
      <p className="text-secondary leading-[160%] not-prose">{description}</p>
    </div>
  );
}
