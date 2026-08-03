/**
 * Stellar Federation & CashTag Utility Service (*lynxx.app)
 */

const RESERVED_HANDLES = new Set([
  "admin", "system", "lynx", "lynxx", "official", "support", "help", 
  "stellar", "foundation", "wallet", "escrow", "treasury", "null", "undefined"
]);

const DB_STORAGE_KEY = "lynxx_cashtags_db";
const USER_TAG_PREFIX = "lynxx_cashtag_";

/**
 * Get local database of claimed handles: { [handle]: walletAddress }
 */
function getCashTagDb() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      "satoshi": "G...SATOSHI",
      "vitalik": "G...VITALIK",
      "alex": "GDZ5F3T2ALEX7890"
    };
  } catch (e) {
    console.error("Error reading CashTag DB from localStorage:", e);
    return {};
  }
}

/**
 * Save database of claimed handles
 */
function saveCashTagDb(db) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Error saving CashTag DB to localStorage:", e);
  }
}

/**
 * Get user's current claimed CashTag by wallet address
 */
export function getUserCashTag(address) {
  if (typeof window === "undefined" || !address) return null;
  try {
    return localStorage.getItem(`${USER_TAG_PREFIX}${address}`) || null;
  } catch (e) {
    console.error("Error getting user CashTag:", e);
    return null;
  }
}

/**
 * Validate handle string format
 */
export function validateHandleFormat(handle) {
  const clean = (handle || "").trim().toLowerCase();
  if (!clean) return { valid: false, reason: "Handle cannot be empty" };
  if (clean.length < 3) return { valid: false, reason: "Handle must be at least 3 characters" };
  if (clean.length > 20) return { valid: false, reason: "Handle cannot exceed 20 characters" };
  if (!/^[a-z0-9_-]+$/.test(clean)) {
    return { valid: false, reason: "Only letters, numbers, hyphens, and underscores allowed" };
  }
  return { valid: true, cleanHandle: clean };
}

/**
 * Check handle availability via federation lookup
 */
export async function checkCashTagAvailability(handle, currentAddress = "") {
  // Simulate network delay for federation API call
  await new Promise((resolve) => setTimeout(resolve, 350));

  const validation = validateHandleFormat(handle);
  if (!validation.valid) {
    return { available: false, reason: validation.reason };
  }

  const clean = validation.cleanHandle;

  if (RESERVED_HANDLES.has(clean)) {
    return { available: false, reason: "This CashTag is reserved by system" };
  }

  const db = getCashTagDb();
  const existingOwner = db[clean];

  if (existingOwner) {
    if (currentAddress && existingOwner.toLowerCase() === currentAddress.toLowerCase()) {
      return { available: true, isCurrentOwner: true, reason: "You currently own this CashTag" };
    }
    return { available: false, reason: "This CashTag is already taken" };
  }

  return { available: true, cleanHandle: clean, fullTag: `${clean}*lynxx.app` };
}

/**
 * Claim a CashTag for a given wallet address
 */
export async function claimCashTag(handle, address) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const check = await checkCashTagAvailability(handle, address);
  if (!check.available) {
    throw new Error(check.reason || "Handle unavailable");
  }

  const clean = check.cleanHandle || handle.trim().toLowerCase();
  const fullTag = `${clean}*lynxx.app`;

  // Update DB
  const db = getCashTagDb();

  // If user previously owned another handle, optionally clear old handle or keep alias
  db[clean] = address;
  saveCashTagDb(db);

  // Save to user storage
  if (typeof window !== "undefined") {
    localStorage.setItem(`${USER_TAG_PREFIX}${address}`, fullTag);
  }

  return { success: true, cashtag: fullTag, handle: clean };
}

/**
 * Helper to copy text to clipboard safely
 */
export async function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
