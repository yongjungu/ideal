package com.novelwriter.app.ui.splash

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.novelwriter.app.R
import com.novelwriter.app.data.local.SharedPreferencesManager
import com.novelwriter.app.ui.MainActivity
import com.novelwriter.app.ui.auth.LoginActivity

class SplashActivity : AppCompatActivity() {
    
    private val splashDelay: Long = 2000 // 2秒延迟
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        
        // 检查用户是否已登录
        Handler(Looper.getMainLooper()).postDelayed({
            checkUserLoginStatus()
        }, splashDelay)
    }
    
    private fun checkUserLoginStatus() {
        val token = SharedPreferencesManager.getToken(this)
        
        if (token.isNullOrEmpty()) {
            // 未登录，跳转到登录页
            startActivity(Intent(this, LoginActivity::class.java))
        } else {
            // 已登录，跳转到主页面
            startActivity(Intent(this, MainActivity::class.java))
        }
        
        finish()
    }
}
