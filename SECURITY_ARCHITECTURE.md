# 🔐 ARCHITECTURE DE SÉCURITÉ PRODUCTION-GRADE

## 📋 VUE D'ENSEMBLE

Cette architecture protège les 9000 mots de vocabulaire, quiz et templates contre l'extraction via DevTools, scraping ou accès non autorisé.

---

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE WAF                        │
│  • Anti-DDoS • Bot Protection • Rate Limiting (Layer 7)     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   VERCEL (Frontend)                          │
│  • React App • CSP Headers • HSTS • X-Frame-Options         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS Only
                         │ JWT Bearer Token
                         │
┌────────────────────────▼────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                         │
│  • Rate Limiting (req/min/IP + req/hour/user)               │
│  • Pagination forcée (20-50 items max)                      │
│  • Anti-scraping pattern detection                          │
│  • JWT validation                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Service Role (backend only)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              SUPABASE POSTGRES + RLS                         │
│  • Row Level Security activée                               │
│  • Rôles: free / premium / admin                            │
│  • Policies strictes par table                              │
│  • Aucun accès direct depuis le frontend                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 SYSTÈME D'AUTHENTIFICATION

### **Providers supportés**
1. ✅ **Email + OTP** (sans mot de passe)
2. ✅ **Google OAuth**
3. 🔜 **GitHub OAuth** (optionnel)

### **Flow d'inscription**
```typescript
1. User clique "Sign Up"
2. Supabase Auth envoie OTP par email
3. User confirme OTP
4. Création automatique dans users table
5. Rôle par défaut: "free"
6. JWT généré avec claim role: "free"
```

### **Rôles et permissions**

| Rôle       | Accès vocabulaire | Quiz avancés | AI Chat | Templates Pro |
|-----------|-------------------|--------------|---------|---------------|
| **free**  | 500 mots          | ❌           | ❌      | ❌            |
| **premium** | 9000 mots       | ✅           | ✅      | ✅            |
| **admin** | Tout + analytics  | ✅           | ✅      | ✅            |

---

## 🗄️ STRUCTURE DES TABLES

### **1. users_profile**
```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'admin')),
  daily_request_count INTEGER DEFAULT 0,
  last_request_reset TIMESTAMPTZ DEFAULT NOW(),
  total_requests INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  suspicious_activity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **2. vocabulary**
```sql
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'business', 'tech', 'daily', 'travel', 'food',
    'health', 'education', 'entertainment', 'sports', 'relationships'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('intermediate', 'advanced', 'native')),
  example_sentence TEXT,
  pronunciation TEXT,
  min_role TEXT NOT NULL DEFAULT 'free' CHECK (min_role IN ('free', 'premium', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_min_role ON vocabulary(min_role);
```

### **3. quiz_questions**
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  min_role TEXT NOT NULL DEFAULT 'premium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **4. templates**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content JSONB NOT NULL,
  min_role TEXT NOT NULL DEFAULT 'premium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **5. rate_limiting_log**
```sql
CREATE TABLE rate_limiting_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_rate_limiting_user ON rate_limiting_log(user_id, created_at);
CREATE INDEX idx_rate_limiting_ip ON rate_limiting_log(ip_address, created_at);
```

---

## 🛡️ ROW LEVEL SECURITY (RLS) POLICIES

### **Activation RLS sur toutes les tables**
```sql
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
```

### **Policy: users_profile**
```sql
-- Users peuvent voir seulement leur propre profil
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

-- Users peuvent update seulement leur propre profil (sauf role/is_blocked)
CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM users_profile WHERE id = auth.uid())
    AND is_blocked = (SELECT is_blocked FROM users_profile WHERE id = auth.uid())
  );
```

### **Policy: vocabulary**
```sql
-- Users peuvent voir seulement le vocabulaire autorisé selon leur rôle
CREATE POLICY "Users can view vocabulary based on role"
  ON vocabulary FOR SELECT
  USING (
    CASE 
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'free' THEN min_role = 'free'
      ELSE FALSE
    END
  );

