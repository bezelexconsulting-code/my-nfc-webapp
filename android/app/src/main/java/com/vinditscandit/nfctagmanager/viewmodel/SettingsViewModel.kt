package com.vinditscandit.nfctagmanager.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import kotlinx.coroutines.launch

data class Profile(
    val id: Int,
    val name: String,
    val email: String?
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val prefsManager = PreferencesManager(application)
    
    private val _profile = MutableLiveData<Profile?>()
    val profile: LiveData<Profile?> = _profile
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private val _success = MutableLiveData<String?>()
    val success: LiveData<String?> = _success
    
    suspend fun loadProfile() {
        viewModelScope.launch {
            _isLoading.value = true
            
            try {
                val clientId = prefsManager.getClientId()
                val name = prefsManager.getClientName() ?: ""
                val email = prefsManager.getClientEmail()
                
                _profile.value = Profile(clientId, name, email)
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun updateProfile(name: String, email: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _success.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.updateProfile(
                    username,
                    password,
                    com.vinditscandit.nfctagmanager.data.ProfileUpdateRequest(name, email)
                )
                
                if (response.isSuccessful) {
                    val updated = response.body()
                    updated?.client?.let { client ->
                        prefsManager.saveClientInfo(client.id, client.name, client.email)
                        if (client.name != username) {
                            prefsManager.saveCredentials(client.name, password)
                        }
                        _profile.value = Profile(client.id, client.name, client.email)
                        _success.value = updated.message ?: "Profile updated successfully"
                    } ?: run {
                        _success.value = "Profile updated successfully"
                    }
                } else {
                    _error.value = "Failed to update profile"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun changePassword(currentPassword: String, newPassword: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _success.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.changePassword(
                    username,
                    password,
                    com.vinditscandit.nfctagmanager.data.PasswordChangeRequest(currentPassword, newPassword)
                )
                
                if (response.isSuccessful) {
                    prefsManager.saveCredentials(username, newPassword)
                    _success.value = "Password changed successfully"
                } else {
                    _error.value = "Failed to change password"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun exportData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.exportData(username, password)
                
                if (response.isSuccessful) {
                    // Handle export - save to file or share
                    _success.value = "Data exported successfully"
                } else {
                    _error.value = "Failed to export data"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun deleteAccount() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.deleteAccount(username, password)
                
                if (response.isSuccessful) {
                    _success.value = "Account deleted successfully"
                } else {
                    _error.value = "Failed to delete account"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
