"use client";

import Icon from "../Icon/Icon";
import { usePathname } from "next/navigation";

export function ArticleSection({
  name,
  id,
  level = "h2",
}: {
  name: string;
  id: string;
  level?: "h2" | "h3" | "h4";
}) {
  const pathname = usePathname();
  const Heading = level;

  return (
    <Heading id={id} className="scroll-mt-24 flex items-center gap-x-2">
      {name}
      <div
        className="cursor-pointer"
        onClick={() => {
          const fullUrl = `${window.location.origin}${pathname}#${id}`;
          navigator.clipboard.writeText(fullUrl);
        }}
      >
        <Icon
          name="Link"
          className="transition text-mute hover:text-tertiary"
        />
      </div>
    </Heading>
  );
}

export default ArticleSection;
