package com.vinditscandit.nfctagmanager.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vinditscandit.nfctagmanager.R
import com.vinditscandit.nfctagmanager.databinding.ActivityTagEditBinding
import com.vinditscandit.nfctagmanager.data.Tag
import com.vinditscandit.nfctagmanager.utils.PreferencesManager
import com.vinditscandit.nfctagmanager.viewmodel.TagEditViewModel
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class TagEditActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityTagEditBinding
    private val viewModel: TagEditViewModel by viewModels {
        androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.getInstance(application)
    }
    private lateinit var prefsManager: PreferencesManager
    private var tag: Tag? = null
    
    private val imagePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                uploadImage(uri)
            }
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTagEditBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        prefsManager = PreferencesManager(this)
        
        // Get tag from intent - if -1, we're creating a new tag
        val tagId = intent.getIntExtra("tag_id", -1)
        val isCreating = tagId == -1
        
        setupUI(isCreating)
        setupObservers()
        
        if (isCreating) {
            // Set title for creating
            binding.toolbar.title = "Create New Tag"
        } else {
            // Load existing tag
            lifecycleScope.launch {
                viewModel.loadTag(tagId)
            }
        }
    }
    
    private fun setupUI(isCreating: Boolean = false) {
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
        
        // Slug input is now auto-generated, so always hide it
        binding.slugInputLayout.visibility = android.view.View.GONE
        // Show tag URL card only when editing
        binding.tagUrlCard.visibility = if (isCreating) android.view.View.GONE else android.view.View.VISIBLE
        
        // Setup copy URL button
        binding.copyUrlButton.setOnClickListener {
            val url = binding.tagUrlDisplay.text.toString()
            if (url.isNotEmpty()) {
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = android.content.ClipData.newPlainText("Tag URL", url)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this, "Tag URL copied to clipboard!", Toast.LENGTH_SHORT).show()
            }
        }
        
        // Setup tag URL display click to copy
        binding.tagUrlDisplay.setOnClickListener {
            binding.copyUrlButton.performClick()
        }
        
        
        binding.saveButton.setOnClickListener {
            if (isCreating) {
                createTag()
            } else {
                saveTag()
            }
        }
        
        binding.saveButton.text = if (isCreating) "Create Tag" else "Save Changes"
        
        binding.imageUploadButton.setOnClickListener {
            pickImage()
        }
        
        binding.removeImageButton.setOnClickListener {
            removeImage()
        }
    }
    
    private fun setupObservers() {
        viewModel.tag.observe(this) { loadedTag ->
            tag = loadedTag
            loadedTag?.let { populateForm(it) }
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) {
                android.view.View.VISIBLE
            } else {
                android.view.View.GONE
            }
            binding.saveButton.isEnabled = !isLoading
        }
        
        viewModel.error.observe(this) { error ->
            error?.let {
                // Show user-friendly error messages
                if (it.contains("already exists", ignoreCase = true)) {
                    // For duplicate slug errors, suggest changing the name
                    AlertDialog.Builder(this)
                        .setTitle("Tag Name Conflict")
                        .setMessage("$it\n\n💡 Try changing the tag name slightly to create a unique URL.")
                        .setPositiveButton("OK", null)
                        .show()
                } else {
                    Toast.makeText(this, it, Toast.LENGTH_LONG).show()
                }
            }
        }
        
        viewModel.success.observe(this) { success ->
            if (success) {
                val message = if (tag == null) "Tag created successfully" else "Tag updated successfully"
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
                
                // Show tag URL dialog for newly created tags
                if (tag == null) {
                    // Get slug from the created tag
                    val createdTag = viewModel.tag.value
                    val createdSlug = createdTag?.slug ?: ""
                    if (createdSlug.isNotEmpty()) {
                        showTagUrlDialog(createdSlug)
                    }
                }
                setResult(RESULT_OK)
                finish()
            }
        }
    }
    
    private fun populateForm(tag: Tag) {
        binding.nameInput.setText(tag.name ?: "")
        binding.phone1Input.setText(tag.phone1 ?: "")
        binding.phone2Input.setText(tag.phone2 ?: "")
        binding.addressInput.setText(tag.address ?: "")
        binding.instructionsInput.setText(tag.instructions ?: "")
        
        // Show tag URL
        val baseUrl = "https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app"
        val tagUrl = "$baseUrl/public-tag/${tag.slug}"
        binding.tagUrlDisplay.text = tagUrl
        
        // Show image if available
        tag.imageUrl?.let { imageUrl ->
            if (imageUrl.isNotEmpty()) {
                // Load image using Glide or similar (you'll need to add the dependency)
                binding.imagePreview.visibility = android.view.View.VISIBLE
                binding.removeImageButton.visibility = android.view.View.VISIBLE
                // For now, just show placeholder
                binding.imagePreview.setImageResource(android.R.drawable.ic_menu_gallery)
            }
        }
    }
    
    private fun pickImage() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        imagePickerLauncher.launch(intent)
    }
    
    private fun uploadImage(uri: Uri) {
        lifecycleScope.launch {
            viewModel.uploadImage(uri, this@TagEditActivity)
        }
    }
    
    private fun removeImage() {
        lifecycleScope.launch {
            viewModel.removeImage()
        }
    }
    
    
    private fun generateSlugFromName(name: String): String {
        if (name.isBlank()) {
            // Fallback for empty names
            return "tag-${System.currentTimeMillis().toString().takeLast(8)}"
        }
        
        var slug = name
            .lowercase()
            .trim()
            .replace(Regex("[^a-z0-9\\s-]"), "") // Remove special chars
            .replace(Regex("\\s+"), "-") // Replace spaces with hyphens
            .replace(Regex("-+"), "-") // Replace multiple hyphens with single
            .trim('-') // Remove leading/trailing hyphens
        
        // Ensure slug is not empty
        if (slug.isEmpty()) {
            slug = "tag-${System.currentTimeMillis().toString().takeLast(8)}"
        }
        
        // Add short random suffix for uniqueness (4 alphanumeric chars)
        val randomSuffix = (0..3).map { 
            "abcdefghijklmnopqrstuvwxyz0123456789".random() 
        }.joinToString("")
        
        return "$slug-$randomSuffix"
    }
    
    private fun createTag() {
        val name = binding.nameInput.text.toString().trim()
        
        // Generate slug automatically from name
        val slug = generateSlugFromName(name)
        
        viewModel.createTag(
            slug = slug,
            name = name.takeIf { it.isNotEmpty() },
            phone1 = binding.phone1Input.text.toString().trim().takeIf { it.isNotEmpty() },
            phone2 = binding.phone2Input.text.toString().trim().takeIf { it.isNotEmpty() },
            address = binding.addressInput.text.toString().trim().takeIf { it.isNotEmpty() },
            url = null, // URL field removed from UI
            instructions = binding.instructionsInput.text.toString().trim().takeIf { it.isNotEmpty() }
        )
    }
    
    private fun saveTag() {
        val name = binding.nameInput.text.toString().trim()
        val phone1 = binding.phone1Input.text.toString().trim()
        val phone2 = binding.phone2Input.text.toString().trim()
        val address = binding.addressInput.text.toString().trim()
        val instructions = binding.instructionsInput.text.toString().trim()
        
        tag?.let {
            lifecycleScope.launch {
                viewModel.updateTag(
                    it.id,
                    name,
                    phone1,
                    phone2,
                    address,
                    "", // URL field removed from UI
                    instructions
                )
            }
        }
    }
    
    private fun showTagUrlDialog(slug: String) {
        val baseUrl = "https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app"
        val tagUrl = "$baseUrl/public-tag/$slug"
        
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 24, 32, 16)
        }
        
        val titleView = TextView(this).apply {
            text = "🌐 Your Tag URL"
            textSize = 20f
            setTypeface(android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD))
            setPadding(0, 0, 0, 16)
        }
        
        val urlView = TextView(this).apply {
            text = tagUrl
            textSize = 14f
            setTypeface(android.graphics.Typeface.MONOSPACE)
            setPadding(16, 12, 16, 12)
            setBackgroundColor(ContextCompat.getColor(this@TagEditActivity, android.R.color.darker_gray))
            setTextColor(ContextCompat.getColor(this@TagEditActivity, android.R.color.white))
            setOnClickListener {
                // Copy to clipboard
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = android.content.ClipData.newPlainText("Tag URL", tagUrl)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this@TagEditActivity, "Tag URL copied to clipboard!", Toast.LENGTH_SHORT).show()
            }
        }
        
        val infoView = TextView(this).apply {
            text = "📋 Tap the URL above to copy it\n" +
                    "🔗 Share this URL with others\n" +
                    "📱 When someone taps your NFC tag, they'll visit this page!"
            textSize = 14f
            setPadding(0, 16, 0, 0)
        }
        
        dialogView.addView(titleView)
        dialogView.addView(urlView)
        dialogView.addView(infoView)
        
        AlertDialog.Builder(this)
            .setView(dialogView)
            .setPositiveButton("Got it! ✓") { _, _ -> }
            .setNeutralButton("Share") { _, _ ->
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, "Check out my NFC tag: $tagUrl")
                    putExtra(Intent.EXTRA_SUBJECT, "My NFC Tag")
                }
                startActivity(Intent.createChooser(shareIntent, "Share Tag URL"))
            }
            .show()
    }
}