-- Aucun INSERT/UPDATE/DELETE pour les users
-- Seulement via Edge Functions avec service_role
```

### **Policy: quiz_questions**
```sql
CREATE POLICY "Users can view quiz based on role"
  ON quiz_questions FOR SELECT
  USING (
    CASE 
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' THEN TRUE
      ELSE FALSE
    END
  );
```

### **Policy: templates**
```sql
CREATE POLICY "Users can view templates based on role"
  ON templates FOR SELECT
  USING (
    CASE 
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' THEN TRUE
      ELSE FALSE
    END
  );
```

---

## 🚀 EDGE FUNCTIONS ENDPOINTS

### **Endpoints disponibles**

| Endpoint | Méthode | Auth | Rate Limit | Description |
|----------|---------|------|-----------|-------------|
| `/vocab/random` | GET | ✅ | 30/min | Récupère 20-50 mots aléatoires |
| `/vocab/category/:cat` | GET | ✅ | 30/min | Mots par catégorie (paginé) |
| `/quiz/daily` | GET | ✅ | 10/min | Quiz du jour (premium) |
| `/templates/list` | GET | ✅ | 20/min | Liste templates (premium) |
| `/user/profile` | GET | ✅ | 60/min | Profil utilisateur |
| `/user/upgrade` | POST | ✅ | 5/min | Upgrade vers premium |

### **Rate Limiting Rules**

```typescript
// Par IP (non authentifié)
const IP_LIMITS = {
  perMinute: 10,
  perHour: 100,
  perDay: 500
};

// Par User (authentifié)
const USER_LIMITS = {
  free: {
    perMinute: 30,
    perHour: 300,
    perDay: 1000
  },
  premium: {
    perMinute: 100,
    perHour: 1500,
    perDay: 10000
  },
  admin: {
    perMinute: 1000,
    perHour: 100000,
    perDay: 1000000
  }
};
```

---

## 🔒 HEADERS DE SÉCURITÉ

### **Vercel vercel.json configuration**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

---

## 🤖 PROTECTION ANTI-SCRAPING

### **Détection de patterns suspects**

```typescript
// Dans Edge Functions
const SUSPICIOUS_PATTERNS = {
  // Requêtes trop rapides
  tooManyRequestsPerSecond: (count: number) => count > 5,
  
  // Patterns de pagination systématique
  sequentialPagination: (history: string[]) => {
    // Détecte si user fait page=1, page=2, page=3... trop rapidement
    return history.length > 10 && isSequential(history);
  },
  
  // User-Agent suspects
  suspiciousUserAgent: (ua: string) => {
    const botPatterns = ['bot', 'crawler', 'scraper', 'python', 'curl', 'wget'];
    return botPatterns.some(pattern => ua.toLowerCase().includes(pattern));
  },
  
  // Même fingerprint, différents comptes
  fingerprintReuse: async (fingerprint: string) => {
    const count = await countAccountsWithFingerprint(fingerprint);
    return count > 3;
  }
};
```

### **Actions automatiques**

```typescript
// Si score de suspicion > seuil
if (suspiciousScore > 50) {
  // 1. Slow down (ajouter délai artificiel)
  await sleep(5000);
}

if (suspiciousScore > 80) {
  // 2. CAPTCHA challenge
  return { error: 'CAPTCHA_REQUIRED', challenge: generateCaptcha() };
}

if (suspiciousScore > 100) {
  // 3. Block temporaire (1 heure)
  await blockUser(userId, 3600);
}

if (suspiciousScore > 150) {
  // 4. Ban permanent
  await banUser(userId);
}
```

---

## ☁️ CLOUDFLARE WAF CONFIGURATION

### **Rules à activer**

1. ✅ **Bot Fight Mode** (gratuit)
2. ✅ **DDoS Protection** (automatique)
3. ✅ **Rate Limiting** (backup layer 7)
4. ✅ **Firewall Rules**

### **Custom Firewall Rules**

```javascript
// Bloquer pays à haut risque (optionnel)
(ip.geoip.country in {"CN" "RU" "KP"}) and not (http.request.uri.path contains "/api/public")

