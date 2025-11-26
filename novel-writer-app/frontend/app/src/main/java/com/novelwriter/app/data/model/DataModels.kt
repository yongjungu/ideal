package com.novelwriter.app.data.model

import com.google.gson.annotations.SerializedName

// 基础响应模型
data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
)

data class BaseResponse(
    @SerializedName("message") val message: String? = null
)

// 用户相关模型
data class User(
    @SerializedName("id") val id: String,
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("isVerified") val isVerified: Boolean,
    @SerializedName("profile") val profile: UserProfile? = null,
    @SerializedName("preferences") val preferences: UserPreferences? = null,
    @SerializedName("subscription") val subscription: String,
    @SerializedName("usageStats") val usageStats: UsageStats,
    @SerializedName("createdAt") val createdAt: String
)

data class UserProfile(
    @SerializedName("nickname") val nickname: String? = null,
    @SerializedName("avatar") val avatar: String? = null,
    @SerializedName("bio") val bio: String? = null
)

data class UserPreferences(
    @SerializedName("writingStyle") val writingStyle: String? = null,
    @SerializedName("favoriteGenres") val favoriteGenres: List<String>? = null,
    @SerializedName("targetWordCount") val targetWordCount: Int? = null
)

data class UsageStats(
    @SerializedName("novelsCreated") val novelsCreated: Int,
    @SerializedName("chaptersGenerated") val chaptersGenerated: Int,
    @SerializedName("totalWords") val totalWords: Int
)

