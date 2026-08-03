/**
 * Base class for all errors raised by the LynxX Wallet SDK.
 */
export class LynxxWalletError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "LynxxWalletError";
    Object.setPrototypeOf(this, LynxxWalletError.prototype);
  }
}

/**
 * Thrown when the Freighter browser extension cannot be detected.
 */
export class WalletNotFoundError extends LynxxWalletError {
  constructor(
    message = "Freighter wallet extension was not detected. Install it from https://freighter.app."
  ) {
    super(message, "WALLET_NOT_FOUND");
    this.name = "WalletNotFoundError";
    Object.setPrototypeOf(this, WalletNotFoundError.prototype);
  }
}

/**
 * Thrown when the user rejects a connection, signing, or authorization request.
 */
export class UserRejectedError extends LynxxWalletError {
  constructor(message = "The user rejected the request.") {
    super(message, "USER_REJECTED");
    this.name = "UserRejectedError";
    Object.setPrototypeOf(this, UserRejectedError.prototype);
  }
}

/**
 * Thrown when the wallet does not respond within the allotted time.
 */
export class SigningTimeoutError extends LynxxWalletError {
  constructor(message = "Timed out waiting for the wallet to respond.") {
    super(message, "SIGNING_TIMEOUT");
    this.name = "SigningTimeoutError";
    Object.setPrototypeOf(this, SigningTimeoutError.prototype);
  }
}

/**
 * Thrown when a provided XDR string is malformed or not a supported
 * transaction/auth-entry envelope.
 */
export class InvalidXdrError extends LynxxWalletError {
  constructor(message: string) {
    super(message, "INVALID_XDR");
    this.name = "InvalidXdrError";
    Object.setPrototypeOf(this, InvalidXdrError.prototype);
  }
}

/**
 * Thrown for any other failure reported by the wallet (e.g. internal error,
 * network mismatch) that doesn't fall into a more specific category.
 */
export class WalletRequestError extends LynxxWalletError {
  constructor(message: string, code = "WALLET_REQUEST_FAILED") {
    super(message, code);
    this.name = "WalletRequestError";
    Object.setPrototypeOf(this, WalletRequestError.prototype);
  }
}

/** Shape of the error object returned by `@stellar/freighter-api` calls. */
export interface WalletApiError {
  code: number;
  message: string;
  ext?: string[];
}

const REJECTION_PATTERN = /declin|reject|denied|cancel/i;

/**
 * Maps a raw error coming back from the Freighter extension (or a thrown
 * exception) into a typed `LynxxWalletError`.
 */
export function mapWalletError(
  error: WalletApiError | Error | unknown,
  fallbackMessage = "The wallet request failed."
): LynxxWalletError {
  if (error instanceof LynxxWalletError) {
    return error;
  }

  const message =
    (typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string" &&
      (error as { message: string }).message) ||
    fallbackMessage;

  if (REJECTION_PATTERN.test(message)) {
    return new UserRejectedError(message);
  }

  return new WalletRequestError(message);
}
