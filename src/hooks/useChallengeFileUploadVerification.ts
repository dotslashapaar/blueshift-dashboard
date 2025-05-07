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

interface UseChallengeFileUploadVerificationOptions {
  verificationEndpoint: string;
  challenge: challengeMetadata;
}

interface UseChallengeFileUploadVerificationReturn {
  verificationData: VerificationApiResponse | null;
  isLoading: boolean;
  error: string | null;
  triggerUpload: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
}

/**
 * Custom hook to handle file upload, verification API calls, and challenge requirement processing.
 * @param options - Configuration options including the verification endpoint and challenge metadata.
 * @returns State variables, upload trigger function, and processed requirement status.
 */
export function useChallengeFileUploadVerification({
  verificationEndpoint,
  challenge,
}: UseChallengeFileUploadVerificationOptions): UseChallengeFileUploadVerificationReturn {
  // --- State from useFileUploadVerification ---
  const [verificationData, setVerificationData] =
    useState<VerificationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- triggerUpload logic from useFileUploadVerification ---
  const triggerUpload = useCallback(() => {
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

        setIsLoading(true);
        setError(null);
        setVerificationData(null); // Reset data before new upload

        try {
          const response = await fetch(verificationEndpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result: VerificationApiResponse = await response.json();
            console.log("Verification successful:", result);
            setVerificationData(result);
            if (!result.success) {
              console.warn("Verification API reported failure:", result);
            }
          } else {
            console.error("Verification request failed:", response.statusText);
            setError(`Verification failed: ${response.statusText}`);
            setVerificationData(null);
          }
        } catch (err) {
          console.error("Error verifying file:", err);
          setError(
            err instanceof Error ? err.message : "An unknown error occurred."
          );
          setVerificationData(null);
        } finally {
          setIsLoading(false);
          document.body.removeChild(input);
        }
      } else {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [verificationEndpoint]);

  const requirements = useMemo(() => {
    return challenge.requirements.map((req): ChallengeRequirement => {
      const result = verificationData?.results?.find(
        (res) => res.instruction === req.instructionKey
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
    triggerUpload,
    requirements,
    completedRequirementsCount,
    allIncomplete,
  };
}
