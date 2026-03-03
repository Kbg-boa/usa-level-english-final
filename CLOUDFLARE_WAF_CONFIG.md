# ☁️ CONFIGURATION CLOUDFLARE WAF - NIVEAU PRODUCTION

## 🎯 OBJECTIF

Bloquer automatiquement:
- ✅ Bots scrapers (Python, curl, wget, etc.)
- ✅ Attaques DDoS
- ✅ Requêtes suspectes (trop rapides, patterns anormaux)
- ✅ Pays à haut risque (optionnel)
- ✅ IPs blacklistées connues

---

## ÉTAPE 1: ACTIVATION BOT FIGHT MODE (GRATUIT)

### Navigation
Dashboard → Security → Bots

### Configuration
1. ✅ Activate "Bot Fight Mode"
2. ✅ Activate "Super Bot Fight Mode" (si plan Pro)

### Ce que ça bloque automatiquement
- Scripts automatisés sans JavaScript
- Scrapers connus
- Bots malveillants

---

## ÉTAPE 2: FIREWALL RULES CUSTOM

### Navigation
Dashboard → Security → WAF → Firewall rules → Create rule

---

### 🔥 RULE 1: Block Known Scrapers

**Rule name:** `block-scrapers`

**Expression:**
```
(http.user_agent contains "python" or
 http.user_agent contains "curl" or
 http.user_agent contains "wget" or
 http.user_agent contains "scrapy" or
 http.user_agent contains "beautifulsoup" or
 http.user_agent contains "selenium" or
 http.user_agent contains "phantomjs" or
 http.user_agent contains "httpclient" or
 http.user_agent contains "bot" or
 http.user_agent contains "crawler")
and not http.request.uri.path eq "/api/webhook"
and not http.request.uri.path contains "/health"
```

**Action:** Block

**Priority:** High (1)

---

### 🔥 RULE 2: Challenge High Threat Score

**Rule name:** `challenge-suspicious`

**Expression:**
```
cf.threat_score > 30
```

**Action:** JS Challenge (ou Managed Challenge si disponible)

**Priority:** Medium (5)

**Explication:** 
- Cloudflare attribue un score de menace 0-100 basé sur:
  - Réputation IP
  - Comportement suspect
  - Historique d'attaques
- Score > 30 = suspect → on challenge

---

### 🔥 RULE 3: Block Direct API Access Without Referer

**Rule name:** `api-referer-required`

**Expression:**
```
(http.request.uri.path contains "/functions/v1/" or
 http.request.uri.path contains "/api/")
and not http.referer contains "usalevelenglish.com"
and not http.request.method eq "OPTIONS"
```

**Action:** Block

**Priority:** Medium (10)

**Explication:** 
- Les requêtes API légitimes viennent du frontend (ont le referer)
- Les scrapers appellent directement l'API (pas de referer)
- ⚠️ Attention: certains browsers bloquent le referer (Brave, Firefox strict)

---

### 🔥 RULE 4: Rate Limiting Basic (PLAN PRO REQUIS)

**Rule name:** `rate-limit-api`

**Expression:**
```
http.request.uri.path contains "/functions/v1/"
```

**Action:** Rate Limit
- Requests: **100 per 1 minute**
- Période: 1 minute
- Action quand dépassé: Block
- Duration: 10 minutes

**Alternative pour plan FREE:**
Utilise seulement le rate limiting dans Edge Functions (déjà implémenté)

---

### 🔥 RULE 5: Block High-Risk Countries (OPTIONNEL)

**Rule name:** `block-high-risk-countries`

**Expression:**
```
(ip.geoip.country in {"CN" "RU" "KP" "IR"})
and not http.request.uri.path eq "/public"
and not http.request.uri.path contains "/assets"
```

**Action:** Block

**Priority:** Low (20)

**⚠️ WARNING:** 
- Seulement si tu ne cibles PAS ces pays
- Peut bloquer des VPN légitimes
- Peut bloquer des expatriés

---

### 🔥 RULE 6: Block Empty User Agents

**Rule name:** `block-empty-ua`

**Expression:**
```
http.user_agent eq ""
```

**Action:** Block

**Priority:** High (2)

**Explication:** Les browsers légitimes envoient toujours un user-agent

---

### 🔥 RULE 7: Protect Auth Endpoints

**Rule name:** `protect-auth`

**Expression:**
```
http.request.uri.path contains "/auth/"
and cf.threat_score > 10
```

**Action:** Managed Challenge

