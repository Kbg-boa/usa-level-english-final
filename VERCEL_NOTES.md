# 📝 NOTES IMPORTANTES POUR VERCEL

## ⚠️ CONFIGURATION REQUISE

### Build Settings (normalement auto-détecté)

```
Framework Preset:     Vite
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
Node.js Version:      18.x (ou 20.x)
```

**⚠️ Si le build utilise pnpm:**
```
Install Command:      pnpm install
```

---

## 🔑 VARIABLES D'ENVIRONNEMENT

### Optionnelles (pour l'instant)

L'app fonctionne **SANS** ces variables (données statiques).

Tu peux les ajouter plus tard quand tu configures Supabase:

```
VITE_SUPABASE_URL=https://temp.supabase.co
VITE_SUPABASE_ANON_KEY=temp-key-123
```

**Comment ajouter:**
1. Vercel Dashboard → ton projet
2. Settings → Environment Variables
3. Ajouter les variables
4. Redeploy (Deployments → ... → Redeploy)

---

## ✅ CE QUI DOIT FONCTIONNER IMMÉDIATEMENT

### Sans variables d'environnement:
- ✅ Build passe
- ✅ Site accessible
- ✅ Navigation fonctionne
- ✅ 18 modules affichés
- ✅ Design responsive

### Ce qui NE fonctionnera PAS (normal):
- ❌ Connexion Supabase (pas configuré)
- ❌ Authentification (pas configuré)
- ❌ Rate limiting backend (pas configuré)

**C'est normal !** Ces features s'activent quand tu configures Supabase.

---

## 🐛 ERREURS COMMUNES VERCEL

### ❌ "Build failed with exit code 1"

**Solution 1: Vérifier logs**
- Deployments → Click deployment → View Logs
- Chercher "error" ou "failed"

**Solution 2: Build local d'abord**
```bash
npm run build
```
Si ça échoue en local, corrige d'abord localement.

**Solution 3: Nettoyer cache Vercel**
- Deployments → ... → Redeploy
- Cocher "Clear build cache"

---

### ❌ "Cannot find module 'X'"

**Cause:** Package manquant dans `package.json`

**Solution:**
```bash
npm install <package-manquant>
git add package.json package-lock.json
git commit -m "Add missing package"
git push
```

---

### ❌ "Error: Environment variable VITE_X is not defined"

**Cause:** Variable d'environnement requise manquante

**Solution:**
1. Settings → Environment Variables
2. Ajouter la variable
3. Redeploy

**Pour notre projet:** Les variables sont **OPTIONNELLES** pour l'instant.

---

### ❌ "404 Not Found" sur les routes

**Cause:** Rewrites manquants pour SPA

**Solution:** Vérifier que `vercel.json` contient:
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

**Status:** ✅ Déjà configuré

---

### ❌ Site blanc (blank page) après déploiement

**Diagnostic:**
1. Ouvrir console browser (F12)
2. Chercher erreurs

**Causes possibles:**
- **CSP trop stricte:** Erreurs type "refused to load"
  → Modifier `vercel.json` headers CSP
  
- **Routes non configurées:** Erreur 404
  → Vérifier `vercel.json` rewrites

- **Assets manquants:** Erreur 404 pour JS/CSS
  → Vérifier que `dist/` contient les fichiers

**Solution:**
```bash
# Build local et vérifier dist/
npm run build
ls -la dist/
```

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### 1. Status Deployment
- ✅ Ready (vert)
- ❌ Error (rouge) → Voir logs

### 2. URL accessible
```bash
curl -I https://ton-app.vercel.app
```
Doit retourner `200 OK`

### 3. Headers sécurité présents
```bash
curl -I https://ton-app.vercel.app | grep "x-frame-options"
```
Doit afficher: `x-frame-options: DENY`

### 4. Navigation fonctionne
- Ouvrir le site
- Cliquer sur différentes pages
- Vérifier qu'aucune 404

