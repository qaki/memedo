# Epic 3: Token Analysis Engine (CAFO Implementation)

**Epic Owner:** @back-end-engineer  
**Status:** 🚀 IN PROGRESS  
**Dependencies:** Epic 1 (✅), Epic 2 (✅), Redis Provisioned (✅)  
**Estimated Duration:** 4-5 days  
**Total Stories:** 10

---

## Epic Overview

Implement the core business logic of MemeDo: multi-chain token analysis with the **Chain-Aware Fallback Orchestrator (CAFO)** pattern. This epic delivers real-time token analysis across Solana and EVM chains with intelligent API fallback, multi-tier caching, and comprehensive safety scoring.

### Goals

1. **CAFO Pattern:** Implement the novel Chain-Aware Fallback Orchestrator for 99.9% analysis success rate
2. **Multi-Chain Support:** Solana, Ethereum, Base, BSC analysis with chain-specific adapters
3. **API Integration:** Helius, Etherscan, GoPlus, RugCheck, BirdEye (5+ external APIs)
4. **Intelligent Caching:** Redis multi-tier caching (1h basic, 15m trending, 5m volatile)
5. **Safety Scoring:** Aggregate multiple data sources into actionable risk ratings
6. **Performance:** <60s analysis time, 95%+ data completeness
7. **Monitoring:** API logging, cost tracking, failure detection

### Key Features

- ✅ Chain-Aware Fallback Orchestrator (CAFO)
- ✅ Solana analysis adapters (Helius, RugCheck, BirdEye)
- ✅ EVM analysis adapters (Etherscan, GoPlus, Covalent)
- ✅ Multi-tier Redis caching with smart TTLs
- ✅ Analysis aggregation and safety scoring
- ✅ API logging and monitoring
- ✅ Rate limit handling and retry logic
- ✅ Quota enforcement integration (20/month free tier)

---

## Prerequisites

Before starting Epic 3, ensure:

- [x] Epic 1 completed (monorepo, database, tooling)
- [x] Epic 2 completed (authentication, user management)
- [x] **Upstash Redis** provisioned and URL added to `.env`
- [ ] **API Keys** obtained and added to `.env`:
  - Helius API (Solana) - https://helius.dev
  - Etherscan API (Ethereum) - https://etherscan.io/apis
  - GoPlus Security API - https://gopluslabs.io
  - Optional: RugCheck, BirdEye, Covalent, DexScreener

---

## User Stories

### Story 3.1: Redis Integration and Caching Layer

**As a** backend developer  
**I want** Redis caching with smart TTLs  
**So that** we minimize external API calls and improve response times

**Acceptance Criteria:**

- [ ] Redis client initialized with Upstash connection
- [ ] Multi-tier caching strategy implemented (basic, trending, volatile)
- [ ] Cache key generation with chain + address + data type
- [ ] Cache hit/miss logging for monitoring
- [ ] Automatic TTL management (1h basic, 15m trending, 5m volatile)
- [ ] Cache warming for popular tokens

**Implementation Plan:**

```typescript
// backend/src/services/redis.service.ts
- Initialize Upstash Redis client
- Implement getCached() and setCached() helpers
- Define cache key patterns: "analysis:{chain}:{address}"
- Implement cache TTL strategies based on data type
- Add cache statistics tracking

// Cache Tiers:
- BASIC_DATA: 1h (contract info, holder distribution)
- TRENDING_DATA: 15m (price, volume, liquidity)
- VOLATILE_DATA: 5m (transactions, recent activity)
```

**Time Estimate:** 2 hours

---

### Story 3.2: Chain-Aware Fallback Orchestrator (CAFO) Core

**As a** system architect  
**I want** a CAFO pattern implementation  
**So that** analysis never fails due to single API downtime

**Acceptance Criteria:**

- [ ] CAFO base class with priority queue logic
- [ ] Adapter registration system (primary, fallback 1, fallback 2)
- [ ] Automatic failover on timeout/error
- [ ] Success tracking per adapter
- [ ] Circuit breaker pattern for failing adapters
- [ ] Health check endpoint for adapter status

