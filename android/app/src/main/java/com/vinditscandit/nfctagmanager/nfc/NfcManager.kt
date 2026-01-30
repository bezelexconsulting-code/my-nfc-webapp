package com.vinditscandit.nfctagmanager.nfc

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.util.Log
import java.io.IOException

class NfcManager(private val activity: Activity) {
    
    private val nfcAdapter: NfcAdapter? = NfcAdapter.getDefaultAdapter(activity)
    
    fun isNfcAvailable(): Boolean {
        return nfcAdapter != null
    }
    
    fun isNfcEnabled(): Boolean {
        return nfcAdapter?.isEnabled == true
    }
    
    fun enableForegroundDispatch(pendingIntent: PendingIntent) {
        nfcAdapter?.enableForegroundDispatch(activity, pendingIntent, null, null)
    }
    
    fun disableForegroundDispatch() {
        nfcAdapter?.disableForegroundDispatch(activity)
    }
    
    fun writeUrlToTag(tag: Tag, url: String): Boolean {
        return try {
            val ndef = Ndef.get(tag)
            
            if (ndef != null) {
                // Tag supports NDEF
                ndef.connect()
                
                val urlRecord = createUrlRecord(url)
                val message = NdefMessage(arrayOf(urlRecord))
                
                // Check if tag is writable
                if (!ndef.isWritable) {
                    Log.e("NfcManager", "Tag is not writable")
                    return false
                }
                
                // Check available space
                if (ndef.maxSize < message.byteArrayLength) {
                    Log.e("NfcManager", "Tag doesn't have enough space")
                    return false
                }
                
                // Write the message
                ndef.writeNdefMessage(message)
                ndef.close()
                true
            } else {
                // Tag doesn't support NDEF, try to format it
                val formatable = NdefFormatable.get(tag)
                if (formatable != null) {
                    formatable.connect()
                    val urlRecord = createUrlRecord(url)
                    val message = NdefMessage(arrayOf(urlRecord))
                    formatable.format(message)
                    formatable.close()
                    true
                } else {
                    Log.e("NfcManager", "Tag doesn't support NDEF or formatting")
                    false
                }
            }
        } catch (e: IOException) {
            Log.e("NfcManager", "Error writing to tag", e)
            false
        } catch (e: Exception) {
            Log.e("NfcManager", "Unexpected error", e)
            false
        }
    }
    
    private fun createUrlRecord(url: String): NdefRecord {
        val urlBytes = url.toByteArray(Charsets.UTF_8)
        val payload = ByteArray(1 + urlBytes.size)
        payload[0] = 0x01.toByte() // Prefix code for https://
        System.arraycopy(urlBytes, 0, payload, 1, urlBytes.size)
        
        return NdefRecord(
            NdefRecord.TNF_WELL_KNOWN,
            NdefRecord.RTD_URI,
            ByteArray(0),
            payload
        )
    }
    
    fun getTagFromIntent(intent: Intent): Tag? {
        return intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
    }
}
