/**
 * Client-side WebAuthn helpers for app unlock (face, fingerprint, or device PIN).
 * Uses platform authenticator when available.
 */

function toBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isWebAuthnAvailable() {
  return typeof window !== "undefined" && window.PublicKeyCredential !== undefined;
}

/**
 * Register a new platform credential for app unlock. Store the credential id in localStorage.
 * @returns { Promise<{ ok: boolean, error?: string }> }
 */
export async function registerAppUnlock() {
  if (!isWebAuthnAvailable()) {
    return { ok: false, error: "Your browser or device does not support secure unlock." };
  }
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);
    const options = {
      publicKey: {
        rp: { name: "NFC Tag Manager" },
        user: {
          id: userId,
          name: "app-unlock",
          displayName: "App unlock",
        },
        challenge,
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: 60000,
      },
    };
    const credential = await navigator.credentials.create(options);
    if (!credential || !credential.id) {
      return { ok: false, error: "Could not create credential." };
    }
    return { ok: true, credentialId: credential.id };
  } catch (err) {
    const message = err.message || "Registration failed.";
    if (err.name === "NotAllowedError") {
      return { ok: false, error: "Cancelled or not allowed." };
    }
    return { ok: false, error: message };
  }
}

/**
 * Authenticate with the stored credential (face, fingerprint, or device PIN).
 * @param {string} credentialId - Base64url credential id from registration
 * @returns { Promise<{ ok: boolean, error?: string }> }
 */
export async function authenticateAppUnlock(credentialId) {
  if (!isWebAuthnAvailable()) {
    return { ok: false, error: "Your browser or device does not support secure unlock." };
  }
  if (!credentialId) {
    return { ok: false, error: "No unlock credential found. Turn off app lock in settings and turn it on again." };
  }
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const allowCredentials = [
      {
        id: fromBase64url(credentialId),
        type: "public-key",
      },
    ];
    const options = {
      publicKey: {
        challenge,
        allowCredentials,
        userVerification: "required",
        timeout: 60000,
      },
    };
    const assertion = await navigator.credentials.get(options);
    if (!assertion) {
      return { ok: false, error: "Unlock was cancelled." };
    }
    return { ok: true };
  } catch (err) {
    const message = err.message || "Unlock failed.";
    if (err.name === "NotAllowedError") {
      return { ok: false, error: "Cancelled or not allowed." };
    }
    return { ok: false, error: message };
  }
}

const STORAGE_LOCK_KEY = "appLockEnabled";
const STORAGE_CREDENTIAL_KEY = "appUnlockCredentialId";
const SESSION_UNLOCKED_KEY = "appUnlocked";

export function getAppLockEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_LOCK_KEY) === "true";
}

export function getAppUnlockCredentialId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_CREDENTIAL_KEY);
}

export function setAppLockEnabled(enabled, credentialId = null) {
  if (typeof window === "undefined") return;
  if (enabled && credentialId) {
    localStorage.setItem(STORAGE_LOCK_KEY, "true");
    localStorage.setItem(STORAGE_CREDENTIAL_KEY, credentialId);
  } else {
    localStorage.removeItem(STORAGE_LOCK_KEY);
    localStorage.removeItem(STORAGE_CREDENTIAL_KEY);
  }
}

export function isUnlockedThisSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === "true";
}

export function setUnlockedThisSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true");
}
