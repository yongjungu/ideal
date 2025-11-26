package com.novelwriter.app.api

import com.novelwriter.app.data.model.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface ApiService {
    
    // 认证相关接口
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<RegisterResponse>
    
    @POST("auth/verify-email")
    suspend fun verifyEmail(@Body request: VerifyEmailRequest): ApiResponse<AuthResponse>
    
    @POST("auth/resend-verification")
    suspend fun resendVerification(@Body request: ResendVerificationRequest): ApiResponse<BaseResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<UserResponse>
    
    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): ApiResponse<UserResponse>
    
    @PUT("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): ApiResponse<BaseResponse>
    
    // 小说相关接口
    @GET("novels")
    suspend fun getNovels(): ApiResponse<NovelsResponse>
    
    @GET("novels/{id}")
    suspend fun getNovel(@Path("id") id: String): ApiResponse<NovelResponse>
    
    @POST("novels/generate-outline")
    suspend fun generateNovelOutline(@Body request: GenerateOutlineRequest): ApiResponse<GenerateOutlineResponse>
    
    @POST("novels")
    suspend fun createNovel(@Body request: CreateNovelRequest): ApiResponse<NovelResponse>
    
    @PUT("novels/{id}")
    suspend fun updateNovel(@Path("id") id: String, @Body request: UpdateNovelRequest): ApiResponse<NovelResponse>
    
    @DELETE("novels/{id}")
    suspend fun deleteNovel(@Path("id") id: String): ApiResponse<BaseResponse>
    
    @POST("novels/{id}/volumes")
    suspend fun addVolume(@Path("id") id: String, @Body request: AddVolumeRequest): ApiResponse<VolumeResponse>
    
    @POST("novels/{id}/volumes/{volumeIndex}/chapters")
    suspend fun addChapter(
        @Path("id") id: String,
        @Path("volumeIndex") volumeIndex: Int,
        @Body request: AddChapterRequest
    ): ApiResponse<ChapterResponse>
    
    // 章节相关接口
    @POST("chapters/generate")
    suspend fun generateChapter(@Body request: GenerateChapterRequest): ApiResponse<GenerateChapterResponse>
    
    @POST("chapters/edit")
    suspend fun editChapter(@Body request: EditChapterRequest): ApiResponse<EditChapterResponse>
    
    @PUT("chapters/{novelId}/volumes/{volumeIndex}/chapters/{chapterIndex}")
    suspend fun updateChapter(
        @Path("novelId") novelId: String,
        @Path("volumeIndex") volumeIndex: Int,
        @Path("chapterIndex") chapterIndex: Int,
        @Body request: UpdateChapterRequest
    ): ApiResponse<ChapterResponse>
    
    @GET("chapters/{novelId}/volumes/{volumeIndex}/chapters/{chapterIndex}")
    suspend fun getChapter(
        @Path("novelId") novelId: String,
        @Path("volumeIndex") volumeIndex: Int,
        @Path("chapterIndex") chapterIndex: Int
    ): ApiResponse<ChapterResponse>
    
    @DELETE("chapters/{novelId}/volumes/{volumeIndex}/chapters/{chapterIndex}")
    suspend fun deleteChapter(
        @Path("novelId") novelId: String,
        @Path("volumeIndex") volumeIndex: Int,
        @Path("chapterIndex") chapterIndex: Int
    ): ApiResponse<BaseResponse>
    
    @GET("chapters/ai-models")
    suspend fun getAIModels(): ApiResponse<AIModelsResponse>
}

object ApiClient {
    private const val BASE_URL = "http://106.13.133.23:3389/api/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val original = chain.request()
            val requestBuilder = original.newBuilder()
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
            
            // 添加认证令牌
            val token = TokenManager.getToken()
            if (!token.isNullOrEmpty()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }
            
            val request = requestBuilder.build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

object TokenManager {
    private var token: String? = null
    
    fun setToken(newToken: String) {
        token = newToken
    }
    
    fun getToken(): String? {
        return token
    }
    
    fun clearToken() {
        token = null
    }
}
