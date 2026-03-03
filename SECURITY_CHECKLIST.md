# ✅ CHECKLIST SÉCURITÉ PRODUCTION-GRADE

## 🎯 UTILISE CETTE CHECKLIST AVANT CHAQUE DÉPLOIEMENT

---

## 📦 PHASE 1: BACKEND (SUPABASE)

### Database Security
- [ ] RLS activée sur **TOUTES** les tables
- [ ] Policy testée pour chaque rôle (free/premium/admin)
- [ ] Aucun accès direct possible depuis le frontend (testé avec Postman)
- [ ] Service Role Key **JAMAIS** exposée au frontend
- [ ] Indexes créés sur les colonnes fréquemment utilisées
- [ ] Backup automatique activé (Supabase auto-backup)

### Authentication
- [ ] Email OTP activé et testé
- [ ] Google OAuth configuré avec credentials valides
- [ ] Redirect URLs correctes dans Supabase Auth settings
- [ ] JWT expiration configurée (default: 1 heure)
- [ ] Refresh token fonctionnel
- [ ] Auto-création de profil user via trigger (testé)

### Edge Functions
- [ ] Toutes les functions déployées (vocab-get, quiz-daily, etc.)
- [ ] Rate limiting implémenté dans chaque function
- [ ] Anti-scraping detection active
- [ ] Logs d'erreurs configurés (console.log visible dans Supabase logs)
- [ ] CORS headers configurés correctement
- [ ] Variables d'environnement sécurisées (SUPABASE_SERVICE_ROLE_KEY)

### Data Protection
- [ ] 9000 mots importés avec rôles corrects (500 free, 8500 premium)
- [ ] Quiz et templates marqués "premium"
- [ ] Aucune donnée sensible en clair (PII chiffrée si applicable)
- [ ] Rate limiting log se nettoie automatiquement (30 jours)

---

## 🌐 PHASE 2: FRONTEND (VERCEL)

### Environment Variables
- [ ] `VITE_SUPABASE_URL` configurée dans Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` configurée dans Vercel
- [ ] `.env` ajouté à `.gitignore`
- [ ] `.env.example` créé pour la documentation
- [ ] **AUCUNE** service_role_key dans le code frontend

### Code Security
- [ ] Aucun secret hardcodé dans le code
- [ ] Aucune API key en clair (toutes via env vars)
- [ ] Pas de `console.log()` avec données sensibles en production
- [ ] Dependencies à jour (run `npm audit`)
- [ ] Aucun package avec vulnérabilités critiques

### Build & Deploy
- [ ] Build Vercel réussit sans erreurs
- [ ] Aucun import `figma:asset` (corrigé)
- [ ] Bundle size optimisé (< 1 MB si possible)
- [ ] Code splitting activé (lazy loading routes)
- [ ] Source maps désactivées en production (ou secured)

---

## 🔒 PHASE 3: HEADERS DE SÉCURITÉ

### Configuration vercel.json
- [ ] `X-Frame-Options: DENY` (anti-clickjacking)
- [ ] `X-Content-Type-Options: nosniff` (anti-MIME sniffing)
- [ ] `X-XSS-Protection: 1; mode=block` (anti-XSS legacy)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` configurée (camera, microphone, geolocation bloqués)
- [ ] `Strict-Transport-Security` avec preload (HSTS)
- [ ] `Content-Security-Policy` sans `unsafe-inline` si possible

### Validation Headers
- [ ] Testé sur https://securityheaders.com → Score **A** ou **A+**
- [ ] Testé sur https://observatory.mozilla.org → Score > 80
- [ ] Aucune erreur console CSP dans le browser
- [ ] Fonts et assets chargent correctement malgré CSP

---

## ☁️ PHASE 4: CLOUDFLARE WAF

### Configuration de Base
- [ ] Domaine ajouté à Cloudflare
- [ ] Nameservers pointent vers Cloudflare (vérifié chez registrar)
- [ ] SSL/TLS mode: **Full (strict)**
- [ ] HTTPS forcé (Always Use HTTPS activé)
- [ ] HSTS activé avec preload
- [ ] TLS 1.3 activé

