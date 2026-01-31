package com.vinditscandit.nfctagmanager.viewmodel

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.data.Tag
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class TagEditViewModel(application: Application) : AndroidViewModel(application) {
    
    private val prefsManager = PreferencesManager(application)
    
    private val _tag = MutableLiveData<Tag?>()
    val tag: LiveData<Tag?> = _tag
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private val _success = MutableLiveData<Boolean>()
    val success: LiveData<Boolean> = _success
    
    fun createTag(
        slug: String,
        name: String?,
        phone1: String?,
        phone2: String?,
        address: String?,
        url: String?,
        instructions: String?
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _success.value = false
            
            try {
                val username = prefsManager.getUsername() ?: "token"
                val password = prefsManager.getPassword() ?: "auth"
                if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null) return@launch
                
                val request = com.vinditscandit.nfctagmanager.data.TagCreateRequest(
                    slug = slug,
                    name = name,
                    phone1 = phone1,
                    phone2 = phone2,
                    address = address,
                    url = url,
                    instructions = instructions
                )
                
                val response = ApiClient.apiService.createTag(username, password, request)
                
                if (response.isSuccessful) {
                    _tag.value = response.body()
                    _success.value = true
                } else {
                    // Handle specific error cases
                    when (response.code()) {
                        409 -> {
                            // Duplicate slug - very rare with random suffix, but handle gracefully
                            _error.value = "A tag with this name already exists. Please try a slightly different name."
                        }
                        400 -> {
                            _error.value = "Invalid tag data. Please check all fields and try again."
                        }
                        else -> {
                            // Try to get error message from response body
                            val errorMsg = try {
                                response.errorBody()?.string()?.let { body ->
                                    // Try to parse JSON error message
                                    if (body.contains("\"error\"")) {
                                        val json = org.json.JSONObject(body)
                                        json.optString("error", "Failed to create tag")
                                    } else {
                                        body
                                    }
                                } ?: "Failed to create tag: ${response.message()}"
                            } catch (e: Exception) {
                                "Failed to create tag: ${response.message()}"
                            }
                            _error.value = errorMsg
                        }
                    }
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    suspend fun loadTag(tagId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: "token"
                val password = prefsManager.getPassword() ?: "auth"
                if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.getTag(tagId, username, password)
                
                if (response.isSuccessful) {
                    _tag.value = response.body()
                } else {
                    _error.value = "Failed to load tag"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun updateTag(
        tagId: Int,
        name: String,
        phone1: String,
        phone2: String,
        address: String,
        url: String,
        instructions: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _success.value = false
            
            try {
                val username = prefsManager.getUsername() ?: "token"
                val password = prefsManager.getPassword() ?: "auth"
                if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.updateTag(
                    tagId,
                    username,
                    password,
                    com.vinditscandit.nfctagmanager.data.TagUpdateRequest(
                        name = name.ifEmpty { null },
                        phone1 = phone1.ifEmpty { null },
                        phone2 = phone2.ifEmpty { null },
                        address = address.ifEmpty { null },
                        url = url.ifEmpty { null },
                        instructions = instructions.ifEmpty { null },
                        imageUrl = _tag.value?.imageUrl
                    )
                )
                
                if (response.isSuccessful) {
                    _tag.value = response.body()
                    _success.value = true
                } else {
                    _error.value = "Failed to update tag"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    suspend fun uploadImage(uri: Uri, context: Context) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val username = prefsManager.getUsername() ?: "token"
                val password = prefsManager.getPassword() ?: "auth"
                if (username == "token" && password == "auth" && prefsManager.getAuthToken() == null) return@launch
                
                // Convert URI to File
                val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
                val file = File(context.cacheDir, "temp_image.jpg")
                val outputStream = FileOutputStream(file)
                
                inputStream?.use { input ->
                    outputStream.use { output ->
                        input.copyTo(output)
                    }
                }
                
                // Create multipart request
                val requestFile = file.asRequestBody("image/jpeg".toMediaType())
                val body = MultipartBody.Part.createFormData("file", file.name, requestFile)
                
                val response = ApiClient.apiService.uploadImage(username, password, body)
                
                if (response.isSuccessful) {
                    val imageUrl = response.body()?.url
                    if (imageUrl != null && _tag.value != null) {
                        // Update tag with image URL
                        val currentTag = _tag.value!!
                        
                        val response2 = ApiClient.apiService.updateTag(
                            currentTag.id,
                            username,
                            password,
                            com.vinditscandit.nfctagmanager.data.TagUpdateRequest(
                                name = currentTag.name,
                                phone1 = currentTag.phone1,
                                phone2 = currentTag.phone2,
                                address = currentTag.address,
                                url = currentTag.url,
                                instructions = currentTag.instructions,
                                imageUrl = imageUrl
                            )
                        )
                        if (response2.isSuccessful) {
                            _tag.value = response2.body()
                            _success.value = true
                        }
                    }
                } else {
                    _error.value = "Failed to upload image"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Upload error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun removeImage() {
        viewModelScope.launch {
            _tag.value?.let { currentTag ->
                val username = prefsManager.getUsername() ?: ""
                val password = prefsManager.getPassword() ?: ""
                if (username.isEmpty() && password.isEmpty() && prefsManager.getAuthToken() == null) return@launch
                
                val response = ApiClient.apiService.updateTag(
                    currentTag.id,
                    username,
                    password,
                    com.vinditscandit.nfctagmanager.data.TagUpdateRequest(
                        name = currentTag.name,
                        phone1 = currentTag.phone1,
                        phone2 = currentTag.phone2,
                        address = currentTag.address,
                        url = currentTag.url,
                        instructions = currentTag.instructions,
                        imageUrl = null
                    )
                )
                
                if (response.isSuccessful) {
                    _tag.value = response.body()
                    _success.value = true
                } else {
                    _error.value = "Failed to remove image"
                }
            }
        }
    }
}
