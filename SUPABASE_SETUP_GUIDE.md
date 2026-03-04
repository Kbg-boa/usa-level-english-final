# 🔐 GUIDE SETUP SUPABASE - NIVEAU 3 SÉCURITÉ

**Temps total: 1 heure**  
**Coût: 100% GRATUIT**  
**Résultat: 9000 mots protégés + Anti-scraping + Rate limiting**

---

## 📋 ÉTAPES PRINCIPALES

1. ✅ Créer compte Supabase (5 min)
2. ✅ Créer projet (2 min)
3. ✅ Exécuter migration SQL (5 min)
4. ✅ Importer 9000 mots (10 min)
5. ✅ Déployer Edge Functions (15 min)
6. ✅ Modifier frontend (20 min)
7. ✅ Tester et vérifier (5 min)

---

## 1️⃣ CRÉER COMPTE SUPABASE (5 min)

### A. Inscription

1. Aller sur https://supabase.com
2. Cliquer **"Start your project"**
3. S'inscrire avec:
   - GitHub (recommandé - 1 clic)
   - OU Email + mot de passe

### B. Vérification email

Si inscription par email:
- Check inbox
- Clic lien de vérification
- Retour sur Supabase Dashboard

**✅ Résultat:** Compte créé, Dashboard ouvert

---

## 2️⃣ CRÉER PROJET (2 min)

### A. New Project

1. Dashboard → **"New project"**
2. Remplir:
   ```
   Organization: Create new organization
   Organization name: "USA Level English" (ou ton nom)
   
   Project name: usa-level-english
   Database Password: [Générer fort - SAUVEGARDER!]
   Region: US East (si utilisateurs US)
          OU Europe (si utilisateurs EU)
   
   Pricing Plan: Free (500 MB, parfait pour démarrage)
   ```

3. Cliquer **"Create new project"**

### B. Attendre déploiement

⏳ **Durée: 1-2 minutes**  
Tu verras:
```
Setting up project...
Configuring database...
Creating API...
```

**✅ Résultat:** Projet créé et opérationnel

---

## 3️⃣ RÉCUPÉRER LES CLÉS API (2 min)

### A. Aller dans Settings

1. Dashboard → Ton projet → **Settings** (⚙️ icône)
2. Menu gauche → **API**

### B. Copier les 3 clés

Tu verras 3 clés importantes:

#### 1. **Project URL**
```
https://xxxxxxxxxxx.supabase.co
```
➡️ **Copier** et garder dans un notepad

