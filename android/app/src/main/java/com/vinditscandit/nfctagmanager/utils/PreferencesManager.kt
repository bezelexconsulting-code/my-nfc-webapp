package com.vinditscandit.nfctagmanager.utils

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME,
        Context.MODE_PRIVATE
    )
    
    companion object {
        private const val PREFS_NAME = "nfc_tag_manager_prefs"
        private const val KEY_USERNAME = "username"
        private const val KEY_PASSWORD = "password"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_CLIENT_ID = "client_id"
        private const val KEY_CLIENT_NAME = "client_name"
        private const val KEY_CLIENT_EMAIL = "client_email"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
        private const val KEY_DARK_MODE = "dark_mode"
    }

    fun saveAuthToken(token: String?) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    fun getAuthToken(): String? = prefs.getString(KEY_AUTH_TOKEN, null)

    fun isGoogleUser(): Boolean = getAuthToken() != null && getPassword() == null
    
    fun saveCredentials(username: String, password: String) {
        prefs.edit()
            .putString(KEY_USERNAME, username)
            .putString(KEY_PASSWORD, password)
            .apply()
    }
    
    fun getUsername(): String? = prefs.getString(KEY_USERNAME, null)
    fun getPassword(): String? = prefs.getString(KEY_PASSWORD, null)
    
    fun saveClientInfo(clientId: Int, name: String, email: String?) {
        prefs.edit()
            .putInt(KEY_CLIENT_ID, clientId)
            .putString(KEY_CLIENT_NAME, name)
            .putString(KEY_CLIENT_EMAIL, email)
            .apply()
    }
    
    fun getClientId(): Int = prefs.getInt(KEY_CLIENT_ID, -1)
    fun getClientName(): String? = prefs.getString(KEY_CLIENT_NAME, null)
    fun getClientEmail(): String? = prefs.getString(KEY_CLIENT_EMAIL, null)
    
    fun setBiometricEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_BIOMETRIC_ENABLED, enabled).apply()
    }
    
    fun isBiometricEnabled(): Boolean = prefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    
    fun setDarkMode(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DARK_MODE, enabled).apply()
    }
    
    fun isDarkMode(): Boolean = prefs.getBoolean(KEY_DARK_MODE, false)
    
    
    fun clear() {
        prefs.edit().clear().apply()
    }
}
