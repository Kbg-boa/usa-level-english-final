# 🚀 GUIDE DE DÉPLOIEMENT - SÉCURITÉ PRODUCTION

## 📋 PRÉREQUIS

- [ ] Compte Supabase (gratuit ou Pro)
- [ ] Compte Vercel (gratuit)
- [ ] Compte Cloudflare (gratuit)
- [ ] Domaine custom (optionnel mais recommandé)

---

## ÉTAPE 1: CONFIGURATION SUPABASE

### 1.1 Créer un nouveau projet

1. Va sur https://supabase.com/dashboard
2. Clique "New Project"
3. Choisis un nom: `usa-level-english`
4. Région: choisir la plus proche de tes utilisateurs
5. Génère un mot de passe fort (garde-le précieusement)

### 1.2 Exécuter les migrations SQL

1. Dans le dashboard Supabase, va dans **SQL Editor**
2. Clique "New Query"
3. Copie tout le contenu de `/supabase/migrations/001_initial_schema.sql`
4. Colle dans l'éditeur
5. Clique **RUN** ▶️
6. Vérifie qu'il n'y a pas d'erreurs

### 1.3 Vérifier les tables créées

Va dans **Table Editor**, tu devrais voir:
- ✅ `users_profile`
- ✅ `vocabulary`
- ✅ `quiz_questions`
- ✅ `templates`
- ✅ `rate_limiting_log`
- ✅ `user_activity`

### 1.4 Activer l'authentification

1. Va dans **Authentication** → **Providers**
2. Active **Email** (OTP sans mot de passe)
   - Activate "Enable Email provider"
   - Activate "Confirm email" → **DISABLE** (pour le développement)
   - Configure SMTP (optionnel, sinon utilise Supabase SMTP)
3. Active **Google OAuth**
   - Va sur https://console.cloud.google.com
   - Crée un nouveau projet
   - Active "Google+ API"
   - Configure OAuth consent screen
   - Crée des credentials OAuth 2.0
   - Authorized redirect URIs: `https://<ton-projet>.supabase.co/auth/v1/callback`
   - Copie Client ID et Client Secret
   - Colle dans Supabase → Google provider

### 1.5 Récupérer les clés API

1. Va dans **Settings** → **API**
2. Copie ces valeurs:
   - `Project URL`: `https://<ton-projet>.supabase.co`
   - `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `service_role key`: ⚠️ **SECRET - NE JAMAIS EXPOSER**

---

## ÉTAPE 2: IMPORTER LES 9000 MOTS

### 2.1 Préparer le CSV

Crée un fichier `vocabulary_import.csv`:

```csv
word,translation,category,difficulty,example_sentence,pronunciation,min_role
afford,se permettre,business,intermediate,"I can't afford a new car",əˈfɔːrd,free
leverage,tirer parti de,business,advanced,"We need to leverage our assets",ˈlevərɪdʒ,free
...
```

### 2.2 Importer dans Supabase

**Option A: Via Dashboard (pour < 1000 lignes)**
1. Table Editor → `vocabulary` → Import CSV

**Option B: Via script (pour 9000 lignes - RECOMMANDÉ)**

Crée `import.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'

const supabase = createClient(
  'https://ton-projet.supabase.co',
  'ta-service-role-key' // ⚠️ NE JAMAIS COMMIT CE FICHIER
)

const words = []

fs.createReadStream('vocabulary_import.csv')
  .pipe(csv())
  .on('data', (row) => words.push(row))
  .on('end', async () => {
    console.log(`Importing ${words.length} words...`)
    
    // Insert par batch de 100
    for (let i = 0; i < words.length; i += 100) {
      const batch = words.slice(i, i + 100)
      const { error } = await supabase.from('vocabulary').insert(batch)
      
      if (error) {
        console.error(`Error at batch ${i}:`, error)
      } else {
        console.log(`Imported ${i + 100}/${words.length}`)
      }
    }
    
    console.log('✅ Import complete!')
  })
