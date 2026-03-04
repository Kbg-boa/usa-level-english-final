# 🔧 VÉRIFICATION BUILD LOCAL + DÉPLOIEMENT VERCEL

## ✅ ÉTAPES DE VÉRIFICATION LOCALE

### 1️⃣ **Installer les dépendances**

```bash
npm install
```

**Si erreur "No pnpm version is specified":**
```bash
npm install -g pnpm
pnpm install
```

**Si erreur de version Node:**
```bash
# Vérifier version Node (doit être >= 18)
node -v

# Si < 18, installer nvm et upgrader
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

---

### 2️⃣ **Build en local**

```bash
npm run build
```

**Résultat attendu:**
```
✓ built in XXXms
✓ 150 modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-ABC123.js       XXX.XX kB
...
✓ Build successful
```

**Si erreur "Cannot find module":**
```bash
# Supprimer node_modules et reinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Si erreur "Out of memory":**
```bash
# Augmenter la limite mémoire Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

### 3️⃣ **Tester en local**

```bash
npm run dev
```

Ouvre http://localhost:5173

**Vérifier:**
- ✅ Page charge sans erreur console
- ✅ Navigation fonctionne
- ✅ Aucune erreur 404 pour les assets
- ✅ Aucune erreur CSP dans la console

---

## 🚀 DÉPLOIEMENT VERCEL

### Configuration initiale

#### A. Variables d'environnement (IMPORTANT)

1. Va dans Vercel Dashboard → ton projet → **Settings** → **Environment Variables**

2. Ajoute ces variables (pour l'instant avec des valeurs temporaires):

```bash
VITE_SUPABASE_URL=https://temp.supabase.co
VITE_SUPABASE_ANON_KEY=temp-key-123
```

⚠️ **Sans ces variables, le build Vercel échouera si tu utilises Supabase**

#### B. Build Settings (devrait être auto-détecté)

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

---

### Push et déploiement automatique

```bash
# Commit les changements
git add .
git commit -m "Add production security + fix Vercel build"
git push origin main
```

Vercel va automatiquement :
1. Détecter le push
2. Installer les dépendances
3. Build le projet
4. Déployer

**Suivre le déploiement:**
- Dashboard Vercel → ton projet → Deployments
- Clique sur le dernier déploiement pour voir les logs

---

## 🐛 TROUBLESHOOTING VERCEL

### ❌ ERREUR 1: "Build failed: Command exited with 1"

**Cause:** Erreur TypeScript ou import manquant

**Solution:**
```bash
# Vérifier localement
npm run build

# Lire les logs Vercel pour identifier le fichier problématique
# Exemple: "Cannot find module './missing-file'"
```

Corrige le fichier et re-push.

---

### ❌ ERREUR 2: "Module not found: Can't resolve 'X'"

**Cause:** Package manquant dans package.json

**Solution:**
```bash
# Installer le package manquant
npm install <package-name>

# Commit et push
git add package.json package-lock.json
git commit -m "Add missing package"
git push
```

---

### ❌ ERREUR 3: "Environment variable VITE_SUPABASE_URL is not defined"

**Cause:** Variables d'environnement manquantes

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Redeploy manuellement: Deployments → ... → Redeploy

---

### ❌ ERREUR 4: "Cannot use import statement outside a module"

**Cause:** Configuration ESM/CommonJS incorrecte

**Solution:**
Vérifier que `package.json` contient:
```json
{
  "type": "module"
}
```

Si ce n'est pas le cas:
```bash
npm pkg set type=module
git add package.json
git commit -m "Fix module type"
git push
```

---

### ❌ ERREUR 5: Build réussit mais site blanc (blank page)

**Cause:** CSP trop stricte ou routing incorrect

**Solution:**

1. Vérifier la console browser (F12) pour erreurs
2. Si erreur CSP, modifier `/vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
        }
      ]
    }
  ]
}
```

3. Si erreur routing 404, vérifier `vercel.json` contient:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔒 MODE SÉCURISÉ (OPTIONNEL - APRÈS BUILD OK)

Une fois que le build Vercel passe sans erreur, tu peux activer Supabase:

### Étape 1: Créer projet Supabase

1. Va sur https://supabase.com/dashboard
2. New Project → `usa-level-english`
3. Région: choisir proche de tes users
4. Password: générer et sauvegarder

### Étape 2: Exécuter la migration SQL

1. Supabase Dashboard → SQL Editor
2. New Query
3. Copie tout le contenu de `/supabase/migrations/001_initial_schema.sql`
4. RUN

### Étape 3: Récupérer les clés

1. Supabase → Settings → API
2. Copie:
   - Project URL
   - anon public key

### Étape 4: Mettre à jour Vercel env vars

1. Vercel → Settings → Environment Variables
2. Update:
   ```
   VITE_SUPABASE_URL=<ta-vraie-url>
   VITE_SUPABASE_ANON_KEY=<ta-vraie-key>
   ```
3. Redeploy

### Étape 5: Vérifier en production

```bash
# Ouvre la console du site en production (F12)
# Essaye de fetch du vocabulaire
fetch('https://ton-site.vercel.app/api/vocab')
```

---

## ✅ CHECKLIST BUILD VERCEL

Avant de considérer le build "production-ready":

- [ ] `npm install` fonctionne en local
- [ ] `npm run build` fonctionne en local
- [ ] `npm run dev` démarre sans erreur
- [ ] Aucune erreur dans la console browser (F12)
- [ ] Build Vercel passe (status: Ready ✅)
- [ ] Site accessible via URL Vercel
- [ ] Navigation fonctionne en production
- [ ] Aucun 404 pour les assets
- [ ] Headers de sécurité présents (vérifier avec `curl -I <url>`)
- [ ] (Optionnel) Supabase connecté et fonctionnel

---

## 📊 COMMANDES UTILES

```bash
# Nettoyer complètement
rm -rf node_modules dist .vercel
npm install
npm run build

# Vérifier la taille du bundle
npm run build -- --mode production
# Doit être < 5 MB idéalement

# Preview du build en local
npm run build
npm run preview
# Ouvre http://localhost:4173

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Lister tous les fichiers qui seront déployés
ls -lh dist/

# Tester les headers de sécurité en production
curl -I https://ton-site.vercel.app | grep -i "x-frame\|strict-transport\|content-security"
```

---

## 🆘 SI TOUT ÉCHOUE

### Plan B: Build minimal

Si le build continue à échouer, crée un fichier `/vercel.json` minimal:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Supprime temporairement les headers de sécurité, rebuild, puis rajoute-les progressivement.

---

## 📞 SUPPORT

- Vercel Status: https://www.vercel-status.com
- Vercel Support: https://vercel.com/support
- Build logs complets: Vercel Dashboard → Deployment → View Function Logs

---

**🎯 Objectif: Build passe ✅ → Déploiement réussi ✅ → Site accessible ✅**
