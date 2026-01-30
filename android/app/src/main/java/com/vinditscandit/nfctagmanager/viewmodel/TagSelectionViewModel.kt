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

class TagSelectionViewModel(application: Application) : AndroidViewModel(application) {
    
    private val prefsManager = PreferencesManager(application)
    
    private val _tags = MutableLiveData<List<Tag>>()
    val tags: LiveData<List<Tag>> = _tags
    
    private val _filteredTags = MutableLiveData<List<Tag>>()
    val filteredTags: LiveData<List<Tag>> = _filteredTags
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private var allTags: List<Tag> = emptyList()
    private var currentSort: String = "name"
    private var currentSearch: String = ""
    
    fun loadTags() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                val response = ApiClient.apiService.getTags(username, password)
                
                if (response.isSuccessful) {
                    allTags = response.body() ?: emptyList()
                    _tags.value = allTags
                    applyFilters()
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
    
    fun searchTags(query: String) {
        currentSearch = query
        applyFilters()
    }
    
    fun sortTags(sortBy: String) {
        currentSort = sortBy
        applyFilters()
    }
    
    private fun applyFilters() {
        var filtered = allTags.toList()
        
        // Apply search
        if (currentSearch.isNotEmpty()) {
            val query = currentSearch.lowercase()
            filtered = filtered.filter {
                it.name?.lowercase()?.contains(query) == true ||
                it.slug.lowercase().contains(query) ||
                it.phone1?.lowercase()?.contains(query) == true ||
                it.address?.lowercase()?.contains(query) == true
            }
        }
        
        // Apply sort
        filtered = when (currentSort) {
            "name" -> filtered.sortedBy { it.name ?: it.slug }
            "dateCreated" -> filtered.sortedByDescending { it.id } // Using ID as proxy for date
            "dateUpdated" -> filtered.sortedByDescending { it.id }
            else -> filtered
        }
        
        _filteredTags.value = filtered
    }
    
    fun deleteTags(tagIds: List<Int>) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                // Delete each tag
                tagIds.forEach { tagId ->
                    val response = ApiClient.apiService.deleteTag(tagId, username, password)
                    if (!response.isSuccessful) {
                        _error.value = "Failed to delete some tags"
                        return@launch
                    }
                }
                
                // Reload tags after deletion
                loadTags()
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
