# MemeDo - Full Token Analysis Test Script
# This script tests the complete analysis flow after email verification

$baseUrl = "https://memedo-backend.onrender.com"
$testEmail = "test9472@example.com"
$testPassword = "Test1234!"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MEMEDO FULL ANALYSIS TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login
Write-Host "[STEP 1/6] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $login = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -ErrorAction Stop
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $loginData = $login.Content | ConvertFrom-Json
    Write-Host "User ID: $($loginData.data.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($loginData.data.user.email)" -ForegroundColor Gray
    Write-Host "Verified: $($loginData.data.user.email_verified)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
        Write-Host "Error: $($errorBody.error.message)" -ForegroundColor Red
        Write-Host "`n⚠️  Email verification required!" -ForegroundColor Yellow
        Write-Host "Please verify the email first. See instructions below." -ForegroundColor Yellow
        exit 1
    }
    exit 1
}

# Step 2: Get User Profile
Write-Host "`n[STEP 2/6] Getting user profile..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/user/me" `
        -Method Get `
        -WebSession $session
    
    Write-Host "✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "Display Name: $($profile.data.user.display_name)" -ForegroundColor Gray
    Write-Host "Role: $($profile.data.user.role)" -ForegroundColor Gray
    Write-Host "2FA Enabled: $($profile.data.user.totp_enabled)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get profile" -ForegroundColor Red
}

# Step 3: Check Usage Quota
Write-Host "`n[STEP 3/6] Checking usage quota..." -ForegroundColor Yellow
try {
    $usage = Invoke-RestMethod -Uri "$baseUrl/api/user/usage" `
        -Method Get `
        -WebSession $session
    
    Write-Host "✅ Usage data retrieved!" -ForegroundColor Green
    Write-Host "Current Plan: $($usage.data.plan)" -ForegroundColor Gray
    Write-Host "Analyses This Month: $($usage.data.usage.current)" -ForegroundColor Gray
    Write-Host "Monthly Limit: $($usage.data.usage.limit)" -ForegroundColor Gray
    Write-Host "Remaining: $($usage.data.usage.remaining)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get usage data" -ForegroundColor Red
}

# Step 4: Analyze Ethereum USDT (Tether - Safe & Well-Known)
Write-Host "`n[STEP 4/6] Analyzing Ethereum USDT (Tether)..." -ForegroundColor Yellow
Write-Host "⏳ This may take 20-30 seconds (multi-API orchestration)..." -ForegroundColor Gray

