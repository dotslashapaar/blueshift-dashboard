"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { usePersistentStore } from "@/stores/store";

export interface AuthState {
  loading: boolean;
  error: Error | null;
  status: "loading" | "signing-in" | "signed-in" | "signing-out" | "signed-out";
}

interface AuthResponse {
  token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function prepareSignInMessage(pubkey: string) {
  const timestampInMillisecs = Date.now();
  const timestamp = Math.floor(timestampInMillisecs / 1000) * 1000;
  const message = `Welcome to Blueshift. Please sign with your Solana wallet to prove you own this account: ${pubkey}\n\nTimestamp: ${timestamp}`;
  return { pubkey, timestamp, message };
}

export function useAuth() {
  const { publicKey, signMessage, disconnect, connected, connecting } = useWallet();
  const { setVisible: setModalVisible, visible: isModalVisible } = useWalletModal();
  const { authToken, setAuthToken, clearAuthToken } = usePersistentStore();

  const [authState, setAuthState] = useState<AuthState>({
    loading: false,
    error: null,
    status: "signed-out",
  });

  const _performSignInSequence = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setAuthState({
        loading: false,
        error: new Error("Wallet not ready for signing: publicKey or signMessage missing."),
        status: "signed-out",
      });
      return;
    }

    // Ensure status reflects the current operation, even if re-entrant or called from different paths
    setAuthState(prev => ({ ...prev, loading: true, error: null, status: "signing-in" }));

    try {
      const { pubkey, timestamp, message } = prepareSignInMessage(publicKey.toBase58());
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const serializedSignature = bs58.encode(signature);

      const response = await fetch(`${API_BASE_URL}/v1/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pubkey: pubkey,
          timestamp,
          signature: serializedSignature,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Failed to read error response body.");
        throw new Error(
          `Authentication API request failed with status ${response.status}: ${errorBody || response.statusText}`
        );
      }
      const data: AuthResponse = await response.json();
      setAuthToken(data.token);
    } catch (err) {
      console.error("Error during sign-in sequence:", err);
      setAuthState({
        loading: false,
        status: "signed-out",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [publicKey, signMessage, API_BASE_URL, setAuthToken, setAuthState]);

  const login = useCallback(async () => {
    if (connected && publicKey && signMessage) {
      // Wallet is already connected and ready, perform sign-in sequence directly.
      await _performSignInSequence();
    } else if (!connecting) {
      // Not connected and not currently attempting to connect:
      // Set status to "signing-in" to indicate intent, then open the modal.
      // The useEffect hook will handle calling _performSignInSequence once connected.
      setAuthState({ loading: true, error: null, status: "signing-in" });
      setModalVisible(true);
    } else if (connecting) {
      // Currently attempting to connect (e.g., auto-connect or previous modal interaction):
      // Set status to "signing-in". The useEffect will handle it once connection completes.
      setAuthState({ loading: true, error: null, status: "signing-in" });
    } else {
      // Fallback for any other unusual states.
      setAuthState({
        loading: false,
        error: new Error("Cannot initiate login: wallet state is not conducive to signing."),
        status: "signed-out",
      });
    }
  }, [
    connected,
    connecting,
    publicKey,
    signMessage,
    setModalVisible,
    _performSignInSequence,
    setAuthState,
  ]);

  // Effect to handle automatic sign-in when the wallet is connected and ready.
  useEffect(() => {
    if (authToken && connected && authState.status !== "signed-in") {
      setAuthState({ loading: false, error: null, status: "signed-in" });
    }
  }, [authToken, connected, authState]);

  // useEffect to handle signing after modal connection or if connection was pending.
  useEffect(() => {
    // This effect triggers if status is "signing-in" AND the wallet is connected and ready.
    // If login() called _performSignInSequence directly, the status would have already transitioned
    // from "signing-in" by the time _performSignInSequence completes, preventing a redundant call here.
    if (authState.status === "signing-in" && connected && publicKey && signMessage) {
      _performSignInSequence();
    }
  }, [authState.status, connected, publicKey, signMessage, _performSignInSequence]);

  // Effect to handle cancellation of sign-in (e.g. modal closed before connection)
  useEffect(() => {
    if (
      authState.status === "signing-in" &&
      !isModalVisible &&
      !connected &&
      !connecting
    ) {
      setAuthState({
        loading: false,
        error: null, // User cancelled, not necessarily an error
        status: "signed-out",
      });
    }
  }, [authState.status, isModalVisible, connected, connecting, setAuthState]);

  const logout = useCallback(async () => {
    setAuthState({
      loading: true,
      error: null,
      status: "signing-out",
    });
    try {
      clearAuthToken();
      // Wallet disconnect should be attempted regardless of its current state,
      // and errors during disconnect are caught.
      if (connected) {
         await disconnect();
      }
      setAuthState({
        loading: false,
        error: null,
        status: "signed-out",
      });
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
      // Even if disconnect fails, app state is signed-out.
      setAuthState({
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
        status: "signed-out",
      });
    }
  }, [clearAuthToken, disconnect, connected, setAuthState]);

  return { ...authState, login, logout, publicKey };
}