#### 2. **anon (public) key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
➡️ **Copier** (clé super longue, c'est normal)

#### 3. **service_role (secret) key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (différent de anon)
```
⚠️ **ATTENTION:** Cette clé est SECRÈTE - ne jamais commit sur Git!

### C. Créer fichier .env local

Dans ton repo local, créer **`.env`** (à la racine):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Remplacer** les valeurs par tes vraies clés!

**✅ Résultat:** Clés API sauvegardées localement

---

## 4️⃣ EXÉCUTER MIGRATION SQL (5 min)

### A. Ouvrir SQL Editor

1. Dashboard → **SQL Editor** (icône </> )
2. Cliquer **"New query"**

### B. Copier la migration

1. Ouvrir le fichier `/supabase/migrations/001_initial_schema.sql`
2. **Copier TOUT** le contenu
3. Coller dans le SQL Editor

### C. Exécuter

1. Cliquer **"Run"** (ou Ctrl+Enter)
2. Attendre 5-10 secondes

**Résultat attendu:**
```
Success. No rows returned
```

### D. Vérifier les tables

1. Dashboard → **Table Editor**
2. Tu devrais voir:
   ```
   ✅ vocabulary
   ✅ user_activity
   ✅ rate_limits
   ✅ suspicious_activity
   ✅ api_keys
   ✅ feedback
   ```

**✅ Résultat:** Base de données créée avec sécurité (RLS activé)

---

## 5️⃣ IMPORTER LES 9000 MOTS (10 min)

### A. Installer dépendances

```bash
# Dans ton terminal (racine du projet)
npm install tsx dotenv
```

### B. Vérifier le fichier .env

```bash
# Vérifier que .env existe
cat .env

# Devrait afficher:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### C. Exécuter le script d'import

```bash
npx tsx scripts/import-vocabulary.ts
```

**Résultat attendu:**
```
🚀 Import des 9000 mots de vocabulaire...

📊 Total mots à importer: 9000

📂 Catégories trouvées: 10

📝 Daily Conversation: 900 mots...
  ✅ 1/9 ✅ 2/9 ✅ 3/9 ... ✅ 9/9 

📝 Business & Professional: 900 mots...
  ✅ 1/9 ✅ 2/9 ... ✅ 9/9 

...

==========================================================

✅ Import terminé!
   Importés: 9000 mots
   Erreurs: 0

==========================================================

📊 Total dans la base: 9000 mots

📈 Statistiques par catégorie:

   Daily Conversation: 900 mots
   Business & Professional: 900 mots
   Real Estate: 900 mots
   Music & Entertainment: 900 mots
   Technology: 900 mots
   Social & Relationships: 900 mots
   Food & Dining: 900 mots
   Travel: 900 mots
   Emotions & Feelings: 900 mots
   Slang & Informal: 900 mots

✅ Données prêtes! Tu peux maintenant utiliser l'API.
```

### D. Vérifier dans Supabase Dashboard

1. Dashboard → **Table Editor** → **vocabulary**
2. Tu devrais voir les 9000 mots!

**✅ Résultat:** 9000 mots dans Supabase, protégés par RLS

---

## 6️⃣ DÉPLOYER EDGE FUNCTIONS (15 min)

### A. Installer Supabase CLI

**macOS / Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
# Via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OU télécharger: https://github.com/supabase/cli/releases
```

### B. Login

```bash
supabase login
```

➡️ Ouvre le navigateur → Autoriser l'accès → Retour terminal

### C. Link projet

```bash
# Remplacer xxx par ton Project ID (Dashboard → Settings → General)
supabase link --project-ref xxxxxxxxxxx
```

Entrer le **Database Password** (créé à l'étape 2)

**Résultat:**
```
✅ Linked to project: usa-level-english
```

### D. Déployer les functions

```bash
# Déployer toutes les functions
supabase functions deploy vocab-get

# Si tu veux déployer toutes d'un coup
# supabase functions deploy --no-verify-jwt
```

**Résultat attendu:**
```
Deploying function vocab-get...
✅ Deployed function vocab-get
```

### E. Tester l'API

```bash
# Remplacer xxx par ton Project URL
curl "https://xxxxxxxxxxx.supabase.co/functions/v1/vocab-get?category=Daily%20Conversation&limit=5"
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": [
    {
      "word": "What's up?",
      "pronunciation": "wʌts ʌp",
      "definition": "Casual greeting...",
      ...
    },
    ...
  ]
}
```

**✅ Résultat:** Edge Functions déployées et opérationnelles

---

## 7️⃣ AJOUTER VARIABLES VERCEL (5 min)

### A. Aller sur Vercel Dashboard

1. https://vercel.com/dashboard
2. Sélectionner ton projet **usa-level-english-final**
3. **Settings** → **Environment Variables**

### B. Ajouter les 2 variables

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxxx.supabase.co
Environments: Production, Preview, Development
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: Production, Preview, Development
```

⚠️ **NE PAS** ajouter `SUPABASE_SERVICE_ROLE_KEY` sur Vercel (secret!)

### C. Redéployer

Option 1 - Via Dashboard:
```
Vercel → Deployments → Latest → ... → Redeploy
```

Option 2 - Via Git:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

**✅ Résultat:** Variables disponibles en production

---

## 8️⃣ MODIFIER LE FRONTEND (20 min)

Les fichiers à modifier sont déjà listés dans `/FRONTEND_MIGRATION_GUIDE.md` (créé ci-dessous).

**Résumé:**
1. `/src/app/data/vocabulary.ts` - Remplacer export statique par fetch API
2. `/src/app/components/Vocabulary.tsx` - Utiliser `useEffect` + async fetch
3. Autres composants utilisant `vocabularyDatabase`

**Voir guide détaillé:** `/FRONTEND_MIGRATION_GUIDE.md`

**✅ Résultat:** Frontend utilise Supabase au lieu de données statiques

---

## 9️⃣ TESTER TOUT (5 min)

### A. Test local

```bash
npm run dev
```

Ouvrir http://localhost:5173 → Module Vocabulary → Vérifier chargement

### B. Test production

