"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createCdnPlugin } from "@/lib/challenges/esbuild-package-plugin";
import { useEsbuild } from "@/hooks/useEsbuild";

export interface LogMessage {
  type:
    | "LOG"
    | "ERROR"
    | "WARN"
    | "INFO"
    | "DEBUG"
    | "EXECUTION_ERROR"
    | "WORKER_ERROR"
    | "SYSTEM"
    | "VERIFICATION_ERROR";
  payload: any[];
  timestamp: Date;
}

export interface FetchDecision {
  decision: "PROCEED" | "MOCK_SUCCESS" | "MOCK_ERROR";
  responseData?: {
    body: any;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  };
  errorData?: {
    message: string;
  };
}

export interface InterceptedRpcCallOptions {
  method?: string;
  headers?: Record<string, string>;
}

export interface InterceptedRpcCallData {
  requestId: string;
  url: string;
  options: InterceptedRpcCallOptions;
  rpcMethod: string | null;
  body: any | null; // Parsed body
}

export interface UseEsbuildRunnerProps {
  onRpcCallInterceptedForDecision?: (
    rpcCallData: InterceptedRpcCallData,
  ) => Promise<FetchDecision>;
}

export function useEsbuildRunner(props?: UseEsbuildRunnerProps) {
  const {
    esbuild,
    initState: esBuildInitializationState,
    initError: esbuildInitializationError,
  } = useEsbuild();

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const addLog = useCallback((type: LogMessage["type"], ...payload: any[]) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { type, payload, timestamp: new Date() },
    ]);
  }, []);

  useEffect(() => {
    if (esBuildInitializationState === "initializing") {
      addLog("SYSTEM", "Build system initialization in progress...");
    } else if (esBuildInitializationState === "failed") {
      addLog(
        "SYSTEM",
        `Build system initialization failed: ${esbuildInitializationError?.message}`,
      );
    } else if (esBuildInitializationState === "initialized") {
      addLog("SYSTEM", "Build system is initialized.");
    }
  }, [esBuildInitializationState, esbuildInitializationError, addLog]);

  const runCode = useCallback(
    async (code: string) => {
      if (esBuildInitializationState === "uninitialized") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system is not initialized. Please wait.`,
        );
      } else if (esBuildInitializationState === "initializing") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system is still initializing. Please wait.`,
        );
      } else if (esBuildInitializationState === "failed") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system initialization error: ${esbuildInitializationError?.message}`,
        );
      }

      if (isRunning) {
        addLog(
          "SYSTEM",
          "Run attempt failed: Another process is already running.",
        );
        return;
      }

      setIsRunning(true);
      setLogs([]);
      setRunnerError(null);
      addLog("SYSTEM", "Starting code execution...");

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        addLog("SYSTEM", "Terminated existing worker.");
      }

      try {
        const mainHandlingSuffix = `
;(async () => {
  // Ensure all synchronous code in the user's script has had a chance to run
  // and define 'main'. This yields to a new macrotask.
  await new Promise(resolve => setTimeout(resolve, 0));

  let __runner_error__ = null;
  try {
    if (typeof main === 'function') {
      // If main is async, 'await' will handle the promise.
      // If main is sync, it executes, and 'await' on its (non-Promise) result is harmless.
      // Any error thrown by main (sync or async) will be caught by this try-catch.
      await main();
    }
    // If main is not a function, or not defined, this block does nothing with it.
    // The user's other synchronous code (if any) would have already run.
  } catch (e) {
    __runner_error__ = e;
  } finally {
    if (__runner_error__) {
      let errorMessageForMainThread;
      if (__runner_error__ instanceof Error) {
        errorMessageForMainThread = __runner_error__.stack || __runner_error__.message;
      } else {
        errorMessageForMainThread = String(__runner_error__);
      }
      self.postMessage({ type: 'EXECUTION_ERROR', payload: errorMessageForMainThread });
    }
    // Always send EXECUTION_COMPLETE after main (if it exists) has been dealt with.
    self.postMessage({ type: 'EXECUTION_COMPLETE' });
  }
})();
`;

        const result = await esbuild.build({
          entryPoints: ["entry.ts"],
          plugins: [
            {
              name: "custom-entry",
              setup(build) {
                build.onResolve({ filter: /^entry\.ts$/ }, (args) => ({
                  path: args.path,
                  namespace: "custom-entry-ns",
                }));
                build.onLoad(
                  { filter: /.*/, namespace: "custom-entry-ns" },
                  () => ({
                    contents: code + "\n" + mainHandlingSuffix, // User code + main handling logic
                    loader: "ts",
                  }),
                );
              },
            },
            createCdnPlugin("@solana/web3.js", "cdn-solana-web3-ns"),
            createCdnPlugin("@solana/spl-token", "cdn-spl-token-ns"),
            createCdnPlugin("bs58", "cdn-bs58-ns"),
          ],
          bundle: true,
          format: "iife",
          platform: "browser",
          define: {
            "process.env.SECRET": JSON.stringify(
              process.env.NEXT_PUBLIC_CHALLENGE_SECRET,
            ),
            "process.env.RPC_ENDPOINT": JSON.stringify(
              process.env.NEXT_PUBLIC_CHALLENGE_RPC_ENDPOINT,
            ),
            window: "self",
          },
        });

        if (result.outputFiles && result.outputFiles.length > 0) {
          const bundledCode = result.outputFiles[0].text;
          const fetchPatcher = `
