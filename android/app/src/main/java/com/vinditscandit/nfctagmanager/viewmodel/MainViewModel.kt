package com.vinditscandit.nfctagmanager.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.data.Tag
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
    
    private val prefsManager = PreferencesManager(application)
    
    private val _tags = MutableLiveData<List<Tag>>()
    val tags: LiveData<List<Tag>> = _tags
    
    private val _filteredTags = MutableLiveData<List<Tag>>()
    val filteredTags: LiveData<List<Tag>> = _filteredTags
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    fun loadTags() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: "token"
                val password = prefsManager.getPassword() ?: "auth"
                if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null)
                    return@launch
                val response = ApiClient.apiService.getTags(username, password)
                
                if (response.isSuccessful) {
                    val loadedTags = response.body() ?: emptyList()
                    _tags.value = loadedTags
                    _filteredTags.value = loadedTags
                } else {
                    _error.value = "Failed to load tags"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    suspend fun loadTag(tagId: Int): Tag? {
        return try {
            val username = prefsManager.getUsername() ?: "token"
            val password = prefsManager.getPassword() ?: "auth"
            if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null)
                return null
            val response = ApiClient.apiService.getTag(tagId, username, password)
            if (response.isSuccessful) {
                response.body()
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}
