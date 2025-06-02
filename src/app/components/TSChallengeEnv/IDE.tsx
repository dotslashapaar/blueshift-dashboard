"use client";

import classNames from "classnames";
import { anticipate } from "motion";
import RightPanel from "@/app/components/TSChallengeEnv/RightPanel";
import BlueshiftEditor from "@/app/components/TSChallengeEnv/BlueshiftEditor";
import { motion } from "motion/react";
import { useEsbuildRunner } from "@/hooks/useEsbuildRunner";
import { TestRequirement } from "@/app/components/TSChallengeEnv/types/test-requirements";
import { useState } from "react";
import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import LogoGlyph from "../Logo/LogoGlyph";
import { useTranslations } from "next-intl";

interface IDEProps {
  initialCode: string;
  challengeTitle: string;
}

export default function IDE() {
  const [ideView, setIdeView] = useState<"minified" | "expanded">("minified");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const {
    esBuildInitializationState,
    isRunning: isCodeRunning,
    logs: runnerLogs,
  } = useEsbuildRunner();

  const initialCode = `
async function main() {
  console.log("Hello, Solana!");
}
`;
  const handleCodeUpdate = () => console.log("Code updated");

  const editorTitle = "Blueshift Learning Environment";

  // Test requirements
  const requirements: TestRequirement[] = [
    {
      status: "incomplete",
      instructionKey: "test_1",
      title: "Test 1",
    },
  ];

  // Test verification data received from the backend
  const verificationData = {
    success: true,
    results: [
      {
        success: true,
        instruction: "test_1",
        compute_units_consumed: 1000,
        execution_time: 200,
        program_logs: ["Program log 1", "Program log 2"],
      },
    ],
  };

  // Used to indicate if there is some kind of error in the verification process
  const verificationError = null;
  // Indicate if the verification is in progress
  // TODO rename this to isVerifying
  const isVerificationLoading = false;

  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.4, ease: anticipate },
      }}
      layoutId="ide-container"
      exit={{ opacity: 0 }}
      className={classNames(
        "py-4 max-w-app grid grid-cols-1 mx-auto w-full gap-y-12 min-h-[400px]",
        ideView === "expanded" &&
          "left-1/2 -translate-x-1/2 fixed !max-w-[90dvw] !bottom-0 !min-h-[300px] !py-0 backdrop-blur-xl z-50"
      )}
    >
      <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border">
        <div className="flex flex-col relative w-full h-full">
          <div className="w-full py-2.5 h-[36px] flex-shrink-0 z-30 relative px-4 bg-background-card rounded-t-xl flex items-center border-b border-border">
            <div className="flex items-center gap-x-2">
              <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
              <button
                className={classNames(
                  "w-[12px] h-[12px] bg-background-card-foreground rounded-full flex items-center justify-center group/minimize",
                  ideView === "expanded" && "!bg-[#FFBD2D]"
                )}
                onClick={() => setIdeView("minified")}
              >
                <Icon
                  className={classNames(
                    "opacity-0 transition-opacity duration-100",
                    ideView === "expanded" && "group-hover/minimize:opacity-100"
                  )}
                  name="Minimize"
                  size={8}
                />
              </button>
              <button
                className={classNames(
                  "w-[12px] h-[12px] bg-background-card-foreground rounded-full flex items-center justify-center group/expand",
                  ideView === "minified" && "!bg-[#28C840]"
                )}
                onClick={() => setIdeView("expanded")}
              >
                <Icon
                  className={classNames(
                    "opacity-0 transition-opacity duration-100",
                    ideView === "minified" && "group-hover/expand:opacity-100"
                  )}
                  name="Expand"
                  size={8}
                />
              </button>
            </div>
            <div className="text-sm font-medium text-secondary absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1.5">
              <Icon name="Challenge" size={12} className="hidden sm:block" />
              <span className="flex-shrink-0">{editorTitle}</span>
            </div>
          </div>
          <div className="w-[calc(100%-2px)] py-2 bg-background-card/20 backdrop-blur-xl border-b border-border z-20 justify-between px-4 flex items-center">
            <LogoGlyph width={16} />
            <div className="flex items-center gap-x-2.5">
              {!isPanelOpen ? (
                <>
                  <Button
                    variant="link"
                    icon={"Play"}
                    iconSize={12}
                    size="sm"
                    label={
                      isCodeRunning
                        ? t("ChallengePage.running_program_btn")
                        : t("ChallengePage.run_program_btn")
                    }
                    className="w-max !text-brand-primary"
                    disabled={isVerificationLoading}
                    onClick={() => setIsPanelOpen(true)}
                  />
                  <Button
                    variant="link"
                    size="sm"
                    label={t("ChallengePage.view_logs_btn")}
                    className="w-max"
                    onClick={() => setIsPanelOpen(true)}
                  />
                </>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  label={t("ChallengePage.back_to_editor_btn")}
                  className="w-max"
                  onClick={() => setIsPanelOpen(false)}
                />
              )}
            </div>
          </div>
          <BlueshiftEditor
            initialCode={initialCode}
            onCodeChange={handleCodeUpdate}
          />
          {/* TODO: Extract execution logs and execution components out of Right Panel */}
          {/* <RightPanel
            isPanelOpen={isPanelOpen}
            onRunCodeClick={() => console.log("execute pressed")}
            requirements={requirements}
            course={course}
            isLoading={isVerificationLoading}
            error={verificationError}
            verificationData={verificationData}
            isCodeRunning={isCodeRunning}
            runnerLogs={runnerLogs}
            isEsbuildReady={esBuildInitializationState === "initialized"}
          /> */}
        </div>
      </div>
    </motion.div>
  );
}
