package com.vinditscandit.nfctagmanager.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.data.LoginResponse
import com.vinditscandit.nfctagmanager.data.RegisterRequest
import com.vinditscandit.nfctagmanager.data.GoogleLoginRequest
import kotlinx.coroutines.launch

data class RegisterResult(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val data: LoginResponse? = null,
    val error: String? = null
)

class RegisterViewModel : ViewModel() {
    
    private val _registerResult = MutableLiveData<RegisterResult>()
    val registerResult: LiveData<RegisterResult> = _registerResult
    
    fun register(name: String, email: String, password: String) {
        viewModelScope.launch {
            _registerResult.value = RegisterResult(isLoading = true)
            
            try {
                val response = ApiClient.apiService.register(
                    RegisterRequest(
                        name = name,
                        email = email,
                        password = password
                    )
                )
                
                if (response.isSuccessful && response.body() != null) {
                    _registerResult.value = RegisterResult(
                        isSuccess = true,
                        data = response.body()
                    )
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        // Try to parse error JSON
                        val jsonError = com.google.gson.Gson().fromJson(
                            errorBody,
                            Map::class.java
                        )
                        jsonError["error"]?.toString() ?: "Registration failed"
                    } catch (e: Exception) {
                        "Registration failed"
                    }
                    _registerResult.value = RegisterResult(error = errorMessage)
                }
            } catch (e: Exception) {
                _registerResult.value = RegisterResult(
                    error = e.message ?: "Network error"
                )
            }
        }
    }
    
    fun registerWithGoogle(idToken: String) {
        viewModelScope.launch {
            _registerResult.value = RegisterResult(isLoading = true)
            
            try {
                val response = ApiClient.apiService.loginWithGoogle(
                    GoogleLoginRequest(idToken = idToken)
                )
                
                if (response.isSuccessful && response.body() != null) {
                    _registerResult.value = RegisterResult(
                        isSuccess = true,
                        data = response.body()
                    )
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        val jsonError = com.google.gson.Gson().fromJson(
                            errorBody,
                            Map::class.java
                        )
                        jsonError["error"]?.toString() ?: "Google sign-up failed"
                    } catch (e: Exception) {
                        "Google sign-up failed"
                    }
                    _registerResult.value = RegisterResult(error = errorMessage)
                }
            } catch (e: Exception) {
                _registerResult.value = RegisterResult(
                    error = e.message ?: "Network error"
                )
            }
        }
    }
}