**Implementation Plan:**

```typescript
// backend/src/services/cafo.service.ts
export class ChainAwareFallbackOrchestrator {
  private adapters: Map<string, Adapter[]>; // chain -> [primary, fallback1, fallback2]
  private healthScores: Map<string, number>; // adapter -> health (0-100)

  async executeWithFallback(chain, operation, ...args) {
    // 1. Get adapter priority list for chain
    // 2. Try primary adapter
    // 3. On failure, try fallback adapters
    // 4. Update health scores
    // 5. Return first successful result or aggregate partial data
  }

  private updateHealthScore(adapterId, success) {
    // Exponential moving average
    // Circuit breaker logic (disable if health < 20)
  }
}
```

**Time Estimate:** 3 hours

---

### Story 3.3: Solana Adapter - Helius Integration

**As a** user analyzing Solana tokens  
**I want** comprehensive token data from Helius  
**So that** I get holder distribution, metadata, and transaction data

**Acceptance Criteria:**

- [ ] Helius API client with authentication
- [ ] `getTokenMetadata()` - token name, symbol, decimals, image
- [ ] `getHolderDistribution()` - top holders, concentration metrics
- [ ] `getTokenTransactions()` - recent activity, volume
- [ ] `getTokenAccounts()` - supply, mint authority status
- [ ] Rate limit handling (100 req/s free tier)
- [ ] Error handling and retry logic

**Implementation Plan:**

```typescript
// backend/src/adapters/solana/helius.adapter.ts
export class HeliusAdapter implements SolanaAdapter {
  async getTokenMetadata(mintAddress: string) {
    // GET /v0/token-metadata?mint={mintAddress}
    // Cache: 1h (BASIC_DATA)
  }

  async getHolderDistribution(mintAddress: string) {
    // POST /v0/addresses/{mintAddress}/balances
    // Calculate: top10Concentration, holderCount
    // Cache: 15m (TRENDING_DATA)
  }

  async getTokenTransactions(mintAddress: string, limit = 100) {
    // GET /v0/addresses/{mintAddress}/transactions
    // Analyze: volume, frequency, patterns
    // Cache: 5m (VOLATILE_DATA)
  }
}
```

**API Endpoints:**

- Helius RPC: `https://rpc.helius.xyz/?api-key={KEY}`
- Helius API: `https://api.helius.xyz/v0/`

**Time Estimate:** 3 hours

---

### Story 3.4: EVM Adapter - Etherscan Integration

**As a** user analyzing Ethereum tokens  
**I want** contract data from Etherscan  
**So that** I verify contract source and check security features

**Acceptance Criteria:**

- [ ] Etherscan API client (supports Ethereum, BSC, Base)
- [ ] `getContractSource()` - verified source code
- [ ] `getContractABI()` - contract interface
- [ ] `getTokenInfo()` - name, symbol, supply
- [ ] `getContractCreation()` - deployer, creation tx
- [ ] Multi-chain support (detect chain from address)
- [ ] Rate limit handling (5 req/s free tier)

**Implementation Plan:**

```typescript
// backend/src/adapters/evm/etherscan.adapter.ts
export class EtherscanAdapter implements EVMAdapter {
  private readonly BASE_URLS = {
    ethereum: 'https://api.etherscan.io/api',
    bsc: 'https://api.bscscan.com/api',
    base: 'https://api.basescan.org/api',
  };

  async getContractSource(address: string, chain: string) {
    // action=getsourcecode
    // Check: verified, hasProxy, optimization
    // Cache: 1h (BASIC_DATA)
  }

  async getTokenInfo(address: string, chain: string) {
    // action=tokensupply, tokeninfo
    // Extract: totalSupply, decimals, holderCount
    // Cache: 1h (BASIC_DATA)
  }
}
```

**Time Estimate:** 2.5 hours

---

### Story 3.5: Security Adapter - GoPlus Integration

**As a** user concerned about token safety  
**I want** automated security scans  
**So that** I detect honeypots, hidden mints, and other risks

