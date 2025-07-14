import { PublicKey, TransactionInstruction } from '@solana/web3.js';

/** Base class for errors */
declare class TokenMetadataError extends Error {
    constructor(message?: string);
}
/** Thrown if incorrect account provided */
declare class IncorrectAccountError extends TokenMetadataError {
    name: string;
}
/** Thrown if Mint has no mint authority */
declare class MintHasNoMintAuthorityError extends TokenMetadataError {
    name: string;
}
/** Thrown if Incorrect mint authority has signed the instruction */
declare class IncorrectMintAuthorityError extends TokenMetadataError {
    name: string;
}
/** Thrown if Incorrect mint authority has signed the instruction */
declare class IncorrectUpdateAuthorityError extends TokenMetadataError {
    name: string;
}
/** Thrown if Token metadata has no update authority */
declare class ImmutableMetadataError extends TokenMetadataError {
    name: string;
}
/** Thrown if Key not found in metadata account */
declare class KeyNotFoundError extends TokenMetadataError {
    name: string;
}

type TypedArrayMutableProperties = 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort';
interface ReadonlyUint8Array extends Omit<Uint8Array, TypedArrayMutableProperties> {
    readonly [n: number]: number;
}

/**
 * Defines an offset in bytes.
 */
type Offset = number;
type BaseEncoder<TFrom> = {
    /** Encode the provided value and return the encoded bytes directly. */
    readonly encode: (value: TFrom) => ReadonlyUint8Array;
    /**
     * Writes the encoded value into the provided byte array at the given offset.
     * Returns the offset of the next byte after the encoded value.
     */
    readonly write: (value: TFrom, bytes: Uint8Array, offset: Offset) => Offset;
};
type FixedSizeEncoder<TFrom, TSize extends number = number> = BaseEncoder<TFrom> & {
    /** The fixed size of the encoded value in bytes. */
    readonly fixedSize: TSize;
};
type VariableSizeEncoder<TFrom> = BaseEncoder<TFrom> & {
    /** The total size of the encoded value in bytes. */
    readonly getSizeFromValue: (value: TFrom) => number;
    /** The maximum size an encoded value can be in bytes, if applicable. */
    readonly maxSize?: number;
};
type BaseDecoder<TTo> = {
    /** Decodes the provided byte array at the given offset (or zero) and returns the value directly. */
    readonly decode: (bytes: ReadonlyUint8Array | Uint8Array, offset?: Offset) => TTo;
    /**
     * Reads the encoded value from the provided byte array at the given offset.
     * Returns the decoded value and the offset of the next byte after the encoded value.
     */
    readonly read: (bytes: ReadonlyUint8Array | Uint8Array, offset: Offset) => [TTo, Offset];
};
type FixedSizeDecoder<TTo, TSize extends number = number> = BaseDecoder<TTo> & {
    /** The fixed size of the encoded value in bytes. */
    readonly fixedSize: TSize;
};
type VariableSizeDecoder<TTo> = BaseDecoder<TTo> & {
    /** The maximum size an encoded value can be in bytes, if applicable. */
    readonly maxSize?: number;
};
type FixedSizeCodec<TFrom, TTo extends TFrom = TFrom, TSize extends number = number> = FixedSizeDecoder<TTo, TSize> & FixedSizeEncoder<TFrom, TSize>;
type VariableSizeCodec<TFrom, TTo extends TFrom = TFrom> = VariableSizeDecoder<TTo> & VariableSizeEncoder<TFrom>;

declare enum Field {
    Name = 0,
    Symbol = 1,
    Uri = 2
}
type FieldLayout = {
    __kind: 'Name';
} | {
    __kind: 'Symbol';
} | {
    __kind: 'Uri';
} | {
    __kind: 'Key';
    value: [string];
};
declare const getFieldCodec: () => readonly [readonly ["Name", FixedSizeCodec<void, void, 0>], readonly ["Symbol", FixedSizeCodec<void, void, 0>], readonly ["Uri", FixedSizeCodec<void, void, 0>], readonly ["Key", VariableSizeCodec<{
    value: readonly [string];
}, {
    value: readonly [string];
} & {
    value: readonly [string];
}>]];
declare function getFieldConfig(field: Field | string): FieldLayout;

/**
 * Initializes a TLV entry with the basic token-metadata fields.
 *
 * Assumes that the provided mint is an SPL token mint, that the metadata
 * account is allocated and assigned to the program, and that the metadata
 * account has enough lamports to cover the rent-exempt reserve.
 */
interface InitializeInstructionArgs {
    programId: PublicKey;
    metadata: PublicKey;
    updateAuthority: PublicKey;
    mint: PublicKey;
    mintAuthority: PublicKey;
    name: string;
    symbol: string;
    uri: string;
}
declare function createInitializeInstruction(args: InitializeInstructionArgs): TransactionInstruction;
/**
 * If the field does not exist on the account, it will be created.
 * If the field does exist, it will be overwritten.
 */
interface UpdateFieldInstruction {
    programId: PublicKey;
    metadata: PublicKey;
    updateAuthority: PublicKey;
    field: Field | string;
    value: string;
}
declare function createUpdateFieldInstruction(args: UpdateFieldInstruction): TransactionInstruction;
interface RemoveKeyInstructionArgs {
    programId: PublicKey;
    metadata: PublicKey;
    updateAuthority: PublicKey;
    key: string;
    idempotent: boolean;
}
declare function createRemoveKeyInstruction(args: RemoveKeyInstructionArgs): TransactionInstruction;
interface UpdateAuthorityInstructionArgs {
    programId: PublicKey;
    metadata: PublicKey;
    oldAuthority: PublicKey;
    newAuthority: PublicKey | null;
}
declare function createUpdateAuthorityInstruction(args: UpdateAuthorityInstructionArgs): TransactionInstruction;
interface EmitInstructionArgs {
    programId: PublicKey;
    metadata: PublicKey;
    start?: bigint;
    end?: bigint;
}
declare function createEmitInstruction(args: EmitInstructionArgs): TransactionInstruction;

declare const TOKEN_METADATA_DISCRIMINATOR: Buffer;
interface TokenMetadata {
    updateAuthority?: PublicKey;
    mint: PublicKey;
    name: string;
    symbol: string;
    uri: string;
    additionalMetadata: (readonly [string, string])[];
}
declare function pack(meta: TokenMetadata): ReadonlyUint8Array;
declare function unpack(buffer: Buffer | Uint8Array | ReadonlyUint8Array): TokenMetadata;

export { type EmitInstructionArgs, Field, ImmutableMetadataError, IncorrectAccountError, IncorrectMintAuthorityError, IncorrectUpdateAuthorityError, type InitializeInstructionArgs, KeyNotFoundError, MintHasNoMintAuthorityError, type RemoveKeyInstructionArgs, TOKEN_METADATA_DISCRIMINATOR, type TokenMetadata, TokenMetadataError, type UpdateAuthorityInstructionArgs, type UpdateFieldInstruction, createEmitInstruction, createInitializeInstruction, createRemoveKeyInstruction, createUpdateAuthorityInstruction, createUpdateFieldInstruction, getFieldCodec, getFieldConfig, pack, unpack };
