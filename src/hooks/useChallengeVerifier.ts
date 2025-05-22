import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseMetadata } from "@/app/utils/course";
import { usePersistentStore } from "@/stores/store";
import { Certificate, TestResult } from "@/lib/challenges/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

// --- Consolidated Types ---

export interface VerificationApiResponse {
  success: boolean;
  results: TestResult[];
  certificate?: Certificate;
}

export interface ChallengeRequirement {
  status: "passed" | "failed" | "incomplete";
  instructionKey: string;
}

// --- Hook Definition ---

interface useChallengeVerifierOptions {
  course: CourseMetadata;
}

interface UseChallengeVerifierReturn {
  verificationData: VerificationApiResponse | null;
  isLoading: boolean;
  error: string | null;
  uploadProgram: () => void;
  uploadTransaction: (base64EncodedTx: string) => Promise<void>;
  requirements: ChallengeRequirement[];
  setRequirements: React.Dispatch<React.SetStateAction<ChallengeRequirement[]>>;
  initialRequirements: ChallengeRequirement[];
  setVerificationData: React.Dispatch<
    React.SetStateAction<VerificationApiResponse | null>
  >;
  completedRequirementsCount: number;
  allIncomplete: boolean;
}

export function useChallengeVerifier({
  course,
}: useChallengeVerifierOptions): UseChallengeVerifierReturn {
  const [verificationData, setVerificationData] =
    useState<VerificationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const verificationEndpoint = `${apiBaseUrl}${course.challenge.apiPath}`;

  const initialRequirements = course.challenge.requirements.map((req) => ({
    ...req,
    status: "incomplete" as const,
  }));

  const [requirements, setRequirements] =
    useState<ChallengeRequirement[]>(initialRequirements);

  const { authToken, setCertificate } = usePersistentStore();

  useEffect(() => {
    if (verificationData) {
      setRequirements(
        course.challenge.requirements.map((req): ChallengeRequirement => {
          const result = verificationData?.results?.find(
            (res) => res.instruction === req.instructionKey,
          );
          if (result) {
            return { ...req, status: result.success ? "passed" : "failed" };
          } else {
            // If no result for a requirement, but we have verification data,
            // it implies it wasn't part of this verification run or something else.
            // Keep its existing status or mark as incomplete if it was reset.
            // For simplicity now, let's find its current status or default to incomplete.
            const currentReq = requirements.find(
              (r) => r.instructionKey === req.instructionKey,
            );
            return { ...req, status: currentReq?.status || "incomplete" };
          }
        }),
      );
    }
  }, [verificationData, course.challenge.requirements] /* need to keep requirements out of this for now */);

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
          ...(authToken && {
            headers: {
              ...headers,
              Authorization: `Bearer ${authToken}`,
            },
          }),
        });

        if (response.ok) {
          const result: VerificationApiResponse = await response.json();
          setVerificationData(result);

          if (!result.success) {
            console.warn("Verification API reported failure:", result);
            return;
          }

          if (!result.certificate) {
            console.error("No certificate received in response.");
            setError("No certificate received.");
            return
          }

          // setCertificate(course.slug, result.certificate);
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
    [verificationEndpoint, authToken, setCertificate, course],
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
    setRequirements,
    initialRequirements,
    setVerificationData,
    completedRequirementsCount,
    allIncomplete,
  };
}