// RPC_ENDPOINT should be globally available here due to esbuild 'define' on process.env.RPC_ENDPOINT
const rpcEndpointForWorker = typeof process !== 'undefined' && process.env && process.env.RPC_ENDPOINT 
  ? process.env.RPC_ENDPOINT 
  : 'https://api.devnet.solana.com'; // Fallback if define didn't work as expected for some reason

const originalFetch = self.fetch;
console.debug('[FetchPatcher] Original self.fetch stored. Targeting endpoint:', rpcEndpointForWorker);

let fetchRequestIdCounter = 0;
const pendingFetches = new Map();

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  if (type === 'FETCH_DECISION_RESPONSE') {
    const { requestId, decision, responseData, errorData } = payload;
    const pending = pendingFetches.get(requestId);
    if (pending) {
      pendingFetches.delete(requestId);
      if (decision === 'PROCEED') {
        console.debug('[FetchPatcher] Decision: PROCEED. Calling original fetch for requestId:', requestId);
        originalFetch.apply(self, pending.originalArgs)
          .then(pending.resolve)
          .catch(pending.reject);
      } else if (decision === 'MOCK_SUCCESS') {
        console.debug('[FetchPatcher] Decision: MOCK_SUCCESS for requestId:', requestId, responseData);
        const mockedResponse = new Response(responseData.body ? JSON.stringify(responseData.body) : null, {
          status: responseData.status || 200,
          statusText: responseData.statusText || 'OK',
          headers: new Headers(responseData.headers || {}),
        });
        pending.resolve(mockedResponse);
      } else if (decision === 'MOCK_ERROR') {
        console.warn('[FetchPatcher] Decision: MOCK_ERROR for requestId:', requestId, errorData);
        pending.reject(new Error(errorData?.message || 'Mocked fetch error'));
      } else {
        console.error('[FetchPatcher] Unknown decision for requestId:', requestId, decision);
        pending.reject(new Error('Unknown decision from main thread for fetch'));
      }
    } else {
      console.warn('[FetchPatcher] Received decision for unknown requestId:', requestId);
    }
  }
});