// Bloquer user-agents suspects
(http.user_agent contains "python" or http.user_agent contains "curl") and not (http.request.uri.path eq "/api/webhook")

// Challenge si trop de requêtes
(cf.threat_score > 30)
```

### **Cache Rules**
```javascript
// Ne jamais cacher les endpoints API
(http.request.uri.path contains "/api/" or http.request.uri.path contains "/functions/") 
→ Cache Level: Bypass

// Cacher assets statiques
(http.request.uri.path matches "^/assets/.*\.(js|css|png|jpg|svg)$")
→ Cache Level: Standard, Edge TTL: 1 month
```

---

## 📊 MONITORING & ALERTES

### **Métriques à surveiller**

1. **Rate Limiting Hits** (combien de requêtes bloquées)
2. **Suspicious Activity Score** (moyenne par user)
3. **Failed Auth Attempts** (tentatives de login)
4. **Response Time** (détecter DDoS)
5. **Database Load** (requêtes/sec)

### **Alertes automatiques**

```typescript
// Si trop de rate limit hits en 5 min
if (rateLimitHits > 1000 in 5min) {
  sendAlert('HIGH_TRAFFIC_ALERT', { type: 'potential_ddos' });
}

// Si user suspect crée plusieurs comptes
if (newAccountsFromSameIP > 5 in 1hour) {
  sendAlert('SUSPICIOUS_SIGNUPS', { ip: suspiciousIP });
}
```

---

## 🎯 CHECKLIST DE DÉPLOIEMENT

### **Phase 1: Database Setup**
- [ ] Créer projet Supabase
- [ ] Exécuter SQL migrations (tables + RLS)
- [ ] Importer les 9000 mots
- [ ] Vérifier RLS policies actives

### **Phase 2: Auth Setup**
- [ ] Activer Email provider (configurer SMTP)
- [ ] Activer Google OAuth (obtenir credentials)
- [ ] Configurer redirect URLs
- [ ] Tester flow signup/login

### **Phase 3: Edge Functions**
- [ ] Déployer toutes les functions
- [ ] Tester rate limiting
- [ ] Tester anti-scraping detection
- [ ] Configurer environment variables

### **Phase 4: Frontend**
- [ ] Implémenter auth UI
- [ ] Remplacer données statiques par API calls
- [ ] Ajouter error handling
- [ ] Tester pagination

### **Phase 5: Security Headers**
- [ ] Déployer vercel.json
- [ ] Vérifier headers avec securityheaders.com
- [ ] Configurer CSP sans erreurs console
- [ ] Activer HSTS

### **Phase 6: Cloudflare**
- [ ] Ajouter domaine à Cloudflare
- [ ] Activer Bot Fight Mode
- [ ] Configurer Firewall Rules
- [ ] Tester avec curl/scrapers

### **Phase 7: Monitoring**
- [ ] Configurer Supabase Dashboard alerts
- [ ] Intégrer Sentry (error tracking)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Dashboard analytics

---

## 💰 COÛTS ESTIMÉS

| Service | Plan | Prix/mois |
|---------|------|-----------|
| **Supabase** | Pro | $25 |
| **Vercel** | Hobby | $0 (puis Pro $20) |
| **Cloudflare** | Free | $0 |
| **Sentry** | Developer | $0 (10k events/month) |
| **Total** | | **$25-45/mois** |

---

## 🚀 PROCHAINES ÉTAPES

1. Je crée les tables SQL + policies
2. Je crée les Edge Functions
3. Je configure l'auth dans le frontend
4. Je déploie sur Vercel avec headers sécurisés
5. Tu configures Cloudflare WAF

**Prêt à continuer ?**
