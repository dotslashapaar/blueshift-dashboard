"use client";

import { useEffect, useState } from "react";
import { usePersistentStore } from "@/stores/store";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import { CourseMetadata } from "@/app/utils/course";
import ClientChallengeTable from "./ClientChallengeTable";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { anticipate } from "motion";
import ClientChallengeRequirements from "./ClientChallengeRequirements";
import {
  useEsbuildRunner,
  FetchDecision,
  InterceptedRpcCallData,
} from "@/hooks/useEsbuildRunner";
import { useCurrentLessonSlug } from "@/hooks/useCurrentLessonSlug";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function ChallengesContent({
  currentCourse,
}: {
  currentCourse: CourseMetadata;
}) {
  const [isUserConnected] = useState(true);
  const { courseProgress } = usePersistentStore();
  const t = useTranslations();
  const isCourseCompleted =
    courseProgress[currentCourse.slug] === currentCourse.lessons.length;
  const lastLessonSlug = useCurrentLessonSlug(currentCourse);
  const challenge = currentCourse.challenge;

  const [editorCode, setEditorCode] = useState<string>("");
  const [wasSendTransactionIntercepted, setWasSendTransactionIntercepted] =
    useState(false);
  const [
    verificationFailureMessageLogged,
    setVerificationFailureMessageLogged,
  ] = useState(false);

  // Example: Intercept 'sendTransaction' and mock its response
  const handleRpcCallForDecision = async (
    rpcData: InterceptedRpcCallData
  ): Promise<FetchDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted RPC Call, Awaiting Decision:",
      rpcData
    );

    if (rpcData.rpcMethod === "sendTransaction") {
      setWasSendTransactionIntercepted(true); // Keep this if useful for UI feedback
      const base64EncodedTx = rpcData.body?.params?.[0];

      if (uploadTransaction && base64EncodedTx) {
        // We can still call uploadTransaction for verification purposes,
        // even if we are about to mock the client-side response.
        // The verifier might operate independently of the client's view of the transaction result.
        console.log(
          "[ClientChallengesContent] Uploading transaction for verification before mocking response."
        );
        // Not awaiting this intentionally, as we want to return the decision quickly.
        // The verification can happen in the background.
        uploadTransaction(base64EncodedTx).catch((err) => {
          console.error(
            "[ClientChallengesContent] Error uploading transaction during mock decision:",
            err
          );
        });
      }

      const tx = Transaction.from(Buffer.from(base64EncodedTx, "base64"));
      const mockSignature = bs58.encode(tx?.signature ?? []);

      console.debug(
        `[ClientChallengesContent] Mocking successful response for sendTransaction. Signature: ${mockSignature}`
      );

      return {
        decision: "MOCK_SUCCESS",
        responseData: {
          body: {
            jsonrpc: "2.0",
            result: mockSignature, // The fake transaction signature
            id: rpcData.body?.id || "mocked-id", // Try to use original id or a placeholder
          },
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        },
      };
    }
    /*
    else if (rpcData.rpcMethod === "getSignatureStatuses") {
      // If the intercepted call is for getSignatureStatuses, we can mock a response
      // to indicate that the transaction was confirmed.
      const mockResponse = {
        jsonrpc: "2.0",
        result: {
          context: { slot: 123456 },
          value: [
            {
              "slot": 123456,
              "confirmations": 10,
              "err": null,
              "status": {
                "Ok": null
              },
              "confirmationStatus": "processed"
            },
            null

            // {
            //   confirmationStatus: "processed",
            //   err: null,
            //   slot: 123456,
            // },
          ],
        },
        id: rpcData.body?.id || "mocked-id",
      };

      console.debug(
        `[ClientChallengesContent] Mocking successful response for getSignatureStatuses.`,
      );

      return {
        decision: "MOCK_SUCCESS",
        responseData: {
          body: mockResponse,
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        },
      };
    }
     */

    console.debug(
      `RPC call (${rpcData.rpcMethod}) to ${rpcData.url} will proceed.`
    );

    // For all other calls, or if rpcMethod is null, proceed as normal
    return { decision: "PROCEED" };
  };

  const {
    esBuildInitializationState,
    isRunning: isCodeRunning,
    logs: runnerLogs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs: clearRunnerLogs,
  } = useEsbuildRunner({
    onRpcCallInterceptedForDecision: handleRpcCallForDecision,
  });

  useEffect(() => {
    if (!apiBaseUrl) {
      console.error(
        "API Base URL is not defined in the environment variables."
      );
    }
  }, []);

  useEffect(() => {
    const fetchSolutionsTemplate = async () => {
      try {
        // The dynamic import with ?raw needs to be handled correctly by the bundler.
        const codeModule = await import(
          `@/app/content/courses/${currentCourse.slug}/challenge.ts.template?raw`
        );
        const template = codeModule.default;
        setEditorCode(template);
      } catch (err) {
        console.error("Failed to load challenge template:", err);
        setEditorCode(
          "// Failed to load challenge template. Please check console."
        );
      }
    };

    if (currentCourse.slug) {
      fetchSolutionsTemplate();
    }
  }, [currentCourse.slug]);

  // Effect to check for missing sendTransaction after code execution
  useEffect(() => {
    // Check specifically when isCodeRunning transitions from true to false
    // and if there's a system log indicating successful completion.
    const executionCompletedLog = runnerLogs.find(
      (log) =>
        log.type === "SYSTEM" &&
        Array.isArray(log.payload) &&
        log.payload[0] === "Execution complete."
    );

    if (
      !isCodeRunning &&
      executionCompletedLog &&
      !runnerError &&
      !wasSendTransactionIntercepted &&
      !verificationFailureMessageLogged
    ) {
      const errorMessage = "No transaction was sent by the solution code.";
      addLog("VERIFICATION_ERROR", errorMessage);
      setVerificationFailureMessageLogged(true);
    }
  }, [
    isCodeRunning,
    runnerLogs,
    runnerError,
    wasSendTransactionIntercepted,
    verificationFailureMessageLogged,
    addLog,
  ]);

  const verificationEndpoint = challenge?.apiPath
    ? `${apiBaseUrl}${challenge.apiPath}`
    : "";

  const {
    isLoading: isVerificationLoading,
    error: verificationHookError,
    uploadTransaction,
    requirements,
    completedRequirementsCount,
    allIncomplete,
    verificationData,
  } = useChallengeVerifier({
    verificationEndpoint: verificationEndpoint,
    challenge: challenge!,
  });

  const handleRunCode = () => {
    if (esBuildInitializationState !== "initialized") {
      // TODO Consider using a toast notification or inline message instead of alert
      alert("Code runner is not ready yet. Please wait a moment.");
      return;
    }
    clearRunnerLogs();
    setWasSendTransactionIntercepted(false); // Reset flag before new run
    setVerificationFailureMessageLogged(false); // Reset verification failure flag
    runCode(editorCode).catch(console.error);
  };

  return (
    <div className="relative w-full h-full">
      {!isUserConnected ? (
        <div className="absolute z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col gap-y-4 sm:!-mt-24 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="text-center text-lg sm:text-xl font-medium leading-none">
              {t("challenges.connect_wallet")}
            </div>
            <div className="text-center text-secondary mx-auto sm:w-2/3 w-full">
              {t("challenges.connect_wallet_description")}
            </div>
          </div>
          <Button
            label="Connect wallet"
            variant="primary"
            size="lg"
            className="!w-[2/3]"
            icon="Wallet"
          />
        </div>
      ) : (
        <>
          <AnimatePresence>
            {!isCourseCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm"
              >
                <div className="flex flex-col gap-y-4 sm:!-mt-24 max-w-[90dvw]">
                  <div className="text-center justify-center text-lg sm:text-xl font-medium leading-none gap-x-2 items-center flex">
                    <Icon name="Locked" className="text-secondary" />
                    {t("challenges.locked")}
                  </div>
                  <div className="text-center text-secondary mx-auto w-full">
                    {t("challenges.locked_description")}
                  </div>
                </div>
                <Link href={`/courses/${currentCourse.slug}/${lastLessonSlug}`}>
                  <Button
                    label="Back to Course"
                    variant="primary"
                    size="lg"
                    className="!w-[2/3]"
                    icon="ArrowLeft"
                  />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          {challenge && (
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
                <ClientChallengeRequirements
                  course={currentCourse}
                  currentCode={editorCode}
                  onCodeChange={setEditorCode}
                />
                <ClientChallengeTable
                  onRunCodeClick={handleRunCode}
                  requirements={requirements}
                  completedRequirementsCount={completedRequirementsCount}
                  allIncomplete={allIncomplete}
                  isLoading={isVerificationLoading}
                  error={verificationHookError}
                  verificationData={verificationData}
                  courseSlug={currentCourse.slug}
                  isCodeRunning={isCodeRunning}
                  runnerLogs={runnerLogs}
                  isEsbuildReady={esBuildInitializationState === "initialized"}
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
