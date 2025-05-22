import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID: PublicKey = new PublicKey("shftxrF75jt6u1nXCkkiarjwz4ENqm1tnummZZuBrDp")

export function findUnitPda(name: string, programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("unit", "utf8"),
      Buffer.from(name, "utf8"),
    ],
    programId
  )[0]
}
