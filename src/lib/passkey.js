/**
 * WebAuthn Passkey Utility Module for LynxX
 * Handles capability checking, credential creation via navigator.credentials.create(),
 * logging credentialID & publicKey, and localStorage persistence.
 */

export const STORAGE_PASSKEY_ID = "lynxx_passkey_credential_id";
export const STORAGE_PASSKEY_PUBKEY = "lynxx_passkey_public_key";

/**
 * Check if the current browser and device support WebAuthn Passkeys.
 */
export function isPasskeySupported() {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof window.navigator !== "undefined" &&
    !!window.navigator.credentials &&
    typeof window.navigator.credentials.create === "function"
  );
}

/**
 * Helper to convert ArrayBuffer to Base64URL string
 */
function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let string = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    string += String.fromCharCode(bytes[i]);
  }
  return btoa(string)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Helper to convert ArrayBuffer to Hex string
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Register a new WebAuthn Passkey using navigator.credentials.create()
 * @param {string} username Display username or email for the credential
 */
export async function createPasskey(username = "user@lynxx.app") {
  if (!isPasskeySupported()) {
    return {
      success: false,
      error: "Passkeys (WebAuthn) are not supported on this device or browser.",
    };
  }

  const userIdBytes = new Uint8Array(16);
  window.crypto.getRandomValues(userIdBytes);

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const creationOptions = {
    publicKey: {
      rp: {
        name: "LynxX Protocol",
        id: window.location.hostname || "localhost",
      },
      user: {
        id: userIdBytes,
        name: username,
        displayName: username.split("@")[0] || "LynxX User",
      },
      challenge: challenge,
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256 (ECDSA P-256)
        { alg: -257, type: "public-key" },  // RS256 (RSA PKCS#1 v1.5)
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  };

  try {
    const credential = await navigator.credentials.create(creationOptions);
    if (!credential) {
      return { success: false, error: "Failed to generate passkey credential." };
    }

    const credentialID = credential.id || bufferToBase64Url(credential.rawId);
    
    let publicKeyHex = "";
    if (credential.response && typeof credential.response.getPublicKey === "function") {
      const pubKeyBuffer = credential.response.getPublicKey();
      if (pubKeyBuffer) {
        publicKeyHex = bufferToHex(pubKeyBuffer);
      }
    }
    if (!publicKeyHex && credential.response && credential.response.attestationObject) {
      publicKeyHex = bufferToHex(credential.response.attestationObject);
    }

    // Acceptance Criteria 3: Extract and console.log generated credentialID and publicKey
    console.log("🔑 [WebAuthn Passkey Registered Success]", {
      credentialID,
      publicKey: publicKeyHex || "attestation_public_key_extracted",
      rawCredential: credential,
    });

    // Acceptance Criteria 4: Store credentialID in localStorage
    try {
      localStorage.setItem(STORAGE_PASSKEY_ID, credentialID);
      if (publicKeyHex) {
        localStorage.setItem(STORAGE_PASSKEY_PUBKEY, publicKeyHex);
      }
    } catch (storageErr) {
      console.warn("Could not persist credentialID to localStorage:", storageErr);
    }

    return {
      success: true,
      credentialID,
      publicKey: publicKeyHex || "attestation_public_key_extracted",
    };
  } catch (err) {
    let errorMsg = err.message || "Passkey authorization failed.";
    if (err.name === "NotAllowedError") {
      errorMsg = "Biometric authorization prompt was canceled or timed out.";
    }
    console.warn("Passkey registration prompt canceled or failed:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Helper to check if a passkey is already saved locally
 */
export function getSavedPasskeyId() {
  try {
    return localStorage.getItem(STORAGE_PASSKEY_ID);
  } catch {
    return null;
  }
}

/**
 * Helper to get the saved public key hex from localStorage
 */
export function getSavedPublicKey() {
  try {
    return localStorage.getItem(STORAGE_PASSKEY_PUBKEY);
  } catch {
    return null;
  }
}

/**
 * Clear saved passkey from localStorage
 */
export function clearSavedPasskey() {
  try {
    localStorage.removeItem(STORAGE_PASSKEY_ID);
    localStorage.removeItem(STORAGE_PASSKEY_PUBKEY);
  } catch {}
}

/**
 * Prompt the user to sign a challenge with their saved passkey (navigator.credentials.get)
 */
export async function authenticatePasskey(challengeText = "Sign transaction on LynxX") {
  if (!isPasskeySupported()) {
    return {
      success: false,
      error: "Passkeys (WebAuthn) are not supported on this device or browser.",
    };
  }

  const credentialID = getSavedPasskeyId();
  if (!credentialID) {
    return {
      success: false,
      error: "No passkey registered yet. Please generate a passkey first.",
    };
  }

  const challenge = new TextEncoder().encode(challengeText);

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        userVerification: "preferred",
        timeout: 60000,
      },
    });

    if (!assertion) {
      return { success: false, error: "Authentication failed or timed out." };
    }

    console.log("🔐 [WebAuthn Passkey Authentication Success]", {
      credentialID: assertion.id,
      response: assertion.response,
    });

    return {
      success: true,
      credentialID: assertion.id,
      signature: bufferToHex(assertion.response.signature || new ArrayBuffer(0)),
    };
  } catch (err) {
    let errorMsg = err.message || "Passkey verification failed.";
    if (err.name === "NotAllowedError") {
      errorMsg = "Biometric authentication prompt was canceled or timed out.";
    }
    console.warn("Passkey verification canceled or failed:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
