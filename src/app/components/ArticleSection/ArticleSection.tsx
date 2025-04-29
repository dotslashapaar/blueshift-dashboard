"use client";

import { useEffect, useState } from "react";
import CopyClipboard from "../CopyClipboard/CopyClipboard";
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
  const [value, setValue] = useState("");
  useEffect(() => {
    const value = `${window.location.origin}${pathname}#${id}`;
    setValue(value);
  }, [id, pathname]);

  return (
    <Heading id={id} className="scroll-mt-24 flex items-center gap-x-2">
      {name}
      <CopyClipboard value={value} />
    </Heading>
  );
}

export default ArticleSection;