**Acceptance Criteria:**

- [ ] GoPlus API client
- [ ] `getSecurityInfo()` - comprehensive security scan
- [ ] Risk detection: honeypot, mint authority, blacklist, proxy
- [ ] Liquidity analysis: locked, burned, removable
- [ ] Holder analysis: creator balance, top holder concentration
- [ ] Multi-chain support (Ethereum, BSC, Solana)
- [ ] Risk scoring (0-100, where 100 = safest)

**Implementation Plan:**

```typescript
// backend/src/adapters/security/goplus.adapter.ts
export class GoPlusAdapter implements SecurityAdapter {
  async getSecurityInfo(address: string, chain: string) {
    // GET /api/v1/token_security/{chain}?contract_addresses={address}
    //
    // Returns: {
    //   is_honeypot: boolean,
    //   is_mintable: boolean,
    //   can_take_back_ownership: boolean,
    //   owner_balance: string,
    //   holder_count: number,
    //   lp_holder_count: number,
    //   is_blacklisted: boolean,
    //   is_proxy: boolean,
    //   // ... 20+ security checks
    // }
    //
    // Cache: 15m (TRENDING_DATA)
  }

  calculateRiskScore(securityData) {
    // Weighted scoring algorithm
    // Critical risks: -40 points (honeypot, hidden owner)
    // High risks: -20 points (mintable, proxy)
    // Medium risks: -10 points (high owner balance)
    // Return: 0-100 safety score
  }
}
```

**Time Estimate:** 3 hours

---

### Story 3.6: Analysis Aggregation and Scoring Engine

**As a** user  
**I want** a single, comprehensive analysis report  
**So that** I make informed decisions without comparing multiple sources

**Acceptance Criteria:**

- [ ] Aggregate data from all adapters
- [ ] Calculate composite safety score (0-100)
- [ ] Categorize risk level: SAFE (80-100), CAUTION (50-79), AVOID (<50)
- [ ] Generate natural language summary
- [ ] Identify critical red flags
- [ ] Calculate confidence score based on data completeness
- [ ] Handle partial data gracefully

**Implementation Plan:**

```typescript
// backend/src/services/analysis.service.ts
export class AnalysisService {
  async analyzeToken(address: string, chain: string) {
    // 1. Check cache
    const cached = await redis.getCached(`analysis:${chain}:${address}`);
    if (cached) return cached;

    // 2. Fetch data from multiple sources in parallel
    const [metadata, security, holders, transactions] = await Promise.allSettled([
      this.getTokenMetadata(address, chain),
      this.getSecurityInfo(address, chain),
      this.getHolderDistribution(address, chain),
      this.getRecentActivity(address, chain),
    ]);

    // 3. Calculate composite score
    const safetyScore = this.calculateSafetyScore({
      security: security.value,
      holderConcentration: holders.value?.top10Percentage,
      liquidityLocked: security.value?.lpLocked,
      contractVerified: metadata.value?.verified,
      // ... more factors
    });

    // 4. Generate report
    const analysis = {
      address,
      chain,
      metadata: metadata.value,
      safetyScore,
      riskLevel: this.getRiskLevel(safetyScore),
      redFlags: this.identifyRedFlags(security.value),
      summary: this.generateSummary(safetyScore, security.value),
      confidence: this.calculateConfidence([metadata, security, holders]),
      dataCompleteness: this.getDataCompleteness([metadata, security, holders]),
      timestamp: new Date(),
    };

    // 5. Cache result
    await redis.setCached(`analysis:${chain}:${address}`, analysis, '15m');

    // 6. Save to database for history
    await db.insert(analyses).values({ user_id, ...analysis });

    return analysis;
  }

  private calculateSafetyScore(factors) {
    let score = 100;

    // Critical risks (-40 points each)
    if (factors.security?.is_honeypot) score -= 40;
    if (factors.security?.hidden_owner) score -= 40;

    // High risks (-20 points each)
    if (factors.security?.is_mintable) score -= 20;
    if (!factors.liquidityLocked) score -= 20;
    if (!factors.contractVerified) score -= 15;

    // Medium risks (-10 points each)
    if (factors.holderConcentration > 50) score -= 10;
    if (factors.security?.owner_balance > 10) score -= 10;

    return Math.max(0, score);
  }
}
```

