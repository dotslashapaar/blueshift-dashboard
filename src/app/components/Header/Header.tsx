"use client";

import Link from "next/link";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import { usePathname } from "next/navigation";
import Button from "../Button/Button";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const { setVisible } = useWalletModal();

  const isRootOrCourses =
    pathname === "/" ||
    pathname.split("/").length <= 2 ||
    pathname.startsWith("/courses");

  return (
    <div className="fixed bg-background/80 backdrop-blur-lg z-40 w-full border-b border-b-border">
      <div className="flex w-full items-center justify-between max-w-app mx-auto py-3 px-4 md:px-8">
        <div className="flex gap-x-16 items-center">
          <Link href="/">
            <img
              src="/branding/logo-primary.svg"
              className="h-4"
              alt="Blueshift Logo Primary"
            ></img>
          </Link>

          {/* Desktop Header */}
          <motion.div
            style={{ originY: "0px" }}
            className="gap-x-6 hidden md:flex"
          >
            <Link
              className={classNames(
                "py-2.5 px-3 relative rounded-xl transition flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                {
                  " !text-brand-primary": isRootOrCourses,
                }
              )}
              href="/"
            >
              {isRootOrCourses && (
                <motion.div
                  layoutId="nav-desktop"
                  style={{ originY: "0px" }}
                  transition={{ duration: 0.4, ease: anticipate }}
                  className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                ></motion.div>
              )}
              <Icon
                name="Lessons"
                className={classNames("text-text-tertiary", {
                  "!text-brand-primary": isRootOrCourses,
                })}
              />
              <span
                className={classNames("font-mono text-[15px] pt-0.5", {
                  "text-brand-secondary": isRootOrCourses,
                })}
              >
                {t("header.courses")}
              </span>
            </Link>
            <Link
              className={classNames(
                "py-2.5 px-3 relative transition rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                {
                  "!text-brand-primary": pathname.includes("/rewards"),
                }
              )}
              href="/rewards"
            >
              {pathname.includes("/rewards") && (
                <motion.div
                  layoutId="nav-desktop"
                  style={{ originY: "0px" }}
                  transition={{ duration: 0.4, ease: anticipate }}
                  className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                ></motion.div>
              )}
              <Icon
                name="Rewards"
                className={classNames("text-text-tertiary", {
                  "!text-brand-primary": pathname === "/rewards",
                })}
              />
              <span
                className={classNames("font-mono text-[15px] pt-0.5", {
                  "text-brand-secondary": pathname === "/rewards",
                })}
              >
                {t("header.rewards")}
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="flex gap-x-2 md:gap-x-3 items-center">
          {/* <Button
          label={t("header.set_goal")}
          icon="Target"
          variant="secondary"
          className="hidden md:flex"
          onClick={() => setOpenedModal("shift-goal")}
        /> */}
          <Button
            label={t("header.connect_wallet")}
            icon="Wallet"
            variant="primary"
            onClick={() => setVisible(true)}
          />
          <Button
            variant="tertiary"
            icon="Table"
            className="!px-0 !w-[42px] flex md:hidden"
            onClick={() => setIsOpen(true)}
          />
          {/* Mobile */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="before:absolute before:-left-36 before:top-0 before:w-36 before:h-full before:bg-gradient-to-r before:from-transparent before:to-background before:z-10 justify-between left-0 flex md:hidden absolute w-full h-full z-10 bg-background py-3 px-4"
                initial={{ x: "100dvw" }}
                animate={{ x: isOpen ? 0 : "0dvw" }}
                exit={{ x: "100dvw" }}
                transition={{ duration: 0.15, easing: anticipate }}
              >
                <div className="flex gap-x-6 items-center">
                  <Link
                    className={classNames(
                      "py-2.5 px-3 relative rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                      {
                        " !text-brand-primary": isRootOrCourses,
                      }
                    )}
                    href="/"
                  >
                    {isRootOrCourses && (
                      <motion.div
                        layoutId="nav-mobile"
                        transition={{ duration: 0.4, ease: anticipate }}
                        className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                      ></motion.div>
                    )}
                    <Icon
                      name="Lessons"
                      className={classNames("text-text-tertiary", {
                        "!text-brand-primary": isRootOrCourses,
                      })}
                    />
                    <span
                      className={classNames("font-mono text-[15px] pt-0.5", {
                        "text-brand-secondary": isRootOrCourses,
                      })}
                    >
                      {t("header.courses")}
                    </span>
                  </Link>
                  <Link
                    className={classNames(
                      "py-2.5 relative px-3 rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                      {
                        " !text-brand-primary": pathname === "/rewards",
                      }
                    )}
                    href="/rewards"
                  >
                    {pathname === "/rewards" && (
                      <motion.div
                        layoutId="nav-mobile"
                        transition={{ duration: 0.4, ease: anticipate }}
                        className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                      ></motion.div>
                    )}
                    <Icon
                      name="Rewards"
                      className={classNames("text-text-tertiary", {
                        "!text-brand-primary": pathname === "/rewards",
                      })}
                    />
                    <span
                      className={classNames("font-mono text-[15px] pt-0.5", {
                        "text-brand-secondary": pathname === "/rewards",
                      })}
                    >
                      {t("header.rewards")}
                    </span>
                  </Link>
                </div>
                <Button
                  variant="tertiary"
                  icon="ArrowRight"
                  className="!px-0 !w-[42px] flex md:hidden"
                  onClick={() => setIsOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
