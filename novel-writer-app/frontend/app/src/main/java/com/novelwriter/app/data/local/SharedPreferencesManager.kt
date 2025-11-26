package com.novelwriter.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.novelwriter.app.data.model.User

object SharedPreferencesManager {
    
    private const val PREF_NAME = "novel_writer_prefs"
    private const val KEY_TOKEN = "token"
    private const val KEY_USER = "user"
    private const val KEY_IS_FIRST_LAUNCH = "is_first_launch"
    private const val KEY_AI_MODEL = "ai_model"
    
    private fun getSharedPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }
    
    // Token管理
    fun saveToken(context: Context, token: String) {
        getSharedPreferences(context).edit().putString(KEY_TOKEN, token).apply()
    }
    
    fun getToken(context: Context): String? {
        return getSharedPreferences(context).getString(KEY_TOKEN, null)
    }
    
    fun clearToken(context: Context) {
        getSharedPreferences(context).edit().remove(KEY_TOKEN).apply()
    }
    
    // 用户信息管理
    fun saveUser(context: Context, user: User) {
        val userJson = Gson().toJson(user)
        getSharedPreferences(context).edit().putString(KEY_USER, userJson).apply()
    }
    
    fun getUser(context: Context): User? {
        val userJson = getSharedPreferences(context).getString(KEY_USER, null)
        return if (userJson != null) {
            Gson().fromJson(userJson, User::class.java)
        } else {
            null
        }
    }
    
    fun clearUser(context: Context) {
        getSharedPreferences(context).edit().remove(KEY_USER).apply()
    }
    
    // 首次启动管理
    fun isFirstLaunch(context: Context): Boolean {
        return getSharedPreferences(context).getBoolean(KEY_IS_FIRST_LAUNCH, true)
    }
    
    fun setFirstLaunchCompleted(context: Context) {
        getSharedPreferences(context).edit().putBoolean(KEY_IS_FIRST_LAUNCH, false).apply()
    }
    
    // AI模型设置
    fun getAIModel(context: Context): String {
        return getSharedPreferences(context).getString(KEY_AI_MODEL, "openai") ?: "openai"
    }
    
    fun setAIModel(context: Context, model: String) {
        getSharedPreferences(context).edit().putString(KEY_AI_MODEL, model).apply()
    }
    
    // 清除所有数据（退出登录）
    fun clearAllData(context: Context) {
        getSharedPreferences(context).edit().clear().apply()
    }
    
    // 检查是否已登录
    fun isLoggedIn(context: Context): Boolean {
        return !getToken(context).isNullOrEmpty() && getUser(context) != null
    }
}
