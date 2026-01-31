package com.vinditscandit.nfctagmanager.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.vinditscandit.nfctagmanager.BuildConfig
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.databinding.ActivityRegisterBinding
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import com.vinditscandit.nfctagmanager.viewmodel.RegisterViewModel

@Suppress("DEPRECATION")
class RegisterActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: RegisterViewModel by viewModels()
    private lateinit var prefsManager: PreferencesManager
    private lateinit var googleSignInClient: GoogleSignInClient
    
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            account?.idToken?.let { idToken ->
                viewModel.registerWithGoogle(idToken)
            } ?: run {
                Toast.makeText(this, "Failed to get Google ID token", Toast.LENGTH_SHORT).show()
            }
        } catch (e: ApiException) {
            Toast.makeText(this, "Google sign-up failed: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        prefsManager = PreferencesManager(this)
        initGoogleSignIn()
        
        setupObservers()
        setupClickListeners()
    }
    
    private fun setupObservers() {
        viewModel.registerResult.observe(this) { result ->
            when {
                result.isLoading -> {
                    binding.registerButton.isEnabled = false
                    binding.progressBar.visibility = android.view.View.VISIBLE
                }
                result.isSuccess -> {
                    binding.registerButton.isEnabled = true
                    binding.progressBar.visibility = android.view.View.GONE
                    
                    val data = result.data
                    if (data?.token != null) {
                        // Google sign-up: save token and client info
                        prefsManager.saveAuthToken(data.token)
                        ApiClient.setAuthToken(data.token)
                        data.client?.let { client ->
                            prefsManager.saveClientInfo(client.id, client.name, client.email)
                        }
                    } else {
                        // Email/password sign-up
                        val email = binding.emailInput.text.toString().trim()
                        val password = binding.passwordInput.text.toString()
                        data?.client?.let { client ->
                            prefsManager.saveCredentials(client.name, password)
                            prefsManager.saveClientInfo(client.id, client.name, client.email)
                        }
                    }
                    
                    Toast.makeText(this, "Account created successfully!", Toast.LENGTH_SHORT).show()
                    navigateToMain()
                }
                result.error != null -> {
                    binding.registerButton.isEnabled = true
                    binding.progressBar.visibility = android.view.View.GONE
                    Toast.makeText(
                        this,
                        result.error ?: "Registration failed",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
    
    private fun setupClickListeners() {
        binding.backButton.setOnClickListener {
            finish()
        }
        
        binding.registerButton.setOnClickListener {
            val name = binding.nameInput.text.toString().trim()
            val email = binding.emailInput.text.toString().trim()
            val password = binding.passwordInput.text.toString()
            val confirmPassword = binding.confirmPasswordInput.text.toString()
            
            // Validation
            if (email.isEmpty()) {
                Toast.makeText(this, "Please enter your email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(this, "Please enter a valid email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password.isEmpty()) {
                Toast.makeText(this, "Please enter a password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password.length < 8) {
                Toast.makeText(this, "Password must be at least 8 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            // Check password requirements
            val hasUppercase = password.any { it.isUpperCase() }
            val hasLowercase = password.any { it.isLowerCase() }
            val hasDigit = password.any { it.isDigit() }
            val hasSpecial = password.any { !it.isLetterOrDigit() }
            
            if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
                Toast.makeText(
                    this,
                    "Password must contain uppercase, lowercase, number, and special character",
                    Toast.LENGTH_LONG
                ).show()
                return@setOnClickListener
            }
            
            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            // Use email username as name if name is empty
            val finalName = if (name.isEmpty()) email.substringBefore("@") else name
            
            viewModel.register(finalName, email, password)
        }
        
        binding.googleSignUpButton.setOnClickListener {
            googleSignInLauncher.launch(googleSignInClient.signInIntent)
        }
        
        binding.loginLink.setOnClickListener {
            finish() // Go back to login screen
        }
    }
    
    private fun initGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(BuildConfig.GOOGLE_ANDROID_CLIENT_ID)
            .requestEmail()
            .build()
        
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }
    
    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
