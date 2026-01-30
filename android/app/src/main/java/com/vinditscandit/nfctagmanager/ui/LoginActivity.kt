package com.vinditscandit.nfctagmanager.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vinditscandit.nfctagmanager.databinding.ActivityLoginBinding
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import com.vinditscandit.nfctagmanager.viewmodel.LoginViewModel
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityLoginBinding
    private val viewModel: LoginViewModel by viewModels()
    private lateinit var prefsManager: PreferencesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        prefsManager = PreferencesManager(this)
        
        // Check if user is already logged in
        if (prefsManager.getUsername() != null && prefsManager.getPassword() != null) {
            navigateToMain()
            return
        }
        
        setupObservers()
        setupClickListeners()
    }
    
    private fun setupObservers() {
        viewModel.loginResult.observe(this) { result ->
            when {
                result.isLoading -> {
                    binding.loginButton.isEnabled = false
                    binding.progressBar.visibility = android.view.View.VISIBLE
                }
                result.isSuccess -> {
                    binding.loginButton.isEnabled = true
                    binding.progressBar.visibility = android.view.View.GONE
                    
                    val data = result.data
                    if (data?.token != null) {
                        // Google sign-in: save token and client info (no password)
                        prefsManager.saveAuthToken(data.token)
                        ApiClient.setAuthToken(data.token)
                        data.client?.let { client ->
                            prefsManager.saveClientInfo(client.id, client.name, client.email)
                        }
                    } else {
                        // Password sign-in
                        val username = binding.emailInput.text.toString().trim()
                        val password = binding.passwordInput.text.toString()
                        prefsManager.saveCredentials(username, password)
                        data?.client?.let { client ->
                            prefsManager.saveClientInfo(client.id, client.name, client.email)
                        }
                    }
                    
                    navigateToMain()
                }
                result.error != null -> {
                    binding.loginButton.isEnabled = true
                    binding.progressBar.visibility = android.view.View.GONE
                    Toast.makeText(
                        this,
                        result.error ?: "Login failed",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
    
    private fun setupClickListeners() {
        binding.loginButton.setOnClickListener {
            val username = binding.emailInput.text.toString().trim()
            val password = binding.passwordInput.text.toString()
            
            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            viewModel.login(username, password)
        }
        
        binding.registerLink.setOnClickListener {
            // Open registration URL in browser
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = android.net.Uri.parse("https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app/register")
            startActivity(intent)
        }
        
        binding.forgotPasswordLink.setOnClickListener {
            // Open forgot password URL in browser
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = android.net.Uri.parse("https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app/client/forgot-password")
            startActivity(intent)
        }

        binding.googleSignInButton?.setOnClickListener {
            val client = googleSignInClient
            if (client != null) {
                googleSignInLauncher.launch(client.signInIntent)
            } else {
                Toast.makeText(this, "Google Sign-In not configured", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
