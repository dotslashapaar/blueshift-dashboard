import { useState, useCallback, useMemo } from "react";
import { challengeMetadata } from "@/app/utils/course";

// --- Consolidated Types ---

interface VerificationResult {
  success: boolean;
  instruction: string;
  compute_units_consumed?: number;
  execution_time?: number;
  program_logs?: string[];
  message?: string;
}

export interface VerificationApiResponse {
  success: boolean;
  results: VerificationResult[];
  certificate?: {
    pubkey: string;
    signature: string;
    message: string;
  };
}

export interface ChallengeRequirement {
  status: "passed" | "failed" | "incomplete";
  instructionKey: string;
}

// --- Hook Definition ---

interface useChallengeVerifierOptions {
  verificationEndpoint: string;
  challenge: challengeMetadata;
}

interface UseChallengeVerifierReturn {
  verificationData: VerificationApiResponse | null;
  isLoading: boolean;
  error: string | null;
  uploadProgram: () => void;
  uploadTransaction: (base64EncodedTx: string) => Promise<void>;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
}

export function useChallengeVerifier({
  verificationEndpoint,
  challenge,
}: useChallengeVerifierOptions): UseChallengeVerifierReturn {
  const [verificationData, setVerificationData] =
    useState<VerificationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerificationRequest = useCallback(
    async (body: FormData | string, headers?: HeadersInit) => {
      setIsLoading(true);
      setError(null);
      setVerificationData(null);

      try {
        const response = await fetch(verificationEndpoint, {
          method: "POST",
          body: body,
          ...(headers && { headers }),
        });

        if (response.ok) {
          const result: VerificationApiResponse = await response.json();
          console.log("Verification successful:", result);
          setVerificationData(result);
          if (!result.success) {
            console.warn("Verification API reported failure:", result);
          }
        } else {
          const errorText = await response.text();
          console.error(
            "Verification request failed:",
            response.statusText,
            errorText,
          );
          setError(
            `Verification failed: ${response.statusText} - ${errorText}`,
          );
          setVerificationData(null);
        }
      } catch (err) {
        console.error("Error verifying:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setVerificationData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [verificationEndpoint],
  );

  const uploadProgram = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".so"; // Or specify accepted file types
    input.style.display = "none";

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        console.log("Selected file:", file.name);
        console.log("Sending verification request to:", verificationEndpoint);
        const formData = new FormData();
        formData.append("program", file); // "program" is the field name expected by the server
        await handleVerificationRequest(formData);
        document.body.removeChild(input);
      } else {
        document.body.removeChild(input); // Ensure removal even if no file selected
      }
    };

    document.body.appendChild(input);
    input.click();
    // No need to removeChild here immediately, it's handled in onchange or if dialog is cancelled
  }, [verificationEndpoint, handleVerificationRequest]);

  const uploadTransaction = useCallback(
    async (base64EncodedTx: string) => {
      if (!verificationEndpoint) {
        console.error("Verification endpoint is not configured.");
        setError("Verification endpoint is not configured.");
        return;
      }
      console.log(
        "Sending transaction verification request to:",
        verificationEndpoint,
      );
      await handleVerificationRequest(
        JSON.stringify({ transaction: base64EncodedTx }),
        { "Content-Type": "application/json" },
      );
    },
    [verificationEndpoint, handleVerificationRequest],
  );

  const requirements = useMemo(() => {
    return challenge.requirements.map((req): ChallengeRequirement => {
      const result = verificationData?.results?.find(
        (res) => res.instruction === req.instructionKey,
      );
      if (result) {
        return { ...req, status: result.success ? "passed" : "failed" };
      } else {
        return { ...req, status: "incomplete" };
      }
    });
  }, [challenge.requirements, verificationData]);

  const completedRequirementsCount = useMemo(() => {
    return requirements.filter((requirement) => requirement.status === "passed")
      .length;
  }, [requirements]);

  const allIncomplete = useMemo(() => {
    // Check if verificationData is null (initial state) OR if all requirements are 'incomplete'
    return (
      !verificationData ||
      requirements.every((requirement) => requirement.status === "incomplete")
    );
  }, [requirements, verificationData]);

  // --- Return combined state and functions ---
  return {
    verificationData,
    isLoading,
    error,
    uploadProgram,
    uploadTransaction,
    requirements,
    completedRequirementsCount,
    allIncomplete,
  };
}