**Priority:** Critical (0)

---

## ÉTAPE 3: RATE LIMITING AVANCÉ (PRO PLAN)

### Navigation
Dashboard → Security → WAF → Rate limiting rules → Create rule

---

### 📊 RULE 1: Global API Rate Limit

**Rule name:** `api-global-limit`

**Match:**
- Request URI Path contains `/functions/v1/`

**Count:**
- Requests: 100
- Period: 60 seconds
- Count by: IP Address

**Action:**
- Block for 600 seconds (10 min)
- HTTP status: 429

---

### 📊 RULE 2: Auth Brute Force Protection

**Rule name:** `auth-brute-force`

**Match:**
- Request URI Path contains `/auth/v1/`
- HTTP Method eq `POST`

**Count:**
- Requests: 10
- Period: 300 seconds (5 min)
- Count by: IP Address

**Action:**
- Block for 3600 seconds (1 hour)
- HTTP status: 429

---

### 📊 RULE 3: Per-Path Limits

**Rule name:** `vocab-endpoint-limit`

**Match:**
- Request URI Path contains `/vocab-get`

**Count:**
- Requests: 50
- Period: 60 seconds
- Count by: IP + User Agent

**Action:**
- Block for 300 seconds (5 min)

---

## ÉTAPE 4: IP ACCESS RULES

### Navigation
Dashboard → Security → WAF → Tools

---

### Whitelist IPs (si tu as des services backend)

**Mode:** Allow
**Value:** `1.2.3.4` (ton server IP)
**Notes:** Backend service

### Blacklist IPs connues

Tu peux importer des listes:
- https://www.spamhaus.org/drop/
- https://rules.emergingthreats.net/blockrules/

---

## ÉTAPE 5: SECURITY LEVEL

### Navigation
Dashboard → Security → Settings

---

### Configuration recommandée

**Security Level:** High
- Challenge visitors with a threat score > 0
- JS Challenge avant d'accéder au site

**Challenge Passage:** 30 minutes
- Durée avant de re-challenge

**Browser Integrity Check:** ON
- Vérifie que c'est un vrai browser

---

## ÉTAPE 6: PAGE RULES (OPTIMISATION)

### Navigation
Dashboard → Rules → Page Rules

---

### RULE 1: Cache Static Assets

**URL:** `usalevelenglish.com/assets/*`

**Settings:**
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month

---

### RULE 2: Bypass Cache for API

**URL:** `usalevelenglish.com/functions/*`

**Settings:**
- Cache Level: Bypass
- Disable Performance

---

### RULE 3: High Security for Admin

**URL:** `usalevelenglish.com/admin/*`

**Settings:**
- Security Level: I'm Under Attack!
- Cache Level: Bypass

---

## ÉTAPE 7: MONITORING & ALERTS

### Navigation
Dashboard → Analytics → Security

---

### Métriques à surveiller

1. **Threats Mitigated**
   - Combien de requêtes bloquées
   - Tendance (augmentation soudaine = attaque)

2. **Traffic Type**
   - Humain vs Bot
   - % de bots (normal: 10-30%, anormal: > 50%)

3. **Top Blocked Countries**
   - Identifier sources d'attaques

4. **Top Firewall Events**
   - Quelle rule déclenche le plus

### Configurer des alertes

