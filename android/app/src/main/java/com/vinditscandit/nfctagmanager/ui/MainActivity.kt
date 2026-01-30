package com.vinditscandit.nfctagmanager.ui

import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.lifecycle.lifecycleScope
import com.vinditscandit.nfctagmanager.R
import com.vinditscandit.nfctagmanager.data.ApiClient
import com.vinditscandit.nfctagmanager.databinding.ActivityMainBinding
import com.vinditscandit.nfctagmanager.data.Tag
import com.vinditscandit.nfctagmanager.nfc.NfcManager
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import com.vinditscandit.nfctagmanager.viewmodel.MainViewModel
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels {
        androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.getInstance(application)
    }
    private lateinit var nfcManager: NfcManager
    private lateinit var prefsManager: PreferencesManager
    
    private var selectedTag: Tag? = null
    private var pendingTagWrite: android.nfc.Tag? = null
    
    private val pendingIntent: PendingIntent by lazy {
        PendingIntent.getActivity(
            this,
            0,
            Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_MUTABLE
        )
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Apply theme before setting content view
        prefsManager = PreferencesManager(this)
        AppCompatDelegate.setDefaultNightMode(
            if (prefsManager.isDarkMode()) AppCompatDelegate.MODE_NIGHT_YES
            else AppCompatDelegate.MODE_NIGHT_NO
        )
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        nfcManager = NfcManager(this)
        
        // Restore auth token for API calls (Google sign-in)
        ApiClient.setAuthToken(prefsManager.getAuthToken())

        // Check if user is logged in (password or Google token)
        val hasPassword = prefsManager.getUsername() != null && prefsManager.getPassword() != null
        val hasToken = prefsManager.getAuthToken() != null
        if (!hasPassword && !hasToken) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        
        setupUI()
        setupObservers()
        checkNfcAvailability()
        
        // Handle NFC intent if app was launched from NFC tag
        handleNfcIntent(intent)
    }
    
    private fun setupUI() {
        val clientName = prefsManager.getClientName() ?: "User"
        binding.welcomeText.text = "Welcome, $clientName"
        
        binding.selectTagButton.setOnClickListener {
            val intent = Intent(this, TagSelectionActivity::class.java)
            startActivityForResult(intent, REQUEST_SELECT_TAG)
        }
        
        binding.createTagButton.setOnClickListener {
            val intent = Intent(this, TagEditActivity::class.java)
            intent.putExtra("tag_id", -1) // -1 indicates create mode
            startActivityForResult(intent, REQUEST_EDIT_TAG)
        }
        
        binding.logoutButton.setOnClickListener {
            showLogoutDialog()
        }
        
        binding.helpButton.setOnClickListener {
            showHelpDialog()
        }
        
        binding.orderNowButton.setOnClickListener {
            val webUrl = "https://vinditscandit.co.za/"
            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(webUrl))
            startActivity(intent)
        }
    }
    
    private fun setupObservers() {
        viewModel.tags.observe(this) { tags ->
            // Update tag count
            binding.totalTagsCount.text = tags.size.toString()
            
            // Show/hide tag ad section (show when 0-2 tags)
            if (tags.isEmpty() || tags.size <= 2) {
                binding.tagAdSection.visibility = android.view.View.VISIBLE
            } else {
                binding.tagAdSection.visibility = android.view.View.GONE
            }
            
            if (tags.isNotEmpty()) {
                // Auto-select first tag if none selected
                if (selectedTag == null) {
                    selectedTag = tags.first()
                    updateSelectedTagUI()
                } else {
                    // Update selected tag if it exists in the list
                    val updatedTag = tags.find { it.id == selectedTag?.id }
                    updatedTag?.let {
                        selectedTag = it
                        updateSelectedTagUI()
                    }
                }
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
    }
    
    private fun checkNfcAvailability() {
        if (!nfcManager.isNfcAvailable()) {
            binding.nfcStatusText.text = getString(R.string.nfc_not_available)
            binding.writeButton.isEnabled = false
            showNfcErrorModal("NFC is not supported on this device")
            return
        }
        
        if (!nfcManager.isNfcEnabled()) {
            binding.nfcStatusText.text = getString(R.string.nfc_disabled)
            binding.writeButton.isEnabled = false
            showEnableNfcDialog()
        } else {
            binding.nfcStatusText.text = getString(R.string.tap_nfc_tag)
            binding.writeButton.isEnabled = selectedTag != null
        }
    }
    
    private fun showEnableNfcDialog() {
        showNfcErrorModal("NFC is disabled. Please enable NFC in your device settings to write tags.", "Open Settings") {
            startActivity(Intent(android.provider.Settings.ACTION_NFC_SETTINGS))
        }
    }
    
    private fun showNfcErrorModal(message: String, buttonText: String = "Close", onButtonClick: (() -> Unit)? = null) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_nfc_error, null)
        
        val titleView = dialogView.findViewById<android.widget.TextView>(R.id.errorTitle)
        val messageView = dialogView.findViewById<android.widget.TextView>(R.id.errorMessage)
        val closeButton = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.closeButton)
        
        titleView.text = "Error"
        messageView.text = message
        closeButton.text = buttonText
        
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        
        closeButton.setOnClickListener {
            onButtonClick?.invoke()
            dialog.dismiss()
        }
        
        dialog.show()
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_SELECT_TAG && resultCode == RESULT_OK) {
            val tagId = data?.getIntExtra("tag_id", -1) ?: -1
            if (tagId != -1) {
                lifecycleScope.launch {
                    viewModel.loadTag(tagId)?.let { tag ->
                        selectedTag = tag
                        updateSelectedTagUI()
                    }
                }
            }
        }
        // Refresh tags if coming back from edit
        if (requestCode == REQUEST_EDIT_TAG && resultCode == RESULT_OK) {
            lifecycleScope.launch {
                viewModel.loadTags()
                selectedTag?.id?.let { tagId ->
                    viewModel.loadTag(tagId)?.let { updatedTag ->
                        selectedTag = updatedTag
                        updateSelectedTagUI()
                    }
                }
            }
        }
    }
    
    private fun updateSelectedTagUI() {
        selectedTag?.let { tag ->
            binding.selectedTagName.text = tag.name ?: tag.slug
            binding.selectedTagSlug.text = tag.slug
            binding.writeButton.isEnabled = nfcManager.isNfcEnabled()
            binding.selectedTagCard.alpha = 1.0f
        } ?: run {
            binding.selectedTagName.text = "No tag selected"
            binding.selectedTagSlug.text = ""
            binding.writeButton.isEnabled = false
        }
    }
    
    override fun onResume() {
        super.onResume()
        if (nfcManager.isNfcEnabled()) {
            nfcManager.enableForegroundDispatch(pendingIntent)
        }
        
        // Load tags if not already loaded
        if (viewModel.tags.value.isNullOrEmpty()) {
            lifecycleScope.launch {
                viewModel.loadTags()
            }
        } else {
            // Update tag count if tags are already loaded
            viewModel.tags.value?.let { tags ->
                binding.totalTagsCount.text = tags.size.toString()
            }
        }
    }
    
    override fun onPause() {
        super.onPause()
        nfcManager.disableForegroundDispatch()
    }
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNfcIntent(intent)
    }
    
    private fun handleNfcIntent(intent: Intent) {
        if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action) {
            
            val tag = nfcManager.getTagFromIntent(intent)
            if (tag != null && selectedTag != null) {
                writeToTag(tag)
            } else if (tag != null) {
                // Tag tapped but no tag selected - save for later
                pendingTagWrite = tag
                Toast.makeText(
                    this,
                    "Please select a tag profile first",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun writeToTag(tag: android.nfc.Tag) {
        selectedTag?.let { selectedTag ->
            val baseUrl = "https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app"
            val tagUrl = "$baseUrl/public-tag/${selectedTag.slug}"
            
            binding.writeButton.isEnabled = false
            binding.statusText.text = getString(R.string.writing_to_tag)
            
            // Write in background thread
            Thread {
                val success = nfcManager.writeUrlToTag(tag, tagUrl)
                
                runOnUiThread {
                    binding.writeButton.isEnabled = true
                    if (success) {
                        binding.statusText.text = getString(R.string.write_success)
                        Toast.makeText(this, getString(R.string.write_success), Toast.LENGTH_LONG).show()
                    } else {
                        binding.statusText.text = getString(R.string.write_failed)
                        showNfcErrorModal("Failed to write to NFC tag. Please try again.")
                    }
                }
            }.start()
        }
    }
    
    
    private fun showHelpDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_help, null)
        val closeButton = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.closeHelpButton)
        
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        
        closeButton.setOnClickListener {
            dialog.dismiss()
        }
        
        dialog.show()
    }
    
    private fun showLogoutDialog() {
        AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Logout") { _, _ ->
                ApiClient.setAuthToken(null)
                prefsManager.clear()
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    companion object {
        private const val REQUEST_SELECT_TAG = 1001
        private const val REQUEST_EDIT_TAG = 1002
    }
}