**Time Estimate:** 4 hours

---

### Story 3.7: API Logging and Monitoring

**As a** system admin  
**I want** comprehensive API logging  
**So that** I track costs, failures, and performance

**Acceptance Criteria:**

- [ ] Log all external API calls to `api_logs` table
- [ ] Track: API provider, endpoint, response time, success/failure
- [ ] Calculate API costs per analysis
- [ ] Monitor rate limit usage
- [ ] Alert on adapter failures (>20% error rate)
- [ ] Dashboard endpoint for API health

**Implementation Plan:**

```typescript
// backend/src/middleware/api-logger.middleware.ts
export async function logAPICall(
  provider: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  cost: number
) {
  await db.insert(apiLogs).values({
    provider,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTime,
    cost_usd: cost,
    success: statusCode >= 200 && statusCode < 300,
    timestamp: new Date(),
  });
}

// backend/src/controllers/analytics.controller.ts
export async function getAPIHealth(req, res) {
  // Aggregate last 24h of API logs
  // Calculate: success rate, avg response time, total cost per provider
  // Return: health dashboard data
}
```

**Time Estimate:** 2 hours

---

### Story 3.8: Analysis Controller and Routes

**As a** frontend developer  
**I want** REST endpoints for token analysis  
**So that** I can integrate analysis into the UI

**Acceptance Criteria:**

- [ ] POST `/api/analysis/analyze` - Start new analysis
- [ ] GET `/api/analysis/:id` - Get analysis by ID
- [ ] GET `/api/analysis/history` - Get user's past analyses
- [ ] GET `/api/analysis/supported-chains` - Get supported chains
- [ ] Input validation (address format per chain)
- [ ] Quota enforcement (20/month free tier)
- [ ] Authentication required
- [ ] Usage tracking integration

**Implementation Plan:**

```typescript
// backend/src/controllers/analysis.controller.ts
export class AnalysisController {
  async analyze(req: Request, res: Response) {
    // 1. Validate input (chain + address)
    const { chain, address } = analyzeRequestSchema.parse(req.body);

    // 2. Check quota (middleware already checked)

    // 3. Perform analysis
    const analysis = await analysisService.analyzeToken(address, chain);

    // 4. Increment user usage
    await incrementUsage(req.user!.id);

    // 5. Return result
    res.json({
      success: true,
      data: { analysis },
    });
  }

  async getHistory(req: Request, res: Response) {
    // Get user's past analyses with pagination
    const analyses = await db
      .select()
      .from(analyses)
      .where(eq(analyses.user_id, req.user!.id))
      .orderBy(desc(analyses.created_at))
      .limit(20);

    res.json({
      success: true,
      data: { analyses },
    });
  }
}
```

**Routes:**

```typescript
// backend/src/routes/analysis.routes.ts
router.post('/analyze', requireAuth, checkQuota, analyzeToken);
router.get('/history', requireAuth, getAnalysisHistory);
router.get('/:id', requireAuth, getAnalysisById);
router.get('/supported-chains', getSupportedChains);
```

**Time Estimate:** 2 hours

---

### Story 3.9: Error Handling and Fallback Testing

**As a** user  
**I want** analysis to succeed even when some APIs fail  
**So that** I always get actionable data

**Acceptance Criteria:**

- [ ] Partial data gracefully handled
- [ ] Fallback adapters tested and working
- [ ] Timeout handling (30s max per adapter)
- [ ] User-friendly error messages
- [ ] Retry logic for transient failures
- [ ] Circuit breaker prevents cascade failures

**Implementation Plan:**

```typescript
// Test scenarios:
- Primary API down → Fallback succeeds
- All APIs down → Return partial cached data + warning
- Timeout → Move to next adapter
- Rate limit exceeded → Queue for retry
- Invalid address → Clear error message
- Unsupported chain → List supported chains
```