Après push sur GitHub:
1. Vercel auto-déploie
2. Ouvrir ton site en production
3. Vérifier Vocabulary fonctionne

### C. Vérifier sécurité

1. Ouvrir DevTools → Network
2. Cliquer sur module Vocabulary
3. Vérifier requêtes API:
   ```
   GET https://xxx.supabase.co/functions/v1/vocab-get?category=...&limit=50
   ```
4. Vérifier que les réponses sont **limitées à 50 mots** (pas 900!)

**✅ Résultat:** Sécurité active, données protégées

---

## 🔒 RÉSULTAT FINAL

### ✅ CE QUI EST ACTIF

1. **Backend sécurisé**
   - 9000 mots dans Supabase PostgreSQL
   - Row Level Security (RLS)
   - Pagination forcée (max 50 words/requête)

2. **Anti-scraping**
   - Rate limiting (IP + user tracking)
   - Suspicious activity detection
   - Auto-blocking bots agressifs

3. **API protégée**
   - Edge Functions avec CORS
   - Authentification optionnelle
   - Logs d'activité

4. **Frontend optimisé**
   - Chargement lazy (50 mots à la fois)
   - Cache local (localStorage)
   - UX fluide

### 🔐 NIVEAU SÉCURITÉ

**Avant (Niveau 1):**
```
🔴 9000 mots dans build JS (accessible à tous)
🔴 Aucune protection scraping
🔴 Peut dumper tout le contenu en 1 clic
```

**Après (Niveau 3):**
```
🟢 Données dans backend sécurisé
🟢 Rate limiting multi-couches
🟢 Max 50 mots par requête
🟢 Impossible de scraper les 9000 mots facilement
🟢 Tracking activité suspecte
```

---

## 📊 UTILISATION GRATUITE SUPABASE

**Plan Free:**
- ✅ 500 MB database (9000 mots = ~5 MB)
- ✅ 1 GB bandwidth/mois
- ✅ 2M Edge Function invocations/mois
- ✅ 50,000 Monthly Active Users
- ✅ Row Level Security illimité

**Calcul pour ton app:**
```
50 requêtes API/jour/utilisateur × 30 jours × 100 utilisateurs
= 150,000 requêtes/mois

➡️ LARGEMENT dans le plan gratuit (2M max)
```

**Quand upgrader (payant):**
- Si > 1 GB bandwidth/mois
- Si > 500 MB database (ajouter quiz, audio, etc.)
- Si besoin support prioritaire

**Coût plan Pro:** $25/mois (si dépassement)

---

## ❓ DÉPANNAGE

### Erreur: "Table vocabulary not found"

**Cause:** Migration SQL pas exécutée  
**Solution:** Retour Étape 4 - Exécuter `001_initial_schema.sql`

### Erreur: "Invalid API key"

**Cause:** Variables .env incorrectes  
**Solution:** Vérifier `.env` - copier/coller depuis Supabase Dashboard → Settings → API

### Erreur: "CORS policy"

**Cause:** Edge Function pas déployée ou CORS mal configuré  
**Solution:** Vérifier `/supabase/functions/_shared/cors.ts` existe et est importé

### Import échoue: "Timeout"

**Cause:** Trop de mots en un batch  
**Solution:** Script fait déjà batches de 100 - vérifier connexion internet

### Frontend affiche "Loading..." indéfiniment

**Cause:** Variables Vercel pas configurées  
**Solution:** Étape 7 - Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

---

## 🚀 NEXT STEPS APRÈS SETUP

1. **Activer Cloudflare** (Niveau 2 + Niveau 3 = combo parfait)
2. **Ajouter authentification** (Supabase Auth - email ou Google)
3. **Importer quiz, audio, etc.** dans Supabase
4. **Monitoring** (Supabase Dashboard → Logs)
5. **Backups automatiques** (inclus dans plan Free)

---

## 📞 SUPPORT

**Si bloqué:**
1. Lire `/FRONTEND_MIGRATION_GUIDE.md`
2. Vérifier checklist ci-dessus
3. Consulter logs Supabase (Dashboard → Logs)
4. Demander à l'assistant (moi!) 😊

---

**⏱️ Temps total: ~1 heure**  
**🎯 Difficulté: Moyenne (copier/coller principalement)**  
**💪 Résultat: Sécurité production-grade 100% gratuite**

**LET'S GO! 🚀**
