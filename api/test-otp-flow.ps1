$registerData = @{
    email = "testuser@example.com"
    password = "TestPassword123!"
    name = "Test User"
    role = "staff"
}

Write-Host ""
Write-Host "=== STEP 1: Register User ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/auth/register" `
        -Method POST `
        -Body ($registerData | ConvertTo-Json) `
        -ContentType "application/json"
    Write-Host "[OK] Registration successful!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "[ERROR] Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host ""
Write-Host "=== STEP 2: Request Password Reset OTP ===" -ForegroundColor Cyan
Start-Sleep -Seconds 2
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/auth/request-password-reset-otp" `
        -Method POST `
        -Body '{"email":"testuser@example.com"}' `
        -ContentType "application/json"
    Write-Host "[OK] OTP request successful!" -ForegroundColor Green
    $response | ConvertTo-Json
    Write-Host ""
    Write-Host "Check your email (testuser@example.com or yashnimse92@gmail.com) for the OTP!" -ForegroundColor Yellow
} catch {
    Write-Host "[ERROR] OTP request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host ""
Write-Host "=== STEP 3: Enter OTP ===" -ForegroundColor Cyan
$otp = Read-Host "Enter the 6-digit OTP from email"

if ($otp -and $otp.Length -eq 6) {
    try {
        $verifyData = @{
            email = "testuser@example.com"
            otp = $otp
        }
        $response = Invoke-RestMethod -Uri "http://localhost:4000/auth/verify-otp" `
            -Method POST `
            -Body ($verifyData | ConvertTo-Json) `
            -ContentType "application/json"
        Write-Host "[OK] OTP verified successfully!" -ForegroundColor Green
        $resetToken = $response.data.resetToken
        Write-Host "Reset Token: $resetToken" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host ""
        Write-Host "=== STEP 4: Reset Password ===" -ForegroundColor Cyan
        $newPassword = "NewPassword123!"
        $resetData = @{
            resetToken = $resetToken
            email = "testuser@example.com"
            newPassword = $newPassword
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:4000/auth/reset-password-otp" `
            -Method POST `
            -Body ($resetData | ConvertTo-Json) `
            -ContentType "application/json"
        Write-Host "[OK] Password reset successful!" -ForegroundColor Green
        $response | ConvertTo-Json
        Write-Host ""
        Write-Host "OTP Password Reset Flow Complete!" -ForegroundColor Magenta
        Write-Host "New password: $newPassword" -ForegroundColor Yellow
        
    } catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message
        }
    }
} else {
    Write-Host "[ERROR] Invalid OTP. Skipping verification." -ForegroundColor Red
}
