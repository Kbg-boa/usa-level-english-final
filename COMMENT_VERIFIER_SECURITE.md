# 🔒 COMMENT VÉRIFIER QUE LA SÉCURITÉ MARCHE

Guide pratique pour tester la sécurité de ton app à chaque niveau.

---

## 📊 TON NIVEAU ACTUEL

**MAINTENANT (sans Supabase configuré):**
- ✅ Niveau 1 actif (Headers sécurité)
- 🟡 Niveau 2 désactivé (Cloudflare pas configuré)
- 🟡 Niveau 3 désactivé (Supabase pas configuré)

**Score actuel:** 40/100

---

## 🧪 TESTS NIVEAU 1 (ACTUEL) - Headers Sécurité

### Test 1: Vérifier les headers HTTP

**Étapes:**
1. Va sur ton site en production: `https://ton-site.vercel.app`
2. Ouvre DevTools (F12)
3. Onglet **Network**
4. Refresh la page (F5)
5. Clic sur la première requête (ton site)
6. Onglet **Headers** → Section **Response Headers**

**Ce que tu DOIS voir ✅:**

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), microphone=(), camera=()
```

**✅ Si tu vois ces headers = Niveau 1 actif !**

---

### Test 2: Tester protection XSS

**Ouvrir la console DevTools:**

```javascript
// Essayer d'injecter script malveillant
document.body.innerHTML += '<img src=x onerror=alert("XSS")>';
```

**Résultat attendu:**
- ❌ Alert ne s'affiche PAS (bloqué par CSP)
- ✅ Erreur dans console: "Refused to execute inline event handler"

**✅ Si erreur CSP = Protection XSS active !**

---

### Test 3: Tester protection Clickjacking

**Essayer d'embed ton site dans iframe:**

1. Créer fichier test `test-iframe.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Clickjacking</h1>
  <iframe src="https://ton-site.vercel.app"></iframe>
</body>
</html>
```

2. Ouvrir ce fichier dans navigateur

**Résultat attendu:**
- ❌ Iframe vide (site ne charge pas)
- ✅ Erreur console: "Refused to display in a frame because it set 'X-Frame-Options' to 'DENY'"

**✅ Si iframe bloquée = Protection Clickjacking active !**

---

### Test 4: Vérifier HTTPS forcé

**Essayer HTTP:**
```
http://ton-site.vercel.app
```

**Résultat attendu:**
- ✅ Redirection automatique vers `https://ton-site.vercel.app`
- ✅ Header HSTS présent (force HTTPS pour 1 an)

**✅ Si redirection HTTPS = Protection active !**

---

## 🧪 TESTS NIVEAU 2 (CLOUDFLARE) - Si configuré

### Test 5: Vérifier protection bots

**Tester avec curl (simulate bot):**

```bash
# Linux/Mac
curl -I https://ton-site.vercel.app

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://ton-site.vercel.app" -Method Head
```

**Avec Cloudflare actif:**
- ✅ Captcha ou challenge page
- ✅ Header `cf-ray` présent
- ✅ Header `server: cloudflare`

**Sans Cloudflare (actuel):**
- 🟡 Site charge normalement
- 🟡 Pas de header `cloudflare`

---

### Test 6: Vérifier rate limiting

**Spammer requêtes (simulate attaque):**

```bash
# Envoyer 100 requêtes rapides
for i in {1..100}; do
  curl https://ton-site.vercel.app &
done
```

**Avec Cloudflare actif:**
- ✅ Après ~50 requêtes: Erreur 429 (Too Many Requests)
- ✅ Ou Captcha challenge

**Sans Cloudflare (actuel):**
- 🟡 Toutes les requêtes passent
- 🟡 Pas de limite

---

## 🧪 TESTS NIVEAU 3 (SUPABASE) - Après configuration

### Test 7: Vérifier données protégées

**AVANT Supabase (actuel):**

1. Va sur ton site
2. DevTools → **Sources** (ou **Debugger**)
3. Cherche fichier `vocabulary`
4. Regarde le contenu

**Ce que tu vois maintenant ❌:**
```javascript
// Tous les 9000 mots en clair dans le bundle JS
export const vocabularyDatabase = {
  'Daily Conversation': [
    { word: "What's up?", ... },
    { word: "How's it going?", ... },
    // ... 900 mots visibles
  ],
  // ... toutes les catégories
}
```

**Problème:** N'importe qui peut copier/coller les 9000 mots 😱

---

**APRÈS Supabase (futur):**

1. DevTools → **Sources**
2. Cherche `vocabulary`

