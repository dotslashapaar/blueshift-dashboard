"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as esbuild from "esbuild-wasm";

export type EsbuildInitializationState =
  | "uninitialized"
  | "initializing"
  | "initialized"
  | "error";

interface EsbuildContextType {
  esbuild: typeof esbuild;
  esBuildInitializationState: EsbuildInitializationState;
  esbuildInitializationError: string | null;
}

interface EsbuildProviderProps {
  children: ReactNode;
  wasmURL?: string; // Optional URL for the WASM file
}

const EsbuildContext = createContext<EsbuildContextType | undefined>(undefined);

let esbuildInitialized = false;

export const EsbuildProvider = ({
  children,
  wasmURL = "/esbuild.wasm",
}: EsbuildProviderProps) => {
  const [initState, setInitState] =
    useState<EsbuildInitializationState>("uninitialized");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (esbuildInitialized) return;
    esbuildInitialized = true;

    console.log(
      "[EsbuildProvider] Attempting to initialize esbuild (should see this only once)...",
    );

    esbuild
      .initialize({ wasmURL, worker: true })
      .then(() => {
        setInitState("initialized");
        setError(null);

        console.debug("[EsbuildProvider] esbuild initialized successfully.");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setInitState("error");
        console.error("[EsbuildProvider] Failed to initialize esbuild:", e);
      });
  }, [wasmURL]);

  return (
    <EsbuildContext.Provider
      value={{
        esbuild,
        esBuildInitializationState: initState,
        esbuildInitializationError: error,
      }}
    >
      {children}
    </EsbuildContext.Provider>
  );
};

export const useEsbuild = (): EsbuildContextType => {
  const context = useContext(EsbuildContext);
  if (context === undefined) {
    throw new Error("useEsbuild must be used within an EsbuildProvider");
  }
  return context;
};
