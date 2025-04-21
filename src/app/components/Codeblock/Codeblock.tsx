"use client";

import { useRef, useState } from "react";
import Icon from "../Icon/Icon";
import { motion } from "motion/react";
import classNames from "classnames";
import { anticipate } from "motion";

export function Codeblock({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const preRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleClickCopy = async () => {
    const code = preRef.current?.textContent;

    if (!code) return;

    await navigator.clipboard.writeText(code);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full border border-border rounded-xl overflow-hidden !my-8">
      <div className="text-sm font-medium text-brand-secondary flex items-center justify-between px-6 py-3 border-b-border bg-background-card-foreground rounded-t-xl">
        {lang}
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: anticipate }}
            key={isCopied ? "success" : "copy"}
            onClick={() => {
              if (isCopied) return;
              handleClickCopy();
            }}
          >
            <Icon
              name={isCopied ? "Success" : "Copy"}
              size={16 as 18 | 14 | 12}
              className={classNames(
                "text-mute hover:text-secondary transition cursor-pointer",
                {
                  "!text-brand-primary !cursor-default": isCopied,
                }
              )}
            />
          </motion.div>
        )}
      </div>
      <div className="bg-background-card" ref={preRef}>
        {children}
      </div>
    </div>
  );
}

export default Codeblock;