// 请求模型
data class RegisterRequest(
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class VerifyEmailRequest(
    @SerializedName("email") val email: String,
    @SerializedName("code") val code: String
)

data class ResendVerificationRequest(
    @SerializedName("email") val email: String
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UpdateProfileRequest(
    @SerializedName("nickname") val nickname: String? = null,
    @SerializedName("bio") val bio: String? = null,
    @SerializedName("writingStyle") val writingStyle: String? = null,
    @SerializedName("favoriteGenres") val favoriteGenres: List<String>? = null,
    @SerializedName("targetWordCount") val targetWordCount: Int? = null
)

data class ChangePasswordRequest(
    @SerializedName("currentPassword") val currentPassword: String,
    @SerializedName("newPassword") val newPassword: String
)

// 响应模型
data class RegisterResponse(
    @SerializedName("userId") val userId: String,
    @SerializedName("email") val email: String
)

data class AuthResponse(
    @SerializedName("token") val token: String,
    @SerializedName("user") val user: User
)

data class UserResponse(
    @SerializedName("user") val user: User
)

// 小说相关模型
data class Novel(
    @SerializedName("_id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String,
    @SerializedName("coreTheme") val coreTheme: String,
    @SerializedName("writingStyle") val writingStyle: String,
    @SerializedName("expectedLength") val expectedLength: String,
    @SerializedName("genre") val genre: String,
    @SerializedName("characters") val characters: List<Character>,
    @SerializedName("synopsis") val synopsis: String,
    @SerializedName("worldSetting") val worldSetting: String,
    @SerializedName("volumes") val volumes: List<Volume>,
    @SerializedName("outline") val outline: Outline? = null,
    @SerializedName("status") val status: String,
    @SerializedName("coverImage") val coverImage: String? = null,
    @SerializedName("tags") val tags: List<String>,
    @SerializedName("settings") val settings: NovelSettings,
    @SerializedName("stats") val stats: NovelStats,
    @SerializedName("isPublic") val isPublic: Boolean,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class Character(
    @SerializedName("name") val name: String,
    @SerializedName("role") val role: String,
    @SerializedName("description") val description: String,
    @SerializedName("personality") val personality: String? = null,
    @SerializedName("background") val background: String? = null,
    @SerializedName("goals") val goals: String? = null
)

data class Volume(
    @SerializedName("_id") val id: String? = null,
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String,
    @SerializedName("volumeIndex") val volumeIndex: Int,
    @SerializedName("chapters") val chapters: List<Chapter>,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
)

data class Chapter(
    @SerializedName("_id") val id: String? = null,
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String,
    @SerializedName("summary") val summary: String,
    @SerializedName("chapterIndex") val chapterIndex: Int,
    @SerializedName("wordCount") val wordCount: Int,
    @SerializedName("isGenerated") val isGenerated: Boolean,
    @SerializedName("generationPrompt") val generationPrompt: String? = null,
    @SerializedName("editedContent") val editedContent: String? = null,
    @SerializedName("status") val status: String,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
)

data class Outline(
    @SerializedName("title") val title: String? = null,
    @SerializedName("core_theme") val coreTheme: String? = null,
    @SerializedName("characters") val characters: List<Character>? = null,
    @SerializedName("synopsis") val synopsis: String? = null,
    @SerializedName("volumes") val volumes: List<OutlineVolume>? = null,
    @SerializedName("world_setting") val worldSetting: String? = null
)

data class OutlineVolume(
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String,
    @SerializedName("chapters") val chapters: List<OutlineChapter>
)

data class OutlineChapter(
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String
)

data class NovelSettings(
    @SerializedName("targetWordCount") val targetWordCount: Int? = null,
    @SerializedName("chaptersPerVolume") val chaptersPerVolume: Int,
    @SerializedName("aiModel") val aiModel: String,
    @SerializedName("customModelUrl") val customModelUrl: String? = null
)

data class NovelStats(
    @SerializedName("totalVolumes") val totalVolumes: Int,
    @SerializedName("totalChapters") val totalChapters: Int,
    @SerializedName("totalWords") val totalWords: Int,
    @SerializedName("lastUpdated") val lastUpdated: String
)

// 小说请求模型
data class GenerateOutlineRequest(
    @SerializedName("theme") val theme: String,
    @SerializedName("style") val style: String,
    @SerializedName("length") val length: String,
    @SerializedName("volumeCount") val volumeCount: Int,
    @SerializedName("genre") val genre: String,
    @SerializedName("model") val model: String = "openai"
)

data class CreateNovelRequest(
    @SerializedName("title") val title: String,
    @SerializedName("coreTheme") val coreTheme: String,
    @SerializedName("writingStyle") val writingStyle: String,
    @SerializedName("expectedLength") val expectedLength: String,
    @SerializedName("genre") val genre: String,
    @SerializedName("characters") val characters: List<Character>? = null,
    @SerializedName("synopsis") val synopsis: String? = null,
    @SerializedName("worldSetting") val worldSetting: String? = null,
    @SerializedName("volumes") val volumes: List<Volume>? = null
)

data class UpdateNovelRequest(
    @SerializedName("title") val title: String? = null,
    @SerializedName("coreTheme") val coreTheme: String? = null,
    @SerializedName("writingStyle") val writingStyle: String? = null,
    @SerializedName("expectedLength") val expectedLength: String? = null,
    @SerializedName("genre") val genre: String? = null,
    @SerializedName("characters") val characters: List<Character>? = null,
    @SerializedName("synopsis") val synopsis: String? = null,
    @SerializedName("worldSetting") val worldSetting: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("isPublic") val isPublic: Boolean? = null
)

data class AddVolumeRequest(
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String
)

data class AddChapterRequest(
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String
)

// 章节请求模型
data class GenerateChapterRequest(
    @SerializedName("novelId") val novelId: String,
    @SerializedName("volumeIndex") val volumeIndex: Int,
    @SerializedName("chapterIndex") val chapterIndex: Int,
    @SerializedName("targetWords") val targetWords: Int = 1500,
    @SerializedName("model") val model: String = "openai"
)

data class EditChapterRequest(
    @SerializedName("novelId") val novelId: String,
    @SerializedName("volumeIndex") val volumeIndex: Int,
    @SerializedName("chapterIndex") val chapterIndex: Int,
    @SerializedName("model") val model: String = "openai"
)

data class UpdateChapterRequest(
    @SerializedName("content") val content: String? = null,
    @SerializedName("title") val title: String? = null,
    @SerializedName("summary") val summary: String? = null,
    @SerializedName("status") val status: String? = null
)

// 响应模型
data class NovelsResponse(
    @SerializedName("novels") val novels: List<Novel>,
    @SerializedName("total") val total: Int
)

data class NovelResponse(
    @SerializedName("novel") val novel: Novel
)

data class GenerateOutlineResponse(
    @SerializedName("novel") val novel: Novel
)

data class VolumeResponse(
    @SerializedName("volume") val volume: Volume
)

data class ChapterResponse(
    @SerializedName("chapter") val chapter: Chapter
)

data class GenerateChapterResponse(
    @SerializedName("chapter") val chapter: Chapter
)

data class EditChapterResponse(
    @SerializedName("chapter") val chapter: Chapter
)

data class AIModel(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String
)

data class AIModelsResponse(
    @SerializedName("models") val models: List<AIModel>
)
