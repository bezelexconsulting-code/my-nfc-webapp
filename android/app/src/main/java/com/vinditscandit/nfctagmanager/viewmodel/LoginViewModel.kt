package com.vinditscandit.nfctagmanager.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.data.LoginRequest
import kotlinx.coroutines.launch

data class Result<out T>(
    val data: T? = null,
    val isLoading: Boolean = false,
    val error: String? = null
) {
    val isSuccess: Boolean
        get() = data != null && !isLoading && error == null
}

class LoginViewModel : ViewModel() {
    
    private val _loginResult = MutableLiveData<Result<com.vinditscandit.nfctagmanager.data.LoginResponse>>()
    val loginResult: LiveData<Result<com.vinditscandit.nfctagmanager.data.LoginResponse>> = _loginResult
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginResult.value = Result(isLoading = true)
            
            try {
                val response = ApiClient.apiService.login(
                    LoginRequest(username, password)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    _loginResult.value = Result(data = response.body())
                } else {
                    _loginResult.value = Result(
                        error = response.body()?.error ?: "Login failed"
                    )
                }
            } catch (e: Exception) {
                _loginResult.value = Result(
                    error = e.message ?: "Network error"
                )
            }
        }
    }

    fun loginWithGoogle(idToken: String) {
        viewModelScope.launch {
            _loginResult.value = Result(isLoading = true)
            try {
                val response = ApiClient.apiService.loginWithGoogle(
                    com.vinditscandit.nfctagmanager.data.GoogleLoginRequest(idToken)
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    _loginResult.value = Result(data = response.body())
                } else {
                    _loginResult.value = Result(
                        error = response.body()?.error ?: "Google sign-in failed"
                    )
                }
            } catch (e: Exception) {
                _loginResult.value = Result(
                    error = e.message ?: "Network error"
                )
            }
        }
    }
}
