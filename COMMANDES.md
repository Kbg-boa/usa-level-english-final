# ⚡ COMMANDES EXACTES - COPIER/COLLER

## 🔍 VÉRIFICATION LOCALE

### Mac/Linux
```bash
# Méthode 1: Script automatique (recommandé)
chmod +x verify-build.sh
./verify-build.sh

# Méthode 2: Manuelle
npm install
npm run build
```

### Windows
```cmd
REM Méthode 1: Script automatique (recommandé)
verify-build.bat

REM Méthode 2: Manuelle
npm install
npm run build
```

---

## ✅ SI BUILD PASSE

```bash
git add .
git commit -m "Add production security architecture + Vercel build ready"
git push origin main
```

---

## ❌ SI BUILD ÉCHOUE

### Nettoyage complet
```bash
# Mac/Linux
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
npm run build
```

### Vérifier erreurs spécifiques
```bash
# Erreur TypeScript
npx tsc --noEmit

# Erreur imports
npm run build 2>&1 | grep "Cannot find"

# Tester en dev mode
npm run dev
# Ouvrir http://localhost:5173 et vérifier console (F12)
```

---

## 🎯 APRÈS PUSH

### Vérifier déploiement Vercel
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur ton projet
3. **Deployments** → Dernier déploiement
4. Attendre status **Ready** ✅

### Tester en production
```bash
# Remplacer par ton URL Vercel
curl -I https://ton-app.vercel.app

# Vérifier headers de sécurité
curl -I https://ton-app.vercel.app | grep "x-frame-options\|strict-transport-security"
```

---

## 🔧 TROUBLESHOOTING RAPIDE

| Problème | Solution |
|----------|----------|
| `npm install` échoue | Supprimer `node_modules` et réessayer |
| `npm run build` échoue | Voir `/BUILD_VERIFICATION.md` |
| Vercel deploy échoue | Vérifier logs Vercel Dashboard → Deployments |
| Site blanc après deploy | F12 console → Voir erreurs CSP/routing |
| 404 sur routes | Vérifier `vercel.json` rewrites |

---

## 📚 DOCUMENTATION COMPLÈTE

- **Démarrage rapide:** `QUICKSTART.md`
- **Debug build:** `BUILD_VERIFICATION.md`
- **Guide complet:** `DEPLOYMENT_GUIDE.md`
- **Checklist:** `SECURITY_CHECKLIST.md`

---

## ⏱️ TEMPS ESTIMÉ

- Vérification locale: **2 minutes**
- Commit + push: **30 secondes**
- Build Vercel: **2-3 minutes**
- **TOTAL: ~5 minutes**

---

**🚀 C'est tout ce dont tu as besoin !**
