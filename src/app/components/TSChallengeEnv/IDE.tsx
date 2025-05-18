"use client";

import { anticipate } from "motion";
import RightPanel from "@/app/components/TSChallengeEnv/RightPanel";
import BlueshiftEditor from "@/app/components/TSChallengeEnv/BlueshiftEditor";
import { motion } from "motion/react";
import { useEsbuildRunner } from "@/hooks/useEsbuildRunner";
import { TestRequirement } from "@/app/components/TSChallengeEnv/types/test-requirements";

interface IDEProps {
  initialCode: string;
  challengeTitle: string;
}

export default function IDE() {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.4, ease: anticipate },
      }}
      exit={{ opacity: 0 }}
      className="px-4 py-14 pb-20 max-w-app grid grid-cols-1 md:px-8 lg:px-14 mx-auto w-full gap-y-12 lg:gap-x-24"
    >
      <div className="flex flex-col relative w-full h-full">
        <div className="flex flex-col gap-y-12 w-full h-full min-h-[35dvh] lg:min-h-[65dvh]">
          <BlueshiftEditor
            initialCode={initialCode}
            onCodeChange={handleCodeUpdate}
            title={editorTitle}
          />
        </div>
        {/* TODO: Extract execution logs and execution components out of Right Panel */}
        {/*<RightPanel*/}
        {/*  onRunCodeClick={() => console.log("execute pressed")}*/}
        {/*  requirements={requirements}*/}
        {/*  isLoading={isVerificationLoading}*/}
        {/*  error={verificationError}*/}
        {/*  verificationData={verificationData}*/}
        {/*  isCodeRunning={isCodeRunning}*/}
        {/*  runnerLogs={runnerLogs}*/}
        {/*  isEsbuildReady={esBuildInitializationState === "initialized"}*/}
        {/*/>*/}
      </div>
    </motion.div>
  );
}