**Ce que tu verras ✅:**
```javascript
// Juste des fonctions API, pas de données
export async function getVocabularyByCategory(category, limit) {
  return await supabaseClient.from('vocabulary')...
}
```

**Puis DevTools → Network:**
```
GET https://xxx.supabase.co/rest/v1/vocabulary?limit=50
Response: [50 mots seulement]
```

**✅ Données protégées ! Impossible de dump 9000 mots facilement.**

---

### Test 8: Vérifier rate limiting API

**Après Supabase configuré:**

```javascript
// Dans console DevTools
// Essayer de charger 10000 mots d'un coup
for (let i = 0; i < 200; i++) {
  fetch('https://xxx.supabase.co/rest/v1/vocabulary?limit=1000')
}
```

**Résultat attendu ✅:**
- ✅ Max 50-100 mots par requête (même si tu demandes 1000)
- ✅ Après ~20 requêtes: Erreur 429 (rate limit)
- ✅ Log dans Supabase Dashboard → "Suspicious activity detected"

**✅ Si rate limit = Anti-scraping actif !**

---

### Test 9: Vérifier Row Level Security (RLS)

**Après Supabase configuré:**

1. Va sur Supabase Dashboard
2. **SQL Editor** → New query
3. Essayer de modifier données directement:

```sql
-- Essayer de supprimer tout
DELETE FROM vocabulary;
```

**Résultat attendu ✅:**
- ❌ Erreur: "new row violates row-level security policy"
- ✅ Aucune donnée supprimée

**Essayer de lire avec mauvaise clé:**

```javascript
// Console DevTools
const fakeClient = createClient(
  'https://xxx.supabase.co',
  'fake-wrong-key-123456'
)

const { data } = await fakeClient.from('vocabulary').select()
console.log(data)
```

**Résultat attendu ✅:**
- ❌ Erreur 401: "Invalid API key"
- ✅ Aucune donnée retournée

**✅ Si erreur RLS = Données protégées !**

---

## 🎯 SCORES DE SÉCURITÉ

### Comment calculer ton score

| Test | Poids | Status actuel |
|------|-------|---------------|
| Headers HTTP (Test 1) | 15 pts | ✅ 15/15 |
| Protection XSS (Test 2) | 10 pts | ✅ 10/10 |
| Protection Clickjacking (Test 3) | 5 pts | ✅ 5/5 |
| HTTPS forcé (Test 4) | 10 pts | ✅ 10/10 |
| Protection bots (Test 5) | 15 pts | 🟡 0/15 (Cloudflare off) |
| Rate limiting (Test 6) | 10 pts | 🟡 0/10 (Cloudflare off) |
| Données protégées (Test 7) | 20 pts | 🟡 0/20 (Supabase off) |
| Rate limiting API (Test 8) | 10 pts | 🟡 0/10 (Supabase off) |
| RLS (Test 9) | 5 pts | 🟡 0/5 (Supabase off) |
| **TOTAL** | **100 pts** | **40/100** ⚠️ |

---

## 📋 CHECKLIST RAPIDE (5 MIN)

### Tests à faire MAINTENANT (Niveau 1)

```bash
# 1. Aller sur ton site production
https://ton-site.vercel.app

# 2. Ouvrir DevTools (F12)

# 3. Network → Refresh → Clic première requête

# 4. Vérifier Response Headers:
- [ ] content-security-policy présent
- [ ] strict-transport-security présent
- [ ] x-frame-options: DENY
- [ ] x-content-type-options: nosniff

# 5. Console → Tester XSS:
document.body.innerHTML += '<img src=x onerror=alert("XSS")>';
- [ ] Alert NE s'affiche PAS (bloqué)

# 6. Sources → Chercher "vocabulary"
- [ ] Les 9000 mots sont visibles (normal pour l'instant)

# 7. Test HTTPS:
- [ ] http:// redirige vers https://
```

**✅ Si tous ces tests passent = Niveau 1 actif !**

---

## 🚀 AUGMENTER LE SCORE

### Pour atteindre 70/100 (Niveau 2)

**Action:** Configurer Cloudflare (15 min)

**Nouveau score:** 70/100
- ✅ Tests 1-4 (40 pts)
- ✅ Tests 5-6 (25 pts)
- 🟡 Tests 7-9 (0 pts)

**Guide:** Voir section Cloudflare dans ta réponse précédente

---

### Pour atteindre 95/100 (Niveau 3)

**Action:** Configurer Supabase (1h)

**Nouveau score:** 95/100
- ✅ Tests 1-9 (95 pts)
- 🟡 Tests avancés (5 pts)

**Guide:** `/SUPABASE_SETUP_GUIDE.md`

