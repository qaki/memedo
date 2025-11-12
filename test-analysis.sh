#!/bin/bash
# MemeDo Token Analysis Testing Script
# Run this after registering and logging in

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  MemeDo Token Analysis Test Suite ${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Set your access token here after login
ACCESS_TOKEN="${1:-YOUR_ACCESS_TOKEN_HERE}"

if [ "$ACCESS_TOKEN" = "YOUR_ACCESS_TOKEN_HERE" ]; then
  echo -e "${RED}❌ Please provide your access token as an argument${NC}"
  echo -e "${YELLOW}Usage: ./test-analysis.sh YOUR_ACCESS_TOKEN${NC}\n"
  exit 1
fi

API_URL="http://localhost:3000"

# Test 1: Health Check
echo -e "${YELLOW}📊 Test 1: Health Check${NC}"
curl -s "$API_URL/health" | jq '.'
echo -e ""

# Test 2: Get Supported Chains
echo -e "${YELLOW}📊 Test 2: Supported Chains${NC}"
curl -s "$API_URL/api/analysis/supported-chains" | jq '.'
echo -e ""

# Test 3: Analyze Ethereum Token (USDT)
echo -e "${YELLOW}📊 Test 3: Ethereum - USDT (Safe Token)${NC}"
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "ethereum",
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
  }' | jq '.data | {
    chain,
    tokenAddress,
    status,
    safetyScore,
    riskLevel,
    summary,
    redFlags,
    metadata: {
      name: .metadata.name,
      symbol: .metadata.symbol,
      isVerified: .metadata.isVerified
    }
  }'
echo -e ""

# Test 4: Analyze Solana Token (Bonk)
echo -e "${YELLOW}📊 Test 4: Solana - BONK (Meme Token)${NC}"
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "solana",
    "contractAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
  }' | jq '.data | {
    chain,
    tokenAddress,
    status,
    safetyScore,
    riskLevel,
    summary,
    redFlags
  }'
echo -e ""

# Test 5: Analyze BSC Token (PancakeSwap)
echo -e "${YELLOW}📊 Test 5: BSC - CAKE (PancakeSwap)${NC}"
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "bsc",
    "contractAddress": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82"
  }' | jq '.data | {
    chain,
    tokenAddress,
    status,
    safetyScore,
    riskLevel,
    summary
  }'
echo -e ""

# Test 6: Invalid Address (Error Handling)
echo -e "${YELLOW}📊 Test 6: Invalid Address Format${NC}"
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "ethereum",
    "contractAddress": "invalid-address"
  }' | jq '.'
echo -e ""

# Test 7: Get Analysis History
echo -e "${YELLOW}📊 Test 7: Analysis History${NC}"
curl -s "$API_URL/api/analysis/history?limit=5" \
  -H "Cookie: access_token=$ACCESS_TOKEN" | jq '.data | length'
echo -e ""

# Test 8: Cache Test (Analyze same token twice)
echo -e "${YELLOW}📊 Test 8: Cache Performance (USDT again)${NC}"
echo -e "First call (cold cache):"
START_TIME=$(date +%s%3N)
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "ethereum",
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
  }' > /dev/null
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))
echo -e "${GREEN}✅ Duration: ${DURATION}ms${NC}"
echo -e ""

echo -e "Second call (should be cached):"
START_TIME=$(date +%s%3N)
curl -s -X POST "$API_URL/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=$ACCESS_TOKEN" \
  -d '{
    "chain": "ethereum",
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
  }' > /dev/null
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))
echo -e "${GREEN}✅ Duration: ${DURATION}ms (should be much faster!)${NC}"
echo -e ""

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  All Tests Completed! 🎉${NC}"
echo -e "${GREEN}=====================================${NC}"