**Time Estimate:** 3 hours

---

### Story 3.10: Integration and Performance Testing

**As a** product owner  
**I want** verified <60s analysis time and 95%+ data completeness  
**So that** we meet our performance targets

**Acceptance Criteria:**

- [ ] End-to-end analysis tests for all chains
- [ ] Performance benchmarks: <60s per analysis
- [ ] Data completeness: >95% for standard tokens
- [ ] Cache hit ratio: >70% for popular tokens
- [ ] Concurrent analysis load testing (10 simultaneous)
- [ ] API cost tracking per analysis

**Implementation Plan:**

```typescript
// Test cases:
1. Ethereum ERC-20 token (standard)
2. Solana SPL token (standard)
3. Base token (new chain)
4. BSC token (high volume)
5. Token with no liquidity (edge case)
6. Brand new token (no cache)
7. Honeypot token (security detection)
8. Popular token (cache hit)

// Metrics to track:
- Total analysis time
- API calls made
- Cache hits/misses
- Data completeness percentage
- Cost per analysis
- Success rate
```

**Time Estimate:** 3 hours

---

## Epic Completion Checklist

- [ ] Story 3.1: Redis Integration and Caching Layer ✅
- [ ] Story 3.2: Chain-Aware Fallback Orchestrator (CAFO) Core ✅
- [ ] Story 3.3: Solana Adapter - Helius Integration ✅
- [ ] Story 3.4: EVM Adapter - Etherscan Integration ✅
- [ ] Story 3.5: Security Adapter - GoPlus Integration ✅
- [ ] Story 3.6: Analysis Aggregation and Scoring Engine ✅
- [ ] Story 3.7: API Logging and Monitoring ✅
- [ ] Story 3.8: Analysis Controller and Routes ✅
- [ ] Story 3.9: Error Handling and Fallback Testing ✅
- [ ] Story 3.10: Integration and Performance Testing ✅

---

## External API Documentation

### Helius (Solana)

- **Docs:** https://docs.helius.dev/
- **Pricing:** Free tier: 100 req/s, 1M req/month
- **Key endpoints:**
  - `/v0/token-metadata`
  - `/v0/addresses/{address}/balances`
  - `/v0/addresses/{address}/transactions`

### Etherscan (Ethereum/EVM)

- **Docs:** https://docs.etherscan.io/
- **Pricing:** Free tier: 5 req/s, 100k req/day
- **Key actions:**
  - `getsourcecode` - Contract verification
  - `tokensupply` - Token supply
  - `tokenholderlist` - Top holders

### GoPlus (Security)

- **Docs:** https://docs.gopluslabs.io/
- **Pricing:** Free tier: 100 req/min
- **Key endpoints:**
  - `/api/v1/token_security/{chain}` - Security scan
  - `/api/v1/rugpull_detecting/{chain}` - Rug pull detection

### BirdEye (Solana - Optional)

- **Docs:** https://docs.birdeye.so/
- **Pricing:** Free tier: 10 req/min
- **Key endpoints:**
  - `/defi/tokenlist` - Token metadata
  - `/defi/price` - Price data

### RugCheck (Solana - Optional)

- **Docs:** https://rugcheck.xyz/docs
- **Pricing:** Free
- **Key endpoints:**
  - `/v1/tokens/{mint}/report` - Security report

---

## Technical Debt & Future Improvements

1. **Rate Limiting Intelligence:** Implement adaptive rate limiting based on API tier
2. **Cost Optimization:** A/B test free vs paid APIs for cost-effectiveness
3. **ML Integration:** Train model on historical rug pulls for predictive scoring
4. **WebSocket Support:** Real-time updates for trending tokens
5. **Batch Analysis:** Allow users to analyze multiple tokens simultaneously
6. **Custom Alerts:** User-defined risk thresholds and notifications

---

**Epic 3 Status:** 🚀 IN PROGRESS  
**Estimated Duration:** 4-5 days  
**Total Stories:** 10  
**Dependencies:** Epic 1 ✅, Epic 2 ✅, Redis ✅
