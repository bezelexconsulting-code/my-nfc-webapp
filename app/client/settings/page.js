"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordStrengthMeter from "../../../components/PasswordStrengthMeter";
import {
  isWebAuthnAvailable,
  getAppLockEnabled,
  setAppLockEnabled,
  registerAppUnlock,
} from "../../../lib/webauthn";

export default function SettingsPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile"); // profile, password, account, security
  const [appLockEnabled, setAppLockEnabledState] = useState(false);
  const [appLockLoading, setAppLockLoading] = useState(false);
  const [appLockError, setAppLockError] = useState("");

  // Profile form
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setAppLockEnabledState(getAppLockEnabled());
  }, []);

  useEffect(() => {
    // Get client info from localStorage or session (dashboard uses session)
    const storedName = localStorage.getItem("clientName");
    const storedPassword = localStorage.getItem("clientPassword");
    
    if (!storedName || !storedPassword) {
      // Try session-based: fetch /api/client/me with credentials (cookie)
      fetch("/api/client/me", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.client) {
            setClient({
              id: data.client.id,
              name: data.client.name,
              email: data.client.email,
              emailVerified: data.client.emailVerified,
            });
            setProfileData({
              name: data.client.name,
              email: data.client.email || "",
            });
          } else {
            router.push("/client/dashboard");
          }
        })
        .catch(() => router.push("/client/dashboard"));
      return;
    }

    fetchClientData(storedName, storedPassword);
  }, [router]);

  async function fetchClientData(name, password) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.client);
        setProfileData({
          name: data.client.name,
          email: data.client.email || "",
        });
      } else {
        router.push("/client/dashboard");
      }
    } catch (err) {
      router.push("/client/dashboard");
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const storedName = localStorage.getItem("clientName");
      const storedPassword = localStorage.getItem("clientPassword");

      const res = await fetch(`/api/client/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-name": storedName,
          "x-client-password": storedPassword,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSuccess("Profile updated successfully!");
      setClient(data.client);
      if (profileData.name !== storedName) {
        localStorage.setItem("clientName", profileData.name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Password strength validation
    const passwordChecks = {
      length: passwordData.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(passwordData.newPassword),
      lowercase: /[a-z]/.test(passwordData.newPassword),
      number: /[0-9]/.test(passwordData.newPassword),
      special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
    };

    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number || !passwordChecks.special) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      return;
    }

    setLoading(true);

    try {
      const storedName = localStorage.getItem("clientName");
      const storedPassword = localStorage.getItem("clientPassword");

      const res = await fetch(`/api/client/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-name": storedName,
          "x-client-password": storedPassword,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password update failed");
      }

      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      localStorage.setItem("clientPassword", passwordData.newPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone and all your tags will be deleted.")) {
      return;
    }

    if (!confirm("This is your final warning. All your data will be permanently deleted. Continue?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const storedName = localStorage.getItem("clientName");
      const storedPassword = localStorage.getItem("clientPassword");

      const res = await fetch(`/api/client/account`, {
        method: "DELETE",
        headers: {
          "x-client-name": storedName,
          "x-client-password": storedPassword,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Account deletion failed");
      }

      localStorage.removeItem("clientName");
      localStorage.removeItem("clientPassword");
      router.push("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function exportData() {
    setLoading(true);
    try {
      const storedName = localStorage.getItem("clientName");
      const storedPassword = localStorage.getItem("clientPassword");

      const res = await fetch(`/api/client/export`, {
        headers: {
          "x-client-name": storedName,
          "x-client-password": storedPassword,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Export failed");
      }

      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nfc-tag-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess("Data exported successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
          <a
            href="/client/dashboard"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "account"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                {client.emailVerified ? (
                  <p className="mt-1 text-xs text-green-600">✓ Email verified</p>
                ) : (
                  <p className="mt-1 text-xs text-yellow-600">⚠ Email not verified</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab - App unlock (face, fingerprint, PIN) */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">App unlock</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              When enabled, opening the app will require your device&apos;s face recognition, fingerprint, or PIN to continue.
            </p>
            {appLockError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-red-600 dark:text-red-400 text-sm">
                {appLockError}
              </div>
            )}
            {!isWebAuthnAvailable() && (
              <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
                Secure unlock is not available in this browser. Use a supported device (e.g. phone with biometrics).
              </p>
            )}
            <div className="flex items-center justify-between">
              <label htmlFor="app-lock" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require device unlock when opening app
              </label>
              <button
                id="app-lock"
                type="button"
                role="switch"
                aria-checked={appLockEnabled}
                disabled={appLockLoading || !isWebAuthnAvailable()}
                onClick={async () => {
                  setAppLockError("");
                  setAppLockLoading(true);
                  try {
                    if (appLockEnabled) {
                      setAppLockEnabled(false);
                      setAppLockEnabledState(false);
                      setSuccess("App unlock turned off.");
                    } else {
                      const result = await registerAppUnlock();
                      if (result.ok && result.credentialId) {
                        setAppLockEnabled(true, result.credentialId);
                        setAppLockEnabledState(true);
                        setSuccess("App unlock turned on. You will need to use face, fingerprint, or PIN when opening the app.");
                      } else {
                        setAppLockError(result.error || "Could not set up app unlock.");
                      }
                    }
                  } finally {
                    setAppLockLoading(false);
                  }
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  appLockEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    appLockEnabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <PasswordStrengthMeter password={passwordData.newPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Data</h2>
              <p className="text-sm text-gray-600 mb-4">
                Download all your account data and tags in JSON format.
              </p>
              <button
                onClick={exportData}
                disabled={loading}
                className="rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-300 transition-colors duration-200"
              >
                {loading ? "Exporting..." : "Export My Data"}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h2>
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={deleteAccount}
                disabled={loading}
                className="rounded-lg bg-red-600 px-6 py-3 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-300 transition-colors duration-200"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