```

Run:
```bash
npm install @supabase/supabase-js csv-parser
node import.js
```

### 2.3 Configurer les rôles

```sql
-- Marquer les 500 premiers mots comme "free"
UPDATE vocabulary 
SET min_role = 'free' 
WHERE id IN (
  SELECT id FROM vocabulary ORDER BY created_at LIMIT 500
);

-- Le reste est "premium"
UPDATE vocabulary 
SET min_role = 'premium' 
WHERE min_role != 'free';
```

---

## ÉTAPE 3: DÉPLOYER LES EDGE FUNCTIONS

### 3.1 Installer Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login

```bash
supabase login
```

### 3.3 Link au projet

```bash
supabase link --project-ref <ton-projet-ref>
```

### 3.4 Déployer les functions

```bash
cd supabase/functions
supabase functions deploy vocab-get
supabase functions deploy quiz-daily
supabase functions deploy templates-list
supabase functions deploy user-upgrade
```

### 3.5 Tester les functions

```bash
curl -X GET \
  'https://<ton-projet>.supabase.co/functions/v1/vocab-get?limit=10' \
  -H "Authorization: Bearer <ton-anon-key>"
```

---

## ÉTAPE 4: CONFIGURATION VERCEL

### 4.1 Connecter GitHub

1. Push ton code sur GitHub:
```bash
git add .
git commit -m "Add production security architecture"
git push
```

2. Va sur https://vercel.com
3. "New Project" → Import ton repo GitHub

### 4.2 Configurer les variables d'environnement

Dans Vercel → Settings → Environment Variables, ajoute:

```bash
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NE JAMAIS mettre la SERVICE_ROLE_KEY ici** (elle reste côté Supabase)

### 4.3 Déployer

1. Clique "Deploy"
2. Vercel va build et déployer automatiquement
3. Tu recevras une URL: `https://usa-level-english.vercel.app`

---

## ÉTAPE 5: CONFIGURER CLOUDFLARE WAF

### 5.1 Ajouter le domaine

1. Va sur https://dash.cloudflare.com
2. "Add a site"
3. Entre ton domaine (ex: `usalevelenglish.com`)
4. Choisis le plan Free
5. Copie les nameservers Cloudflare
6. Va chez ton registrar de domaine (Google Domains, Namecheap, etc.)
7. Change les nameservers

### 5.2 Pointer vers Vercel

1. Cloudflare → DNS → Add record
2. Type: `CNAME`
3. Name: `@` (ou `www`)
4. Target: `cname.vercel-dns.com`
5. Proxy status: **Proxied** ✅ (orange cloud)

### 5.3 Activer Bot Fight Mode

1. Security → Bots
2. Activate "Bot Fight Mode" (gratuit)

### 5.4 Configurer Firewall Rules

**Rule 1: Block scrapers**
```
(http.user_agent contains "python" or 
 http.user_agent contains "curl" or 
 http.user_agent contains "wget" or
 http.user_agent contains "scrapy") 
and not http.request.uri.path eq "/api/webhook"
```
→ Action: **Block**

**Rule 2: Challenge suspicious**
```
cf.threat_score > 30
```
→ Action: **JS Challenge**

**Rule 3: Rate limiting (Pro plan required)**
```
(http.request.uri.path contains "/functions/v1/")
```
→ Requests: 100 per minute
→ Action: Block

### 5.5 Activer HSTS

1. SSL/TLS → Edge Certificates
2. Activate "Always Use HTTPS"
3. Activate "HTTP Strict Transport Security (HSTS)"
   - Max Age: 6 months
   - Include subdomains: Yes
   - Preload: Yes

---

## ÉTAPE 6: VÉRIFICATION SÉCURITÉ

### 6.1 Tester les headers

Va sur https://securityheaders.com et entre ton URL.

Tu devrais avoir un **score A** avec:
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Content-Security-Policy
- ✅ Strict-Transport-Security

### 6.2 Tester RLS

Essaye d'accéder directement à la DB depuis le frontend:

```javascript
// Ceci devrait ÉCHOUER (RLS bloque)
const { data } = await supabase
  .from('vocabulary')
  .select('*')
  .limit(9000) // Essai de dump
```

