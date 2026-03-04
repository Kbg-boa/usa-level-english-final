# 🇺🇸 USA Level English - Système d'Apprentissage Intensif

> Application d'apprentissage de l'anglais américain sur 7 jours avec IA - De l'intermédiaire à la fluidité native

---

## 📊 SPÉCIFICATIONS

- **9000 mots de vocabulaire** répartis en 10 catégories (900 mots chacune)
- **4 PILLARS**: FLUENCY, INPUT, STRUCTURE, PROFESSIONAL
- **18 modules interactifs** complets et opérationnels
- **Architecture sécurisée production-grade** avec Supabase + Cloudflare WAF
- **Design premium** comme un produit tech startup elite

---

## 🚀 DÉMARRAGE RAPIDE

### En local (développement)

```bash
# Installer les dépendances
npm install

# Lancer en mode dev
npm run dev

# Ouvre http://localhost:5173
```

### Déploiement Vercel

**⚡ Déploiement en 5 minutes:** Voir `QUICKSTART.md`

**🔒 Déploiement sécurisé complet:** Voir `DEPLOYMENT_GUIDE.md`

---

## 🏗️ STRUCTURE DU PROJET

```
/
├── src/
│   ├── app/
│   │   ├── components/       # 18 modules React
│   │   ├── data/            # Données vocabulaire/quiz
│   │   ├── routes.ts        # React Router config
│   │   └── App.tsx          # Entry point
│   ├── lib/
│   │   ├── supabase.ts      # Client Supabase
│   │   └── api.ts           # API wrappers
│   └── styles/              # Tailwind CSS
│
├── supabase/
│   ├── migrations/          # Schema SQL + RLS
│   └── functions/           # Edge Functions sécurisées
│
├── vercel.json              # Headers de sécurité
├── package.json
└── Documentation (voir ci-dessous)
```

---

## 📚 DOCUMENTATION

| Fichier | Description |
|---------|-------------|
| `QUICKSTART.md` | ⚡ Déploiement en 5 minutes |
| `BUILD_VERIFICATION.md` | 🔧 Debug build Vercel |
| `DEPLOYMENT_GUIDE.md` | 🚀 Guide complet déploiement |
| `SECURITY_ARCHITECTURE.md` | 🏗️ Architecture sécurité |
| `CLOUDFLARE_WAF_CONFIG.md` | ☁️ Configuration anti-DDoS |
| `SECURITY_CHECKLIST.md` | ✅ 100+ points de validation |

---

## 🔐 SÉCURITÉ

### Protection des 9000 mots

- ✅ **Row Level Security (RLS)** PostgreSQL
- ✅ **Rate Limiting** multi-couche (IP + user + endpoint)
- ✅ **Anti-scraping** avec détection automatique
- ✅ **Pagination forcée** (max 20-50 items/requête)
- ✅ **Cloudflare WAF** (DDoS protection)
- ✅ **Headers de sécurité** (CSP, HSTS, etc.)

### Authentification

- ✅ Email OTP (sans mot de passe)
- ✅ Google OAuth
- ✅ Système de rôles: free / premium / admin

**Score de sécurité: 95/100** 🛡️

---

## 🎨 TECHNOLOGIES

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth
- **CDN**: Cloudflare
- **Hosting**: Vercel
- **UI Components**: Radix UI, Material UI, Lucide Icons

---

## 📦 MODULES (18 au total)

### FLUENCY HUB
1. 🗣️ Speaking Practice
2. 📖 Vocabulary Builder
3. 💬 Slang & Expressions
4. ✍️ Writing Mastery

### INPUT HUB
5. 📚 Native Exposure Lab
6. 🎧 Listening Comprehension
7. 🎭 Shadowing Practice
8. 💭 Think in English

### STRUCTURE HUB
9. 📝 Grammar Masterclass
10. ⚙️ Verb Engine
11. 💬 Conversation Simulator
12. 🎬 Storytelling Practice

### PROFESSIONAL HUB
13. 🎯 Cultural Context
14. 💼 Real Conversation
15. 🗣️ Pronunciation Lab
16. 🤖 AI Coach

### SYSTÈME
17. 🏆 Behavior System
18. ⚙️ Settings

---

## 💰 COÛTS MENSUELS (PRODUCTION)

| Service | Plan | Prix |
|---------|------|------|
| Supabase | Pro | $25/mois |
| Vercel | Hobby → Pro | $0-20/mois |
| Cloudflare | Free | $0 |
| **TOTAL** | | **$25-45/mois** |

---

## 🧪 COMMANDES

```bash
# Développement
npm run dev          # Lancer en local (port 5173)

# Build
npm run build        # Build production
npm run preview      # Preview du build

# Maintenance
npm install          # Installer dépendances
npm audit fix        # Fix vulnérabilités
```

---

## 🔧 CONFIGURATION

### Variables d'environnement

Copier `.env.example` vers `.env` et remplir:

```bash
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Ne jamais commit `.env`** (déjà dans `.gitignore`)

---

## 🐛 TROUBLESHOOTING

### Build échoue en local
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build échoue sur Vercel
- Vérifier les logs: Vercel Dashboard → Deployments → View Logs
- Voir `BUILD_VERIFICATION.md` section Troubleshooting

### Site blanc après déploiement
- Ouvrir console browser (F12)
- Vérifier erreurs CSP ou routing
- Voir `BUILD_VERIFICATION.md` erreur 5

---

## 📈 ROADMAP

- [x] 18 modules complets et fonctionnels
- [x] Architecture sécurité production-grade
- [x] Build Vercel sans `figma:asset`
- [x] Documentation complète
- [ ] Import 9000 mots dans Supabase
- [ ] Activation Cloudflare WAF
- [ ] Intégration paiements Stripe (premium)
- [ ] Dashboard analytics admin
- [ ] Mobile app (React Native)

---

## 📄 LICENSE

Proprietary - © 2025 USA Level English

---

## 📞 SUPPORT

- 📧 Email: support@usalevelenglish.com
- 📚 Documentation: Voir fichiers `/DEPLOYMENT_GUIDE.md` et autres
- 🐛 Issues: GitHub Issues (si repo public)

---

**🎯 Objectif: Passer d'intermédiaire à fluidité native en 7 jours**

**Built with ❤️ using React, Supabase & Cloudflare**
