"use client";

import { ReactNode, useEffect, useState } from "react";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import ClientChallengeTable from "./ClientChallengeTable";
import { motion } from "motion/react";
import { anticipate } from "motion";
import {
  useEsbuildRunner,
  FetchDecision,
  InterceptedRpcCallData,
  InterceptedWsSendData,
  WsSendDecision,
  InterceptedWsReceiveData,
  WsReceiveDecision,
} from "@/hooks/useEsbuildRunner";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import BlueshiftEditor from "@/app/components/TSChallengeEnv/BlueshiftEditor";
import LogoGlyph from "../Logo/LogoGlyph";
import { useAuth } from "@/hooks/useAuth";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { ChallengeMetadata } from "@/app/utils/challenges";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

interface ChallengesContentProps {
  currentChallenge: ChallengeMetadata;
  content: ReactNode;
}

export default function ChallengesContent({
  currentChallenge,
}: ChallengesContentProps) {
  const auth = useAuth();
  const isUserConnected = auth.status === "signed-in";
  const t = useTranslations();

  const [editorCode, setEditorCode] = useState<string>("");
  const [wasSendTransactionIntercepted, setWasSendTransactionIntercepted] =
    useState(false);
  const [
    verificationFailureMessageLogged,
    setVerificationFailureMessageLogged,
  ] = useState(false);

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

    console.debug(
      `RPC call (${rpcData.rpcMethod}) to ${rpcData.url} will proceed.`
    );

    // For all other calls, or if rpcMethod is null, proceed as normal
    return { decision: "PROCEED" };
  };

  const handleWsSendForDecision = async (
    wsSendData: InterceptedWsSendData
  ): Promise<WsSendDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted WebSocket Send, Awaiting Decision:",
      wsSendData
    );

    const targetHost = new URL(rpcEndpoint!).host;

    if (wsSendData.url.includes(targetHost)) {
      if (
        typeof wsSendData.data === "string" &&
        wsSendData.data.includes("signatureSubscribe")
      ) {
        console.log(
          "[ClientChallengesContent] Intercepted WebSocket send for signatureSubscribe"
        );

        const data = JSON.parse(wsSendData.data);

        // random subscription id as integer
        const subscriptionId = Math.floor(Math.random() * 1000000);
        // random slot number as integer
        const slot = Math.floor(Math.random() * 1000000);

        const subscriptionConfirmation = {
          jsonrpc: "2.0",
          result: subscriptionId,
          id: data.id,
        };

        const signatureNotification = {
          jsonrpc: "2.0",
          method: "signatureNotification",
          params: {
            result: {
              context: {
                slot: slot,
              },
              value: {
                err: null,
              },
            },
            subscription: subscriptionId,
          },
        };

        return {
          decision: "BLOCK",
          mockedReceives: [
            JSON.stringify(subscriptionConfirmation),
            JSON.stringify(signatureNotification),
          ],
        };
      }
    }

    console.log(
      "[ClientChallengesContent] WebSocket send allowed to PROCEED:",
      wsSendData
    );
    return { decision: "PROCEED" };
  };

  const handleWsReceiveForDecision = async (
    wsReceiveData: InterceptedWsReceiveData
  ): Promise<WsReceiveDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted WebSocket Receive, Awaiting Decision:",
      wsReceiveData
    );

    return { decision: "PROCEED" };
  };

  const {
    esBuildInitializationState,
    isRunning: isCodeRunning,
    logs: runnerLogs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs,
  } = useEsbuildRunner({
    onRpcCallInterceptedForDecision: handleRpcCallForDecision,
    onWsSendInterceptedForDecision: handleWsSendForDecision,
    onWsReceiveInterceptedForDecision: handleWsReceiveForDecision,
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
        const codeModule = await import(
          `@/app/content/challenges/${currentChallenge.slug}/challenge.ts.template?raw`
        );
        const template = codeModule.default;

        // const template = "console.log('Hello, World!');"; // Placeholder for the actual template code

        setEditorCode(template);
      } catch (err) {
        console.error("Failed to load challenge template:", err);
        setEditorCode(
          "// Failed to load challenge template. Please check console."
        );
      }
    };

    if (currentChallenge.slug) {
      fetchSolutionsTemplate();
    }
  }, [currentChallenge.slug]);

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

  const {
    isLoading: isVerificationLoading,
    error: verificationHookError,
    uploadTransaction,
    requirements,
    completedRequirementsCount,
    allIncomplete: allIncompleteVerification,
    verificationData,
    setRequirements,
    initialRequirements,
    setVerificationData,
  } = useChallengeVerifier({ challenge: currentChallenge });

  const handleRunCode = () => {
    if (esBuildInitializationState !== "initialized") {
      // TODO Consider using a toast notification or inline message instead of alert
      alert("Code runner is not ready yet. Please wait a moment.");
      return;
    }
    clearLogs();
    setWasSendTransactionIntercepted(false);
    setVerificationFailureMessageLogged(false);

    // The verifier might be called after execution or based on editorCode directly
    // For now, just run the code. Verification logic will use `verificationData`
    runCode(editorCode).catch(console.error);
  };

  const handleRedoChallenge = () => {
    setVerificationData(null);
    setRequirements(initialRequirements);
    clearLogs();
  };

  return (
    <div className="relative w-full h-full">
      {!isUserConnected ? (
        <div className="z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col gap-y-4 mt-24 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="text-center text-lg sm:text-xl font-medium leading-none">
              {t("ChallengePage.connect_wallet")}
            </div>
            <div className="text-center text-secondary mx-auto sm:w-2/3 w-full">
              {t("ChallengePage.connect_wallet_description")}
            </div>
          </div>
          <WalletMultiButton
            status={auth.status}
            address={auth.publicKey?.toBase58()}
            onSignIn={auth.login}
            onSignOut={auth.logout}
          />
        </div>
      ) : (
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
            <div className="flex flex-col w-full h-full min-h-[35dvh] lg:min-h-[65dvh]">
              <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border">
                <div className="z-10 w-full py-3 relative px-4 bg-background-card rounded-t-xl flex items-center border-b border-border">
                  <div className="flex items-center gap-x-2">
                    <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
                    <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
                    <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-secondary absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1.5">
                    <Icon
                      name="Challenge"
                      size={12}
                      className="hidden sm:block"
                    />
                    <span className="flex-shrink-0">
                      {t(`challenges.${currentChallenge.slug}.title`)}
                    </span>
                  </div>
                </div>
                <div className="left-[1px] w-[calc(100%-2px)] py-2 bg-background-card/20 backdrop-blur-xl border-b border-border z-20 justify-between px-4 flex items-center">
                  <LogoGlyph width={16} />
                  <div className="flex items-center gap-x-2.5">
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
                        onClick={() => {
                          handleRunCode();
                        }}
                        disabled={isVerificationLoading}
                      />
                    </>
                  </div>
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-3 w-full h-full">
                  <BlueshiftEditor
                    initialCode={editorCode}
                    onCodeChange={setEditorCode}
                    className="col-span-2"
                    title={t(`challenges.${currentChallenge.slug}.title`)}
                  />
                  <ClientChallengeTable
                    onRunCodeClick={handleRunCode}
                    requirements={requirements}
                    completedRequirementsCount={completedRequirementsCount}
                    allIncomplete={allIncompleteVerification}
                    isLoading={isVerificationLoading}
                    error={verificationHookError}
                    verificationData={verificationData}
                    challenge={currentChallenge}
                    isCodeRunning={isCodeRunning}
                    runnerLogs={runnerLogs}
                    isEsbuildReady={
                      esBuildInitializationState === "initialized"
                    }
                    onRedoChallenge={handleRedoChallenge}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