**Si RLS fonctionne:** Tu verras seulement ce que ton rôle autorise (500 mots pour free)

### 6.3 Tester rate limiting

Script de test:

```bash
for i in {1..100}; do
  curl -X GET \
    'https://ton-site.com/functions/v1/vocab-get' \
    -H "Authorization: Bearer <token>"
  echo "Request $i"
done
```

**Résultat attendu:** Après ~30-100 requêtes, tu reçois `429 Too Many Requests`

### 6.4 Tester anti-scraping

Utilise un user-agent bot:

```bash
curl -X GET \
  'https://ton-site.com/functions/v1/vocab-get' \
  -H "Authorization: Bearer <token>" \
  -H "User-Agent: python-requests/2.28.0"
```

**Résultat attendu:** Score de suspicion augmente, possible CAPTCHA ou block

---

## ÉTAPE 7: MONITORING

### 7.1 Configurer Supabase Alerts

1. Dashboard → Database → Replication
2. Configure des alertes pour:
   - High CPU usage (> 80%)
   - Too many connections
   - Disk space low

### 7.2 Installer Sentry (error tracking)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 7.3 Dashboard analytics

1. Supabase → Analytics
2. Monitor:
   - Active users
   - API requests/hour
   - Error rate
   - Response time

---

## ÉTAPE 8: OPTIMISATIONS

### 8.1 Indexation

Vérifie que ces indexes existent (déjà dans la migration):

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 8.2 Caching Cloudflare

1. Caching → Configuration
2. Caching Level: **Standard**
3. Browser Cache TTL: **1 month**

### 8.3 Compression

1. Speed → Optimization
2. Activate "Auto Minify" (JS, CSS, HTML)
3. Activate "Brotli"

---

## ✅ CHECKLIST FINALE

Avant de passer en production:

- [ ] Toutes les tables ont RLS activée
- [ ] Service role key n'est PAS dans le frontend
- [ ] Edge Functions déployées et testées
- [ ] Rate limiting fonctionne
- [ ] Anti-scraping détecte les bots
- [ ] Headers de sécurité validés (securityheaders.com)
- [ ] Cloudflare WAF configuré
- [ ] HTTPS forcé partout (HSTS)
- [ ] Monitoring Sentry actif
- [ ] Backup database activé (Supabase auto-backup)
- [ ] Auth providers testés (email + Google)
- [ ] Les 9000 mots importés avec rôles corrects
- [ ] Domaine custom configuré
- [ ] Analytics dashboard actif

---

## 📊 COÛTS MENSUELS ESTIMÉS

| Service | Plan | Prix |
|---------|------|------|
| Supabase | Pro (recommandé pour production) | $25/mois |
| Vercel | Hobby (OK pour début) → Pro | $0 → $20/mois |
| Cloudflare | Free (suffisant) | $0 |
| Sentry | Developer | $0 (26k events/mois) |
| **TOTAL** | | **$25-45/mois** |

**Évolution:** Avec croissance, passer à:
- Supabase Team ($599/mois) pour plus de DB power
- Cloudflare Pro ($20/mois) pour rate limiting avancé
- Vercel Pro ($20/mois) pour analytics

---

## 🆘 TROUBLESHOOTING

### Problème: "Invalid JWT"
→ Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont corrects
→ Clear browser cookies et re-login

### Problème: "Row Level Security policy violation"
→ Vérifier que l'utilisateur a le bon rôle dans `users_profile`
→ Check les policies RLS avec `SELECT * FROM pg_policies;`

### Problème: "Too many requests" alors qu'on a fait 2 requêtes
→ Vérifier la fonction `rateLimiter` dans les logs Edge Functions
→ Peut-être plusieurs users sur même IP

### Problème: Edge Function timeout
→ Optimiser les queries SQL (ajouter indexes)
→ Réduire la taille des batches

---

## 📞 SUPPORT

- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs
- Mon email: [ton-email-support]

---

**🎉 Félicitations ! Ton app est maintenant sécurisée en production !**