### Bot Protection
- [ ] Bot Fight Mode activé (plan Free)
- [ ] Super Bot Fight Mode activé (si plan Pro)
- [ ] Browser Integrity Check ON
- [ ] Challenge Passage configuré (30 min)

### Firewall Rules
- [ ] Rule: Block scrapers (python, curl, wget, etc.)
- [ ] Rule: Challenge high threat score (> 30)
- [ ] Rule: Protect auth endpoints
- [ ] Rule: Block empty user agents
- [ ] (Optionnel) Rule: Block high-risk countries
- [ ] (Pro) Rate limiting rules configurées

### Testing WAF
- [ ] Testé avec `curl` → doit bloquer si user-agent suspect
- [ ] Testé rate limiting → doit bloquer après X requêtes
- [ ] Testé accès normal depuis browser → doit passer
- [ ] Custom error pages configurées (1020, 1015, etc.)

---

## 🛡️ PHASE 5: RATE LIMITING

### Backend (Edge Functions)
- [ ] Limits par rôle configurés (free: 30/min, premium: 100/min)
- [ ] Limits par IP (backup anti-multi-account)
- [ ] Logs dans `rate_limiting_log` table
- [ ] Headers `X-RateLimit-Remaining` retournés
- [ ] Error 429 avec `Retry-After` header

### Frontend
- [ ] Gestion des erreurs 429 (afficher message user-friendly)
- [ ] Retry automatique avec backoff (optionnel)
- [ ] UI disabled temporairement si rate limited

### Testing
- [ ] Script de bombardement créé et testé
- [ ] Rate limit déclenché après X requêtes (vérifié)
- [ ] Compteur se reset après 24h (vérifié)
- [ ] Différents rôles ont différents limits (vérifié)

---

## 🤖 PHASE 6: ANTI-SCRAPING

### Detection Patterns
- [ ] User-agent bot détecté (python, curl, etc.)
- [ ] Requêtes trop rapides détectées (> 8/min)
- [ ] Pagination séquentielle détectée (offset 0, 20, 40...)
- [ ] Multi-comptes même IP détecté (> 5 users)
- [ ] Score de suspicion incrémenté dans DB

### Actions Automatiques
- [ ] Score > 50 → Slowdown artificiel (3sec delay)
- [ ] Score > 100 → CAPTCHA required (ou block)
- [ ] Score > 150 → Auto-ban permanent
- [ ] Admin notifié si ban automatique (webhook/email)

### Testing
- [ ] Scraper Python → détecté et bloqué
- [ ] Requêtes rapides → score augmente
- [ ] Pagination séquentielle → score augmente
- [ ] User légitime → score reste bas

---

## 📊 PHASE 7: MONITORING & ALERTES

### Supabase Dashboard
- [ ] Alertes configurées (high CPU, disk space, etc.)
- [ ] Dashboard Analytics consulté quotidiennement
- [ ] Logs Edge Functions accessibles et compris
- [ ] Slow queries identifiées et optimisées

### External Monitoring
- [ ] Sentry configuré (error tracking)
- [ ] Uptime Robot configuré (monitoring 24/7)
- [ ] Slack/Discord webhook pour alertes critiques
- [ ] Dashboard custom créé (Grafana/Metabase optionnel)

### Metrics à Surveiller
- [ ] Requests/hour (trending)
- [ ] Error rate (< 1%)
- [ ] Response time (< 500ms)
- [ ] Active users (croissance)
- [ ] Rate limiting hits/day
- [ ] Suspicious activity score moyen
- [ ] Database size (évolution)

---

## 🔐 PHASE 8: COMPLIANCE & LÉGAL

### Privacy
- [ ] RGPD compliant (si utilisateurs EU)
  - [ ] Consentement cookies
  - [ ] Droit à l'oubli implémenté (delete account)
  - [ ] Export de données user possible
  - [ ] Privacy Policy publiée
- [ ] Terms of Service publiés
- [ ] Contact email visible (GDPR requirement)

### Data Handling
- [ ] Aucune donnée PII collectée sans nécessité
- [ ] Passwords JAMAIS stockés (Supabase Auth gère)
- [ ] Logs anonymisés (IP hashed si applicable)
- [ ] Data retention policy définie (30 jours pour logs)