---

## 🛠️ OUTILS DE TEST AUTOMATIQUES

### 1. Security Headers (En ligne)

**URL:** https://securityheaders.com

**Usage:**
1. Entre ton URL: `https://ton-site.vercel.app`
2. Clic **Scan**

**Score attendu actuel:**
- 🟢 Grade A ou B (avec headers Vercel)

---

### 2. Mozilla Observatory

**URL:** https://observatory.mozilla.org

**Usage:**
1. Entre ton URL
2. Clic **Scan Me**

**Score attendu actuel:**
- 🟢 60-70/100 (Niveau 1)

Après Supabase:
- 🟢 85-95/100 (Niveau 3)

---

### 3. SSL Labs

**URL:** https://www.ssllabs.com/ssltest/

**Usage:**
1. Entre ton hostname
2. Attend scan (2 min)

**Score attendu:**
- 🟢 Grade A+ (Vercel SSL excellent)

---

### 4. Test scraping (Manuel)

**Créer script test:**

```python
# test-scraping.py
import requests
import time

url = "https://ton-site.vercel.app"

# Essayer de scraper
for i in range(100):
    response = requests.get(url)
    print(f"Request {i}: {response.status_code}")
    time.sleep(0.1)
```

**Exécuter:**
```bash
python test-scraping.py
```

**Résultat actuel (Niveau 1):**
- 🟡 Toutes les requêtes: 200 OK
- 🟡 Pas de blocage

**Après Cloudflare (Niveau 2):**
- ✅ Après ~50: 429 Too Many Requests
- ✅ Ou Captcha challenge

---

## 📊 DASHBOARD DE SÉCURITÉ (Après Supabase)

### Vérifier activité suspecte

**Supabase Dashboard:**
1. Ton projet → **Table Editor**
2. Table **suspicious_activity**
3. Regarder les logs

**Ce que tu verras:**
```
IP              | Attempts | Type          | Timestamp
----------------|----------|---------------|-------------------
192.168.1.100   | 150      | Rate limit    | 2025-03-04 10:30
203.0.113.50    | 200      | Scraping      | 2025-03-04 11:15
```

**Actions:**
- ✅ Bloquer IP si > 500 attempts
- ✅ Analyser patterns
- ✅ Ajuster rate limits

---

### Vérifier rate limits

**Supabase Dashboard:**
1. Table **rate_limits**
2. Regarder compteurs

**Exemple:**
```
IP              | Endpoint    | Count | Window | Last reset
----------------|-------------|-------|--------|------------
192.168.1.100   | /vocab-get  | 45    | 1h     | 10:00
```

**✅ Si table se remplit = Rate limiting actif !**

---

## ❓ COMMENT INTERPRÉTER LES RÉSULTATS

### Headers présents ✅
**Signification:** Protection basique active  
**Score:** 40/100  
**Action:** Passer Niveau 2 ou 3

---

### Cloudflare détecté ✅
**Signification:** Protection bots + CDN actif  
**Score:** 70/100  
**Action:** Passer Niveau 3 pour max sécurité

---

### Données dans backend ✅
**Signification:** Contenu protégé, anti-scraping actif  
**Score:** 95/100  
**Action:** Monitoring régulier

---

## 🎯 RÉCAPITULATIF

### Tests MAINTENANT (5 min)
1. ✅ Test 1: Headers HTTP
2. ✅ Test 2: Protection XSS
3. ✅ Test 3: Clickjacking
4. ✅ Test 4: HTTPS forcé

**Résultat:** Niveau 1 confirmé (40/100)

---

### Tests APRÈS Cloudflare (2 min)
5. ✅ Test 5: Protection bots
6. ✅ Test 6: Rate limiting

**Résultat:** Niveau 2 confirmé (70/100)

---

### Tests APRÈS Supabase (5 min)
7. ✅ Test 7: Données protégées
8. ✅ Test 8: Rate limiting API
9. ✅ Test 9: RLS

**Résultat:** Niveau 3 confirmé (95/100)

---

## 📞 BESOIN D'AIDE ?

**Si un test échoue:**
1. Vérifier `vercel.json` (headers)
2. Redéployer sur Vercel
3. Vider cache navigateur (Ctrl+Shift+Del)
4. Tester en navigation privée

**Si tout échoue:**
- Check logs Vercel Dashboard
- Vérifier build réussi
- Demander à l'assistant

---

**⏱️ Temps tests Niveau 1: 5 minutes**  
**🎯 Score actuel attendu: 40/100**  
**🚀 Pour améliorer: Configurer Supabase (95/100)**
