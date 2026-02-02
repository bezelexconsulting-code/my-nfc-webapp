# Get SHA-1 from Android debug keystore
$keystorePath = "$env:USERPROFILE\.android\debug.keystore"
$password = "android"

if (-not (Test-Path $keystorePath)) {
    Write-Host "Debug keystore not found at: $keystorePath" -ForegroundColor Red
    Write-Host "You need to build your app first to generate the keystore." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nReading keystore from: $keystorePath" -ForegroundColor Cyan
Write-Host "This may take a moment..." -ForegroundColor Yellow

try {
    # Load the keystore
    $keystore = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($keystorePath, $password)
    
    # Get the SHA-1 thumbprint
    $sha1 = $keystore.Thumbprint
    
    # Format it with colons like Google expects
    $formattedSHA1 = ($sha1 -split '(.{2})' | Where-Object {$_}) -join ':'
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Your SHA-1 Certificate:" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host $formattedSHA1 -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nCopy the SHA-1 above and add it to your Google Cloud Console:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor White
    Write-Host "2. APIs & Services -> Credentials" -ForegroundColor White
    Write-Host "3. Click your Android OAuth client" -ForegroundColor White
    Write-Host "4. Click '+ ADD FINGERPRINT'" -ForegroundColor White
    Write-Host "5. Paste the SHA-1 above" -ForegroundColor White
    Write-Host "6. Click Save" -ForegroundColor White
    Write-Host "`n"
    
} catch {
    Write-Host "`nError reading keystore: $_" -ForegroundColor Red
    Write-Host "`nAlternative: Build your app in Android Studio first, then try again." -ForegroundColor Yellow
}