self.fetch = async function(...args) {
  const [url, options] = args;
  let rpcMethod = null;
  let requestBody = null; // Store the original body

  // Log every fetch call's URL
  console.debug('[Patched Fetch] Processing fetch call. URL:', url);

  if (typeof url === 'string' && url === rpcEndpointForWorker) {
    console.debug('[Patched Fetch] Intercepted call to RPC_ENDPOINT:', url);
    if (options && options.body && typeof options.body === 'string') {
      try {
        requestBody = JSON.parse(options.body); // Store parsed body
        if (requestBody && requestBody.method) {
          rpcMethod = requestBody.method;
          console.debug('[Patched Fetch] RPC Method for decision:', rpcMethod);
        }
      } catch (e) {
        console.warn('[Patched Fetch] Could not parse request body for decision:', e);
      }
    }

    const requestId = \`fetch-\${fetchRequestIdCounter++}\`;
    
    const serializableOptions = {
      method: options?.method,
      headers: {}
    };
    if (options && options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => { serializableOptions.headers[key] = value; });
      } else if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        serializableOptions.headers = options.headers;
      }
    }
    
    console.debug('[Patched Fetch] Posting INTERCEPTED_RPC_CALL_AWAIT_DECISION for requestId:', requestId);
    self.postMessage({
      type: 'INTERCEPTED_RPC_CALL_AWAIT_DECISION',
      payload: {
        requestId,
        url: url,
        options: serializableOptions,
        rpcMethod: rpcMethod,
        body: requestBody 
      }
    });

    return new Promise((resolve, reject) => {
      pendingFetches.set(requestId, { resolve, reject, originalArgs: args });
    });
  }

  // For non-intercepted calls
  const promise = originalFetch.apply(self, args);
  // Optional: keep logging for non-intercepted calls if desired
  if (typeof url === 'string' && url === rpcEndpointForWorker) { // This block might be redundant if already handled by interception
    return promise.then(async (response) => {
      console.debug('[Patched Fetch] Response from RPC_ENDPOINT for method ', rpcMethod, 'status:', response.status);
      const clonedResponse = response.clone();
      try {
        const responseBody = await clonedResponse.json();
        console.debug('[Patched Fetch] Response Body for method ', rpcMethod, ':', responseBody);
      } catch (e) {
        console.warn('[Patched Fetch] Could not parse response body for method ', rpcMethod, ':', e);
      }
      return response;
    }).catch(error => {
      console.error('[Patched Fetch] Error from RPC_ENDPOINT for method ', rpcMethod, ':', error);
      throw error;
    });
  }
  return promise;
};
console.debug('[FetchPatcher] self.fetch has been patched for RPC endpoint:', rpcEndpointForWorker);`;

          const codeToExecuteInWorker = `\n${fetchPatcher}\n${bundledCode}\n`; // EXECUTION_COMPLETE logic is now bundled

          const workerInstance = new Worker(
            new URL("@/lib/challenges/runner.worker.ts", import.meta.url),
            { type: "module" },
          );
          workerRef.current = workerInstance;

          workerInstance.onmessage = (event) => {
            const message = event.data as { type: string; payload: any };
            switch (message.type) {
              case "LOG":
                addLog(
                  "LOG",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "ERROR":
                addLog(
                  "ERROR",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "WARN":
                addLog(
                  "WARN",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "INFO":
                addLog(
                  "INFO",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "DEBUG":
                addLog(
                  "DEBUG",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "EXECUTION_ERROR":
                addLog("EXECUTION_ERROR", message.payload);
                setRunnerError(`Execution Error: ${message.payload}`);
                setIsRunning(false);
                if (workerRef.current) workerRef.current.terminate();
                break;
              case "WORKER_ERROR":
                addLog("WORKER_ERROR", message.payload);
                setRunnerError(`Worker Error: ${message.payload}`);
                setIsRunning(false);
                if (workerRef.current) workerRef.current.terminate();
                break;
              case "READY":
                addLog("SYSTEM", "Worker ready. Sending code...");
                workerInstance.postMessage(codeToExecuteInWorker);
                break;
              case "EXECUTION_COMPLETE":
                addLog("SYSTEM", "Execution complete.");
                setIsRunning(false);
                // Note: Worker termination is handled by main try-catch or useEffect cleanup
                break;
              case "INTERCEPTED_RPC_CALL_AWAIT_DECISION":
                const decisionPayload =
                  message.payload as InterceptedRpcCallData;
                console.debug(
                  "[FetchPatcher] Received INTERCEPTED_RPC_CALL_AWAIT_DECISION for requestId:",
                  {
                    method: decisionPayload.rpcMethod,
                    url: decisionPayload.url,
                  },
                );

                if (props?.onRpcCallInterceptedForDecision) {
                  props
                    .onRpcCallInterceptedForDecision(decisionPayload)
                    .then((decision) => {
                      if (workerRef.current) {
                        // Ensure worker is still active
                        workerRef.current.postMessage({
                          type: "FETCH_DECISION_RESPONSE",
                          payload: {
                            requestId: decisionPayload.requestId,
                            ...decision,
                          },
                        });
                      }
                    })
                    .catch((err) => {
                      console.error(
                        "Error in onRpcCallInterceptedForDecision callback:",
                        err,
                      );
                      if (workerRef.current) {
                        // Ensure worker is still active
                        workerRef.current.postMessage({
                          // Default to PROCEED on error
                          type: "FETCH_DECISION_RESPONSE",
                          payload: {
                            requestId: decisionPayload.requestId,
                            decision: "PROCEED",
                          },
                        });
                      }
                    });
                } else {
                  // No callback provided, default to proceed
                  if (workerRef.current) {
                    // Ensure worker is still active
                    workerRef.current.postMessage({
                      type: "FETCH_DECISION_RESPONSE",
                      payload: {
                        requestId: decisionPayload.requestId,
                        decision: "PROCEED",
                      },
                    });
                  }
                }
                break;
              // The old INTERCEPTED_RPC_CALL case is removed as this new mechanism supersedes it.
              // If props?.onRpcCallIntercepted was used for pure logging, that can be adapted.
              // For now, the new 'addLog' above for INTERCEPTED_RPC_CALL_AWAIT_DECISION serves a similar logging purpose.
              default:
                addLog("SYSTEM", "Unknown message from worker:", message);
            }
          };

          workerInstance.onerror = (event) => {
            console.error("Worker uncaught error:", event);
            setRunnerError(
              `An error occurred in the Web Worker: ${event.message}`,
            );
            addLog("SYSTEM", `Worker uncaught error: ${event.message}`);
            setIsRunning(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
          };
        } else {
          setRunnerError("ESBuild did not produce any output files.");
          addLog("SYSTEM", "ESBuild failed to produce output.");
          setIsRunning(false);
        }
      } catch (e) {
        console.error("Error during build or run:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setRunnerError(`Build or Run Error: ${errorMessage}`);
        addLog("SYSTEM", `Build or Run Error: ${errorMessage}`);
        setIsRunning(false);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    },
    [
      esBuildInitializationState,
      esbuildInitializationError,
      isRunning,
      addLog,
      props,
    ],
  );

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    esBuildInitializationState,
    esbuildInitializationError,
    isRunning,
    logs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs: () => setLogs([]),
  };
}
