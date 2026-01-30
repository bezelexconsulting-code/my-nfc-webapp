package com.vinditscandit.nfctagmanager.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.LinearLayoutManager
import com.vinditscandit.nfctagmanager.R
import com.vinditscandit.nfctagmanager.databinding.ActivityTagSelectionBinding
import com.vinditscandit.nfctagmanager.data.Tag
import com.vinditscandit.nfctagmanager.viewmodel.TagSelectionViewModel
import kotlinx.coroutines.launch

class TagSelectionActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityTagSelectionBinding
    private val viewModel: TagSelectionViewModel by viewModels {
        androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.getInstance(application)
    }
    private lateinit var adapter: TagAdapter
    private var bulkMode = false
    private val selectedTags = mutableSetOf<Int>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTagSelectionBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupRecyclerView()
        setupObservers()
        
        lifecycleScope.launch {
            viewModel.loadTags()
        }
    }
    
    private fun setupRecyclerView() {
        adapter = TagAdapter(
            onTagClick = { tag ->
                if (bulkMode) {
                    toggleTagSelection(tag.id)
                } else {
                    val resultIntent = Intent()
                    resultIntent.putExtra("tag_id", tag.id)
                    setResult(RESULT_OK, resultIntent)
                    finish()
                }
            },
            onTagEdit = { tag ->
                if (!bulkMode) {
                    val intent = Intent(this, TagEditActivity::class.java)
                    intent.putExtra("tag_id", tag.id)
                    startActivity(intent)
                }
            },
            onTagSelect = { tagId, selected ->
                if (selected) {
                    selectedTags.add(tagId)
                } else {
                    selectedTags.remove(tagId)
                }
                updateBulkActionsBar()
            },
            isBulkMode = { bulkMode },
            isTagSelected = { tagId -> selectedTags.contains(tagId) }
        )
        
        binding.tagsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.tagsRecyclerView.adapter = adapter
        
        // Setup create tag button
        binding.createTagButton.setOnClickListener {
            val intent = Intent(this, TagEditActivity::class.java)
            intent.putExtra("tag_id", -1) // -1 indicates create mode
            startActivityForResult(intent, 100)
        }
        
        // Setup register first tag button in empty state
        binding.registerFirstTagButton.setOnClickListener {
            val intent = Intent(this, TagEditActivity::class.java)
            intent.putExtra("tag_id", -1) // -1 indicates create mode
            startActivityForResult(intent, 100)
        }
        
        // Setup bulk mode button
        binding.bulkModeButton.setOnClickListener {
            toggleBulkMode()
        }
        
        // Setup delete button
        binding.deleteSelectedButton.setOnClickListener {
            deleteSelectedTags()
        }
    }
    
    private fun toggleBulkMode() {
        bulkMode = !bulkMode
        selectedTags.clear()
        binding.bulkActionsBar.visibility = if (bulkMode) android.view.View.VISIBLE else android.view.View.GONE
        binding.bulkModeButton.text = if (bulkMode) "Cancel" else "Select"
        adapter.notifyDataSetChanged()
    }
    
    private fun toggleTagSelection(tagId: Int) {
        if (selectedTags.contains(tagId)) {
            selectedTags.remove(tagId)
        } else {
            selectedTags.add(tagId)
        }
        updateBulkActionsBar()
        adapter.notifyDataSetChanged()
    }
    
    private fun updateBulkActionsBar() {
        val count = selectedTags.size
        binding.selectedCountText.text = "$count selected"
        binding.deleteSelectedButton.isEnabled = count > 0
    }
    
    private fun deleteSelectedTags() {
        if (selectedTags.isEmpty()) return
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Delete Tags")
            .setMessage("Are you sure you want to delete ${selectedTags.size} tag(s)?")
            .setPositiveButton("Delete") { _, _ ->
                viewModel.deleteTags(selectedTags.toList())
                selectedTags.clear()
                toggleBulkMode()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun setupObservers() {
        viewModel.tags.observe(this) { tags ->
            if (tags.isEmpty()) {
                binding.emptyStateLayout.visibility = android.view.View.VISIBLE
                binding.tagsRecyclerView.visibility = android.view.View.GONE
                binding.searchInputLayout.visibility = android.view.View.GONE
                binding.sortSpinner.visibility = android.view.View.GONE
            } else {
                binding.emptyStateLayout.visibility = android.view.View.GONE
                binding.tagsRecyclerView.visibility = android.view.View.VISIBLE
                binding.searchInputLayout.visibility = android.view.View.VISIBLE
                binding.sortSpinner.visibility = android.view.View.VISIBLE
                adapter.submitList(tags)
            }
        }
        
        viewModel.filteredTags.observe(this) { filteredTags ->
            adapter.submitList(filteredTags)
        }
        
        // Setup search
        val searchInput = binding.searchInput
        searchInput.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.searchTags(s.toString())
            }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })
        
        // Setup sort spinner
        val sortSpinner = binding.sortSpinner
        val sortOptions = arrayOf("Name", "Newest First", "Recently Updated")
        val spinnerAdapter = android.widget.ArrayAdapter(this, android.R.layout.simple_spinner_item, sortOptions)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        sortSpinner.adapter = spinnerAdapter
        sortSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                when (position) {
                    0 -> viewModel.sortTags("name")
                    1 -> viewModel.sortTags("dateCreated")
                    2 -> viewModel.sortTags("dateUpdated")
                }
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
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
                android.widget.Toast.makeText(this, it, android.widget.Toast.LENGTH_LONG).show()
            }
        }
    }
}