### 5. Console browser propre
- F12 → Console
- Aucune erreur rouge (warnings jaunes OK)

---

## 🔒 HEADERS DE SÉCURITÉ

### Configurés dans `/vercel.json`:

```
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy: camera=(), microphone=(), geolocation=()
✅ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
✅ Content-Security-Policy: (configuré)
```

**Valider:** https://securityheaders.com/?q=ton-url-vercel.app

**Score attendu:** A ou A+

---

## 📊 MÉTRIQUES À SURVEILLER

### Vercel Dashboard → Analytics

1. **Requests:** Nombre de requêtes
2. **Bandwidth:** Bande passante utilisée
3. **Build Time:** Temps de build (normal: 30-60s)
4. **Error Rate:** Taux d'erreur (doit être < 1%)

### Vercel Dashboard → Deployments

- **Success Rate:** Doit être ~100%
- **Build Time Trend:** Doit rester stable

---

## 🚀 OPTIMISATIONS AVANCÉES (OPTIONNEL)

### Activer Vercel Speed Insights
1. Dashboard → Analytics
2. Enable Speed Insights
3. Voir Core Web Vitals

### Activer Image Optimization
```json
// vercel.json
{
  "images": {
    "domains": ["images.unsplash.com"]
  }
}
```

### Activer Edge Functions (quand Supabase est configuré)
- Utiliser `export const config = { runtime: 'edge' }`
- Plus rapide que Serverless Functions

---

## 🔄 WORKFLOW GIT → VERCEL

```
git push origin main
   ↓
Vercel détecte le push
   ↓
Install dependencies (npm install)
   ↓
Build (npm run build)
   ↓
Deploy (upload dist/ to CDN)
   ↓
Status: Ready ✅
   ↓
URL accessible: https://ton-app.vercel.app
```

**Temps total:** 2-4 minutes

---

## 📱 DOMAINE CUSTOM (OPTIONNEL)

### Ajouter un domaine
1. Settings → Domains
2. Add Domain → `usalevelenglish.com`
3. Configure DNS (si pas chez Vercel)
4. Attendre propagation DNS (5 min - 48h)

### Recommandation
**Utilise Cloudflare pour le DNS** (gratuit + WAF)
- Meilleure sécurité
- Cache CDN
- DDoS protection

---

## 🆘 SUPPORT VERCEL

### Documentation
- https://vercel.com/docs

### Status Page
- https://www.vercel-status.com

### Community
- https://github.com/vercel/vercel/discussions

### Contact
- Dashboard → Help → Contact Support

---

## ✅ CHECKLIST VERCEL

Avant de considérer le déploiement "production-ready":

- [ ] Build passe ✅ (status: Ready)
- [ ] URL accessible
- [ ] Navigation fonctionne
- [ ] Aucune erreur 404 assets
- [ ] Headers sécurité configurés
- [ ] Score securityheaders.com > A
- [ ] Console browser sans erreurs
- [ ] Mobile responsive (tester)
- [ ] Performance acceptable (Lighthouse)

---

## 🎯 RÉSUMÉ

**Ce qui fonctionne maintenant:**
- ✅ Build automatique sur push
- ✅ Déploiement CDN global
- ✅ HTTPS automatique
- ✅ Headers de sécurité
- ✅ Routing SPA

**Ce qui sera activé plus tard:**
- 🔄 Variables d'env Supabase
- 🔄 Domaine custom
- 🔄 Edge Functions
- 🔄 Analytics avancés

---

**📝 Prends des notes des URLs importantes:**

```
Vercel Dashboard:     https://vercel.com/dashboard
Ton projet URL:       https://_________________.vercel.app
Supabase Dashboard:   https://supabase.com/dashboard (quand configuré)
Cloudflare Dashboard: https://dash.cloudflare.com (quand configuré)
```

---

**🚀 Vercel est configuré et prêt à déployer !**
