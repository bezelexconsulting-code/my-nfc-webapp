"use client";
import { useState, useEffect } from "react";
import {
  isWebAuthnAvailable,
  getAppLockEnabled,
  getAppUnlockCredentialId,
  isUnlockedThisSession,
  setUnlockedThisSession,
  authenticateAppUnlock,
} from "../lib/webauthn";

export default function AppUnlockGate({ children }) {
  const [mounted, setMounted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const lockEnabled = mounted && getAppLockEnabled();
  const credentialId = getAppUnlockCredentialId();
  const alreadyUnlocked = isUnlockedThisSession();

  const showUnlockScreen = mounted && lockEnabled && !alreadyUnlocked;

  async function handleUnlock() {
    setUnlockError("");
    setUnlocking(true);
    try {
      const result = await authenticateAppUnlock(credentialId);
      if (result.ok) {
        setUnlockedThisSession();
      } else {
        setUnlockError(result.error || "Unlock failed.");
      }
    } finally {
      setUnlocking(false);
    }
  }

  if (!showUnlockScreen) {
    return children;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-4">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Unlock app
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Use your device&apos;s face recognition, fingerprint, or PIN to continue.
        </p>
        {unlockError && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-red-600 dark:text-red-400 text-sm">
            {unlockError}
          </div>
        )}
        {!isWebAuthnAvailable() ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Secure unlock is not available in this browser. Use a supported device (e.g. phone with biometrics).
          </p>
        ) : (
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="w-full rounded-lg bg-blue-600 p-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors touch-manipulation"
          >
            {unlocking ? "Waiting for you…" : "Unlock with Face, Fingerprint, or PIN"}
          </button>
        )}
      </div>
    </div>
  );
}