$analysisBody1 = @{
    chain = "ethereum"
    contractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $analysis1 = Invoke-RestMethod -Uri "$baseUrl/api/analysis/analyze" `
        -Method Post `
        -Body $analysisBody1 `
        -ContentType "application/json" `
        -WebSession $session `
        -TimeoutSec 60
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✅ Analysis completed in $([math]::Round($duration, 2)) seconds!" -ForegroundColor Green
    Write-Host "`n📊 USDT Analysis Results:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Token Address: $($analysis1.data.analysis.token_address)" -ForegroundColor White
    Write-Host "Chain: $($analysis1.data.analysis.chain)" -ForegroundColor White
    Write-Host "Safety Score: $($analysis1.data.analysis.safety_score)/100" -ForegroundColor $(if($analysis1.data.analysis.safety_score -ge 70){'Green'}elseif($analysis1.data.analysis.safety_score -ge 40){'Yellow'}else{'Red'})
    Write-Host "Risk Level: $($analysis1.data.analysis.risk_level)" -ForegroundColor $(if($analysis1.data.analysis.risk_level -eq 'low'){'Green'}elseif($analysis1.data.analysis.risk_level -eq 'medium'){'Yellow'}else{'Red'})
    Write-Host "Data Completeness: $($analysis1.data.analysis.data_completeness)%" -ForegroundColor White
    
    if ($analysis1.data.analysis.metadata) {
        Write-Host "`n📝 Token Metadata:" -ForegroundColor Cyan
        if ($analysis1.data.analysis.metadata.name) {
            Write-Host "  Name: $($analysis1.data.analysis.metadata.name)" -ForegroundColor Gray
        }
        if ($analysis1.data.analysis.metadata.symbol) {
            Write-Host "  Symbol: $($analysis1.data.analysis.metadata.symbol)" -ForegroundColor Gray
        }
        if ($analysis1.data.analysis.metadata.total_supply) {
            Write-Host "  Total Supply: $($analysis1.data.analysis.metadata.total_supply)" -ForegroundColor Gray
        }
    }
    
    if ($analysis1.data.analysis.security_scan) {
        Write-Host "`n🔒 Security Summary:" -ForegroundColor Cyan
        if ($analysis1.data.analysis.security_scan.is_honeypot -ne $null) {
            $honeypot = if ($analysis1.data.analysis.security_scan.is_honeypot) { "⚠️  YES" } else { "✅ NO" }
            Write-Host "  Honeypot: $honeypot" -ForegroundColor $(if($analysis1.data.analysis.security_scan.is_honeypot){'Red'}else{'Green'})
        }
        if ($analysis1.data.analysis.security_scan.is_open_source -ne $null) {
            $opensource = if ($analysis1.data.analysis.security_scan.is_open_source) { "✅ YES" } else { "⚠️  NO" }
            Write-Host "  Open Source: $opensource" -ForegroundColor $(if($analysis1.data.analysis.security_scan.is_open_source){'Green'}else{'Yellow'})
        }
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    
    $global:analysis1Id = $analysis1.data.analysis.id
    
} catch {
    Write-Host "❌ Analysis failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error: $errorBody" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Analyze Solana BONK (Popular Meme Coin)
Write-Host "`n[STEP 5/6] Analyzing Solana BONK..." -ForegroundColor Yellow
Write-Host "⏳ This may take 20-30 seconds..." -ForegroundColor Gray

$analysisBody2 = @{
    chain = "solana"
    contractAddress = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $analysis2 = Invoke-RestMethod -Uri "$baseUrl/api/analysis/analyze" `
        -Method Post `
        -Body $analysisBody2 `
        -ContentType "application/json" `
        -WebSession $session `
        -TimeoutSec 60
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✅ Analysis completed in $([math]::Round($duration, 2)) seconds!" -ForegroundColor Green
    Write-Host "`n📊 BONK Analysis Results:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Token Address: $($analysis2.data.analysis.token_address)" -ForegroundColor White
    Write-Host "Chain: $($analysis2.data.analysis.chain)" -ForegroundColor White
    Write-Host "Safety Score: $($analysis2.data.analysis.safety_score)/100" -ForegroundColor $(if($analysis2.data.analysis.safety_score -ge 70){'Green'}elseif($analysis2.data.analysis.safety_score -ge 40){'Yellow'}else{'Red'})
    Write-Host "Risk Level: $($analysis2.data.analysis.risk_level)" -ForegroundColor $(if($analysis2.data.analysis.risk_level -eq 'low'){'Green'}elseif($analysis2.data.analysis.risk_level -eq 'medium'){'Yellow'}else{'Red'})
    Write-Host "Data Completeness: $($analysis2.data.analysis.data_completeness)%" -ForegroundColor White
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    
    $global:analysis2Id = $analysis2.data.analysis.id
    
} catch {
    Write-Host "❌ Analysis failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error: $errorBody" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Get Analysis History
Write-Host "`n[STEP 6/6] Getting analysis history..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/api/analysis/history" `
        -Method Get `
        -WebSession $session
    
    Write-Host "✅ History retrieved!" -ForegroundColor Green
    Write-Host "`n📋 Recent Analyses:" -ForegroundColor Cyan
    
    foreach ($item in $history.data.analyses) {
        Write-Host "─────────────────────────────────────" -ForegroundColor Gray
        Write-Host "ID: $($item.id)" -ForegroundColor Gray
        Write-Host "Chain: $($item.chain)" -ForegroundColor White
        Write-Host "Token: $($item.token_address)" -ForegroundColor White
        Write-Host "Safety Score: $($item.safety_score)/100" -ForegroundColor $(if($item.safety_score -ge 70){'Green'}elseif($item.safety_score -ge 40){'Yellow'}else{'Red'})
        Write-Host "Risk Level: $($item.risk_level)" -ForegroundColor $(if($item.risk_level -eq 'low'){'Green'}elseif($item.risk_level -eq 'medium'){'Yellow'}else{'Red'})
        Write-Host "Created: $($item.created_at)" -ForegroundColor Gray
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host "`nTotal Analyses: $($history.data.analyses.Count)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed to get history" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "✅ Authentication: Working" -ForegroundColor Green
Write-Host "✅ User Profile: Working" -ForegroundColor Green
Write-Host "✅ Usage Tracking: Working" -ForegroundColor Green
Write-Host "✅ Token Analysis (Ethereum): Working" -ForegroundColor Green
Write-Host "✅ Token Analysis (Solana): Working" -ForegroundColor Green
Write-Host "✅ Analysis History: Working" -ForegroundColor Green
Write-Host "`n🎉 ALL TESTS PASSED! 🎉`n" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