### Copyright
- [ ] Copyright notice visible
- [ ] License choisie (MIT, proprietary, etc.)
- [ ] Assets (images, fonts) avec droits d'usage
- [ ] DMCA contact si applicable

---

## 🚀 PHASE 9: PERFORMANCE

### Optimizations
- [ ] Images optimisées (WebP, lazy loading)
- [ ] Fonts subset (seulement caractères utilisés)
- [ ] Code splitting (React lazy + Suspense)
- [ ] CDN activé (Cloudflare cache)
- [ ] Gzip/Brotli compression activée
- [ ] Critical CSS inlined

### Lighthouse Score
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90 (si applicable)

### Testing
- [ ] Testé sur mobile (responsive)
- [ ] Testé sur slow 3G (acceptable)
- [ ] Testé sur différents browsers (Chrome, Firefox, Safari)

---

## 🧪 PHASE 10: TESTING FINAL

### Functional Testing
- [ ] Signup flow complet (email OTP)
- [ ] Signup flow complet (Google OAuth)
- [ ] Login/logout fonctionnel
- [ ] Free tier: seulement 500 mots visibles
- [ ] Premium tier: tous les mots visibles
- [ ] Quiz accessible seulement pour premium
- [ ] Templates accessibles seulement pour premium
- [ ] Upgrade to premium fonctionnel (si implémenté)

### Security Testing
- [ ] Impossible d'accéder aux données premium sans auth
- [ ] Impossible de changer son rôle via frontend
- [ ] Impossible de bypasser RLS via direct DB access
- [ ] Impossible de dump toute la DB via pagination
- [ ] Token JWT invalide → rejeté
- [ ] Token expiré → refresh automatique

### Load Testing (optionnel)
- [ ] 100 users simultanés → stable
- [ ] 1000 requests/min → rate limiting fonctionne
- [ ] DDoS simulé → Cloudflare bloque

---

## 📋 CHECKLIST PRÉ-LANCEMENT

**24h avant le lancement:**

- [ ] Toutes les checkboxes ci-dessus ✅
- [ ] Backup DB manuel créé
- [ ] Domaine custom configuré (pas de .vercel.app en production)
- [ ] SSL certificate valide (vérifié avec ssllabs.com)
- [ ] Monitoring actif et testé
- [ ] Support email fonctionnel
- [ ] Documentation utilisateur créée
- [ ] Changelog versionné (Semantic Versioning)
- [ ] Rollback plan défini (comment revenir en arrière si problème)

**Jour du lancement:**

- [ ] Déploiement en production effectué
- [ ] Smoke tests passés (signup, login, fetch data)
- [ ] Monitoring consulté (pas d'erreurs)
- [ ] Premier utilisateur testé
- [ ] Annonce publique (réseaux sociaux, email list, etc.)

---

## 🆘 INCIDENT RESPONSE PLAN

### Si DB down
1. Check Supabase status page
2. Contact Supabase support
3. Afficher page de maintenance (prépare un static HTML)
4. Communiquer sur Twitter/Discord

### Si trop de scrapers
1. Analyser `rate_limiting_log` pour identifier IPs
2. Bloquer IPs via Cloudflare Firewall
3. Ajuster seuils de detection anti-scraping
4. Envoyer email de warning aux users suspects

### Si DDoS
1. Cloudflare devrait auto-mitigate
2. Activer "I'm Under Attack" mode si nécessaire
3. Contact Cloudflare support si plan Pro/Business
4. Communiquer aux users (status page)

### Si data breach
1. **IMMÉDIATEMENT** revoker toutes les service_role_keys
2. Forcer logout tous les users (via Supabase)
3. Analyser logs pour identifier source
4. Notifier users dans les 72h (RGPD requirement)
5. Publier post-mortem transparent

---

## 🎯 SCORE FINAL

Pour être "production-ready", tu dois avoir **TOUTES** les checkboxes cochées dans les phases 1-6, et au moins **80%** des phases 7-10.

**Current score: ___/100** ✅

---

**🛡️ Bonne chance pour le lancement sécurisé de USA Level English !**
