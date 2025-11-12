# MemeDo Quick Test Script (PowerShell)
# Step-by-step testing guide

$API_URL = "http://localhost:3000"

Write-Host "=====================================" -ForegroundColor Blue
Write-Host "  MemeDo Quick Start Testing" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Health Check
Write-Host "Step 1: Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Service: $($health.data.service)" -ForegroundColor Gray
    Write-Host "   Status: $($health.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not running. Start it with: cd backend; pnpm dev" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Register User
Write-Host "Step 2: Registering Test User..." -ForegroundColor Yellow
$email = "test-$(Get-Random)@example.com"
$password = "Test1234!"

try {
    $registerBody = @{
        email = $email
        password = $password
        confirmPassword = $password
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Uri "$API_URL/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody

    Write-Host "✅ User registered: $email" -ForegroundColor Green
    
    $verificationToken = $register.data.verificationToken
    Write-Host "   Verification Token: $verificationToken" -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Verify Email
Write-Host "Step 3: Verifying Email..." -ForegroundColor Yellow
try {
    $verifyBody = @{
        token = $verificationToken
    } | ConvertTo-Json

    $verify = Invoke-RestMethod -Uri "$API_URL/api/auth/verify-email" `
        -Method Post `
        -ContentType "application/json" `
        -Body $verifyBody

    Write-Host "✅ Email verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Login
Write-Host "Step 4: Logging In..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable session

    Write-Host "✅ Logged in successfully!" -ForegroundColor Green
    
    # Extract access token from cookies
    $accessToken = $session.Cookies.GetCookies("$API_URL")["access_token"].Value
    Write-Host "   Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Check Supported Chains
Write-Host "Step 5: Getting Supported Chains..." -ForegroundColor Yellow
try {
    $chains = Invoke-RestMethod -Uri "$API_URL/api/analysis/supported-chains" -Method Get
    Write-Host "✅ Supported chains:" -ForegroundColor Green
    foreach ($chain in $chains.data) {
        Write-Host "   - $($chain.name) ($($chain.id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to get chains: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 6: Analyze a Token (USDT on Ethereum)
Write-Host "Step 6: Analyzing USDT Token on Ethereum..." -ForegroundColor Yellow
Write-Host "   (This may take 10-30 seconds...)" -ForegroundColor Gray
try {
    $analyzeBody = @{
        chain = "ethereum"
        contractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    } | ConvertTo-Json

    $headers = @{
        "Cookie" = "access_token=$accessToken"
    }

    $analysis = Invoke-RestMethod -Uri "$API_URL/api/analysis/analyze" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $analyzeBody

    Write-Host "✅ Analysis Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Token: $($analysis.data.metadata.name) ($($analysis.data.metadata.symbol))" -ForegroundColor Cyan
    Write-Host "   Chain: $($analysis.data.chain)" -ForegroundColor Cyan
    Write-Host "   Safety Score: $($analysis.data.safetyScore)/100" -ForegroundColor Cyan
    Write-Host "   Risk Level: $($analysis.data.riskLevel)" -ForegroundColor Cyan
    Write-Host "   Status: $($analysis.data.status)" -ForegroundColor Cyan
    Write-Host "   Verified: $($analysis.data.metadata.isVerified)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Summary:" -ForegroundColor Yellow
    Write-Host "   $($analysis.data.summary)" -ForegroundColor Gray
    Write-Host ""
    
    if ($analysis.data.redFlags.Count -gt 0) {
        Write-Host "   Red Flags:" -ForegroundColor Red
        foreach ($flag in $analysis.data.redFlags) {
            Write-Host "   🚩 $flag" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✅ No critical red flags detected!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This might be because APIs are not configured yet." -ForegroundColor Yellow
    Write-Host "   GoPlus and RugCheck work without API keys!" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Get Analysis History
Write-Host "Step 7: Getting Analysis History..." -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = "access_token=$accessToken"
    }

    $history = Invoke-RestMethod -Uri "$API_URL/api/analysis/history?limit=5" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ You have $($history.data.Count) analysis in history" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get history: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Testing Complete! 🎉" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Try analyzing more tokens with different chains" -ForegroundColor White
Write-Host "2. Check the backend logs for API call details" -ForegroundColor White
Write-Host "3. Add API keys to .env for full functionality:" -ForegroundColor White
Write-Host "   - HELIUS_API_KEY (Solana metadata)" -ForegroundColor Gray
Write-Host "   - ETHERSCAN_API_KEY (EVM verification)" -ForegroundColor Gray
Write-Host "   - GoPlus and RugCheck work without keys! ✅" -ForegroundColor Green
Write-Host ""
Write-Host "Your test credentials:" -ForegroundColor Yellow
Write-Host "Email: $email" -ForegroundColor White
Write-Host "Password: $password" -ForegroundColor White
Write-Host ""