class TagAdapter(
    private val onTagClick: (Tag) -> Unit,
    private val onTagEdit: (Tag) -> Unit,
    private val onTagSelect: (Int, Boolean) -> Unit,
    private val isBulkMode: () -> Boolean,
    private val isTagSelected: (Int) -> Boolean
) : androidx.recyclerview.widget.ListAdapter<Tag, TagAdapter.TagViewHolder>(TagDiffCallback()) {
    
    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): TagViewHolder {
        val binding = com.vinditscandit.nfctagmanager.databinding.ItemTagBinding.inflate(
            android.view.LayoutInflater.from(parent.context),
            parent,
            false
        )
        return TagViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: TagViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    inner class TagViewHolder(
        private val binding: com.vinditscandit.nfctagmanager.databinding.ItemTagBinding
    ) : androidx.recyclerview.widget.RecyclerView.ViewHolder(binding.root) {
        
        fun bind(tag: Tag) {
            binding.tagName.text = tag.name ?: tag.slug
            
            // Format date added (if available)
            binding.tagDateAdded.text = "Added recently"
            
            // Show contact details
            if (!tag.phone1.isNullOrEmpty()) {
                binding.phone1Layout.visibility = android.view.View.VISIBLE
                binding.tagPhone1.text = tag.phone1
            } else {
                binding.phone1Layout.visibility = android.view.View.GONE
            }
            
            if (!tag.phone2.isNullOrEmpty()) {
                binding.phone2Layout.visibility = android.view.View.VISIBLE
                binding.tagPhone2.text = tag.phone2
            } else {
                binding.phone2Layout.visibility = android.view.View.GONE
            }
            
            if (!tag.address.isNullOrEmpty()) {
                binding.addressLayout.visibility = android.view.View.VISIBLE
                binding.tagAddress.text = tag.address
            } else {
                binding.addressLayout.visibility = android.view.View.GONE
            }
            
            if (!tag.instructions.isNullOrEmpty()) {
                binding.instructionsLayout.visibility = android.view.View.VISIBLE
                binding.tagInstructions.text = tag.instructions
            } else {
                binding.instructionsLayout.visibility = android.view.View.GONE
            }
            
            val bulkModeActive = isBulkMode()
            binding.selectCheckbox.visibility = if (bulkModeActive) android.view.View.VISIBLE else android.view.View.GONE
            binding.editButton.visibility = if (bulkModeActive) android.view.View.GONE else android.view.View.VISIBLE
            binding.writeToTagButton.visibility = if (bulkModeActive) android.view.View.GONE else android.view.View.VISIBLE
            
            if (bulkModeActive) {
                binding.selectCheckbox.isChecked = isTagSelected(tag.id)
                binding.selectCheckbox.setOnCheckedChangeListener { _, isChecked ->
                    onTagSelect(tag.id, isChecked)
                }
            }
            
            binding.root.setOnClickListener {
                if (!bulkModeActive) {
                    onTagClick(tag)
                }
            }
            
            binding.editButton.setOnClickListener {
                onTagEdit(tag)
            }
            
            binding.writeToTagButton.setOnClickListener {
                // Return tag for writing
                onTagClick(tag)
            }
        }
    }
}

class TagDiffCallback : androidx.recyclerview.widget.DiffUtil.ItemCallback<Tag>() {
    override fun areItemsTheSame(oldItem: Tag, newItem: Tag): Boolean {
        return oldItem.id == newItem.id
    }
    
    override fun areContentsTheSame(oldItem: Tag, newItem: Tag): Boolean {
        return oldItem == newItem
    }
}
