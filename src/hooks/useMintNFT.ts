import useMinter from "@/hooks/useMinter";
import { usePersistentStore } from "@/stores/store";
import { findUnitPda } from "@/lib/nft/sdk";
import { CourseMetadata } from "@/app/utils/course";
import { useCallback, useState } from "react";

export default function useMintNFT() {
  const { program: minter, error: minterError } = useMinter();
  const { certificates, setCourseStatus } = usePersistentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mint = useCallback(async (course: CourseMetadata) => {
    setIsLoading(true);
    setError(null);

    try {
      if (minterError) {
        throw new Error(`Minter setup failed: ${minterError.message}`);
      }

      if (!minter) {
        throw new Error("Minter is not available (possibly due to wallet not being connected or a setup issue).");
      }

      const unit = findUnitPda(course.unitName);
      const user = minter.provider.wallet?.publicKey;
      const certificate = certificates[course.slug];

      if (!certificate) {
        throw new Error(`Certificate not found for course: ${course.slug}`);
      }

      if (!user) {
        throw new Error("User public key is not available. Please connect your wallet.");
      }

      const signature = Buffer.from(certificate.signature, "hex");

      const tx = await minter.methods
      .mintCredential(signature)
      .accounts({ unit })
      .rpc({
        commitment: "processed",
        skipPreflight: true
      });

      setIsLoading(false);
      setCourseStatus(course.slug, "Claimed");

      return tx;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("Error minting NFT:", err.message, err);
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, [minter, certificates, minterError]);

  return { mint, isLoading, error };
}