1. Notifications → Webhooks
2. Ajoute un webhook Slack/Discord:
```
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

3. Configure alertes pour:
   - ✅ Traffic spike (> 10x normal)
   - ✅ DDoS attack detected
   - ✅ High error rate (> 5%)

---

## ÉTAPE 8: MANAGED RULESETS (PRO/BUSINESS)

### Navigation
Dashboard → Security → WAF → Managed rules

---

### Activate ces rulesets

1. ✅ **Cloudflare Managed Ruleset**
   - Protections génériques contre OWASP Top 10

2. ✅ **Cloudflare OWASP Core Ruleset**
   - SQL Injection
   - XSS
   - Command Injection
   - File Inclusion

3. ✅ **Cloudflare Exposed Credentials Check**
   - Détecte si credentials leakées sont utilisées

---

## ÉTAPE 9: SSL/TLS CONFIGURATION

### Navigation
Dashboard → SSL/TLS

---

### Configuration recommandée

**SSL/TLS encryption mode:** Full (strict)
- Vérifie le certificat Vercel

**Minimum TLS Version:** TLS 1.2
- Bloque TLS 1.0/1.1 (deprecated)

**Opportunistic Encryption:** ON

**TLS 1.3:** ON
- Plus rapide et sécurisé

**Automatic HTTPS Rewrites:** ON
- Force HTTPS partout

---

## ÉTAPE 10: CUSTOM ERROR PAGES

### Navigation
Dashboard → Custom Pages

---

### 1000 Class Errors (customize)

**1020: Access Denied**
```html
<!DOCTYPE html>
<html>
<head>
  <title>🚫 Accès Refusé</title>
  <style>
    body { 
      font-family: 'Montserrat', sans-serif;
      background: linear-gradient(135deg, #0B1220, #1E3A8A);
      color: white;
      text-align: center;
      padding: 100px;
    }
  </style>
</head>
<body>
  <h1>🚫 Accès Refusé</h1>
  <p>Votre requête a été bloquée par notre système de sécurité.</p>
  <p>Si vous pensez que c'est une erreur, contactez: support@usalevelenglish.com</p>
</body>
</html>
```

**1015: Rate Limited**
```html
<!DOCTYPE html>
<html>
<head>
  <title>⏱️ Trop de Requêtes</title>
</head>
<body>
  <h1>⏱️ Ralentissez !</h1>
  <p>Vous avez fait trop de requêtes. Réessayez dans quelques minutes.</p>
</body>
</html>
```

---

## 📊 DASHBOARD À CONSULTER QUOTIDIENNEMENT

### 1. Security Events
`Dashboard → Security → Overview`
- Combien de threats bloquées aujourd'hui
- Trending attacks

### 2. Analytics
`Dashboard → Analytics → Traffic`
- Requests/hour (détecter spikes)
- Bandwidth (détecter download massif)

### 3. Firewall Analytics
`Dashboard → Security → Analytics`
- Top triggered rules
- Top blocked IPs
- Top blocked countries

---

## 🧪 TESTER LA CONFIGURATION

### Test 1: Bloquer un scraper

```bash
curl -X GET \
  'https://usalevelenglish.com/functions/v1/vocab-get' \
  -H "User-Agent: python-requests/2.28.0" \
  -H "Authorization: Bearer <token>"
```

**Résultat attendu:** `403 Forbidden` ou `1020 Access Denied`

---

### Test 2: Rate limiting

```bash
for i in {1..150}; do
  curl -X GET 'https://usalevelenglish.com/functions/v1/vocab-get' \
    -H "Authorization: Bearer <token>"
  echo "Request $i"
done
```

**Résultat attendu:** Après ~100 requêtes → `429 Too Many Requests`

---

### Test 3: Vérifier headers sécurité

```bash
curl -I https://usalevelenglish.com
```

**Vérifier la présence de:**
```
strict-transport-security: max-age=63072000
x-frame-options: DENY
x-content-type-options: nosniff
content-security-policy: ...
```

---

## 🎯 CHECKLIST FINALE CLOUDFLARE

Avant de déclarer "production-ready":

- [ ] Bot Fight Mode activé
- [ ] Firewall Rules configurées (au moins 4-5 rules)
- [ ] Rate Limiting activé (si plan Pro)
- [ ] Security Level = High
- [ ] SSL = Full (strict) + TLS 1.3
- [ ] HSTS activé (preload)
- [ ] Browser Integrity Check ON
- [ ] Challenge Passage configuré
- [ ] Custom error pages créées
- [ ] Monitoring alertes configurées
- [ ] Page rules pour cache optimisé
- [ ] Testé avec scrapers (doit bloquer)
- [ ] Testé rate limiting (doit bloquer après X req)

---

## 💰 COÛT CLOUDFLARE

| Plan | Prix/mois | Features |
|------|-----------|----------|
| **Free** | $0 | Bot Fight Mode, Basic Firewall (5 rules), DDoS auto |
| **Pro** | $20 | Super Bot Fight, 20 Page Rules, Rate Limiting, WAF |
| **Business** | $200 | Managed Rulesets, Geo blocking, Advanced DDoS |
| **Enterprise** | Custom | Tout + support 24/7 + custom rules |

**Recommandation:**
- Commence avec **Free** (amplement suffisant pour 90% des cas)
- Passe à **Pro** si besoin de rate limiting avancé

---

## 📞 SUPPORT

- Cloudflare Community: https://community.cloudflare.com
- Documentation WAF: https://developers.cloudflare.com/waf/
- Status page: https://www.cloudflarestatus.com

---

**🛡️ Ton app est maintenant protégée par un WAF de niveau enterprise !**
