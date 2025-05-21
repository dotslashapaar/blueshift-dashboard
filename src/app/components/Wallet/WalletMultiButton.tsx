import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "../Button/Button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import DecryptedText from "../HeadingReveal/DecryptText";

export default function WalletMultiButton() {
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const {
    connected,
    connecting,
    disconnect,
    disconnecting,
    publicKey,
    wallet,
  } = useWallet();

  const handleClick = useCallback(() => {
    if (connected) {
      return disconnect();
    } else {
      setWalletModalVisible(true);
    }
  }, [connected, disconnect, setWalletModalVisible]);

  const getButtonLabel = () => {
    if (connected && publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 4) + ".." + base58.slice(-4);
    }
    if (disconnecting) {
      return "Disconnecting";
    }
    if (wallet) {
      return "Connect";
    }
    return "Connect Wallet";
  };

  const buttonLabel = getButtonLabel();

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative"
    >
      <Button
        disabled={connecting || disconnecting}
        label={buttonLabel}
        icon="Wallet"
        variant="primary"
        onClick={handleClick}
      />
      {connected && isHovering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-sm rounded-xl">
          <span className="font-mono text-[15px] font-medium leading-none text-white">
            <DecryptedText isHovering={isHovering} text="Disconnect" />
          </span>
        </div>
      )}
    </div>
  );
}
