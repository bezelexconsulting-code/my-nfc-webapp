package com.vinditscandit.nfctagmanager.data

import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/google")
    suspend fun loginWithGoogle(@Body request: GoogleLoginRequest): Response<LoginResponse>
    
    @GET("client/tags")
    suspend fun getTags(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String
    ): Response<List<Tag>>
    
    @POST("client/tags")
    suspend fun createTag(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String,
        @Body request: TagCreateRequest
    ): Response<Tag>
    
    @GET("client/tags/{id}")
    suspend fun getTag(
        @Path("id") tagId: Int,
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String
    ): Response<Tag>
    
    @PUT("client/tags/{id}")
    suspend fun updateTag(
        @Path("id") tagId: Int,
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String,
        @Body tag: TagUpdateRequest
    ): Response<Tag>
    
    @DELETE("client/tags/{id}")
    suspend fun deleteTag(
        @Path("id") tagId: Int,
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String
    ): Response<Unit>
    
    @Multipart
    @POST("client/upload")
    suspend fun uploadImage(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String,
        @Part file: okhttp3.MultipartBody.Part
    ): Response<ImageUploadResponse>
    
    @PUT("client/profile")
    suspend fun updateProfile(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String,
        @Body request: ProfileUpdateRequest
    ): Response<ProfileUpdateResponse>
    
    @PUT("client/password")
    suspend fun changePassword(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String,
        @Body request: PasswordChangeRequest
    ): Response<Unit>
    
    @GET("client/export")
    suspend fun exportData(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String
    ): Response<ExportDataResponse>
    
    @DELETE("client/account")
    suspend fun deleteAccount(
        @Header("x-client-name") username: String,
        @Header("x-client-password") password: String
    ): Response<Unit>
}

data class LoginRequest(
    val name: String,
    val password: String
)

data class GoogleLoginRequest(
    val idToken: String
)

data class LoginResponse(
    val success: Boolean,
    val client: Client?,
    val tags: List<Tag>?,
    val error: String?,
    val token: String? = null
)

data class Client(
    val id: Int,
    val name: String,
    val email: String?
)

data class Tag(
    val id: Int,
    val slug: String,
    val name: String?,
    val phone1: String?,
    val phone2: String?,
    val address: String?,
    val url: String?,
    val instructions: String?,
    val imageUrl: String?
)

data class TagCreateRequest(
    val slug: String,
    val name: String?,
    val phone1: String?,
    val phone2: String?,
    val address: String?,
    val url: String?,
    val instructions: String?
)

data class TagUpdateRequest(
    val name: String?,
    val phone1: String?,
    val phone2: String?,
    val address: String?,
    val url: String?,
    val instructions: String?,
    val imageUrl: String?
)

data class ImageUploadResponse(
    val url: String,
    val filename: String
)

data class ProfileUpdateRequest(
    val name: String,
    val email: String
)

data class PasswordChangeRequest(
    val currentPassword: String,
    val newPassword: String
)

data class ExportDataResponse(
    val account: Map<String, Any>,
    val tags: List<Tag>,
    val exportedAt: String
)

data class ProfileUpdateResponse(
    val message: String,
    val client: Client
)
