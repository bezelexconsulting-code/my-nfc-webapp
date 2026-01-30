package com.vinditscandit.nfctagmanager.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.lifecycle.lifecycleScope
import com.vinditscandit.nfctagmanager.R
import com.vinditscandit.nfctagmanager.databinding.ActivitySettingsBinding
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import com.vinditscandit.nfctagmanager.viewmodel.SettingsViewModel
import kotlinx.coroutines.launch

class SettingsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivitySettingsBinding
    private val viewModel: SettingsViewModel by viewModels {
        androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.getInstance(application)
    }
    private lateinit var prefsManager: PreferencesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        prefsManager = PreferencesManager(this)
        
        // Apply theme before setting content view
        applyTheme(prefsManager.isDarkMode())
        
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
        setupObservers()
        
        lifecycleScope.launch {
            viewModel.loadProfile()
        }
    }
    
    private fun applyTheme(isDark: Boolean) {
        AppCompatDelegate.setDefaultNightMode(
            if (isDark) AppCompatDelegate.MODE_NIGHT_YES
            else AppCompatDelegate.MODE_NIGHT_NO
        )
    }
    
    private fun setupUI() {
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
        
        // Setup dark mode switch
        binding.darkModeSwitch.isChecked = prefsManager.isDarkMode()
        binding.darkModeSwitch.setOnCheckedChangeListener { _, isChecked ->
            prefsManager.setDarkMode(isChecked)
            applyTheme(isChecked)
        }
        
        binding.saveProfileButton.setOnClickListener {
            saveProfile()
        }
        
        binding.changePasswordButton.setOnClickListener {
            showChangePasswordDialog()
        }
        
        binding.exportDataButton.setOnClickListener {
            exportData()
        }
        
        binding.deleteAccountButton.setOnClickListener {
            showDeleteAccountDialog()
        }
    }
    
    private fun setupObservers() {
        viewModel.profile.observe(this) { profile ->
            profile?.let {
                binding.nameInput.setText(it.name)
                binding.emailInput.setText(it.email ?: "")
            }
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) {
                android.view.View.VISIBLE
            } else {
                android.view.View.GONE
            }
        }
        
        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_LONG).show()
            }
        }
        
        viewModel.success.observe(this) { message ->
            message?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun saveProfile() {
        val name = binding.nameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        
        lifecycleScope.launch {
            viewModel.updateProfile(name, email)
        }
    }
    
    private fun showChangePasswordDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_change_password, null)
        val currentPassword = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.currentPasswordInput)
        val newPassword = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.newPasswordInput)
        val confirmPassword = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.confirmPasswordInput)
        
        AlertDialog.Builder(this)
            .setTitle("Change Password")
            .setView(dialogView)
            .setPositiveButton("Change") { _, _ ->
                val current = currentPassword.text.toString()
                val new = newPassword.text.toString()
                val confirm = confirmPassword.text.toString()
                
                if (new != confirm) {
                    Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                lifecycleScope.launch {
                    viewModel.changePassword(current, new)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun exportData() {
        lifecycleScope.launch {
            viewModel.exportData()
        }
    }
    
    private fun showDeleteAccountDialog() {
        AlertDialog.Builder(this)
            .setTitle("Delete Account")
            .setMessage("Are you sure you want to delete your account? This action cannot be undone and all your tags will be deleted.")
            .setPositiveButton("Delete") { _, _ ->
                AlertDialog.Builder(this)
                    .setTitle("Final Confirmation")
                    .setMessage("This is your final warning. All your data will be permanently deleted. Continue?")
                    .setPositiveButton("Yes, Delete") { _, _ ->
                        lifecycleScope.launch {
                            viewModel.deleteAccount()
                            // Logout and return to login
                            com.vinditscandit.nfctagmanager.data.ApiClient.setAuthToken(null)
                            prefsManager.clear()
                            val intent = Intent(this@SettingsActivity, LoginActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                            finish()
                        }
                    }
                    .setNegativeButton("Cancel", null)
                    .show()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
