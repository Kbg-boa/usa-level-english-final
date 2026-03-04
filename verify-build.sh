#!/bin/bash

# ============================================================================
# SCRIPT DE VÉRIFICATION BUILD
# Exécuter avant de push sur GitHub
# ============================================================================

echo "🔍 USA Level English - Vérification Build"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
ERRORS=0
WARNINGS=0

# ============================================================================
# 1. Vérifier Node version
# ============================================================================
echo "1️⃣  Vérification version Node..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node version trop ancienne: $(node -v)${NC}"
  echo -e "${YELLOW}   Requis: Node >= 18${NC}"
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}✅ Node version OK: $(node -v)${NC}"
fi
echo ""

# ============================================================================
# 2. Vérifier que node_modules existe
# ============================================================================
echo "2️⃣  Vérification node_modules..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules n'existe pas${NC}"
  echo "   Exécution de npm install..."
  npm install
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ npm install réussi${NC}"
  else
    echo -e "${RED}❌ npm install échoué${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${GREEN}✅ node_modules existe${NC}"
fi
echo ""

# ============================================================================
# 3. Vérifier package.json
# ============================================================================
echo "3️⃣  Vérification package.json..."
if grep -q "@supabase/supabase-js" package.json; then
  echo -e "${GREEN}✅ @supabase/supabase-js présent${NC}"
else
  echo -e "${YELLOW}⚠️  @supabase/supabase-js manquant${NC}"
  echo "   Exécution de npm install @supabase/supabase-js..."
  npm install @supabase/supabase-js
  WARNINGS=$((WARNINGS+1))
fi

if grep -q '"type": "module"' package.json; then
  echo -e "${GREEN}✅ type: module configuré${NC}"
else
  echo -e "${RED}❌ type: module manquant dans package.json${NC}"
  ERRORS=$((ERRORS+1))
fi
echo ""

# ============================================================================
# 4. Vérifier l'absence de figma:asset
# ============================================================================
echo "4️⃣  Vérification imports figma:asset..."
FIGMA_IMPORTS=$(grep -r "figma:asset" src/ 2>/dev/null | wc -l)
if [ "$FIGMA_IMPORTS" -gt 0 ]; then
  echo -e "${RED}❌ $FIGMA_IMPORTS imports figma:asset trouvés${NC}"
  grep -r "figma:asset" src/
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}✅ Aucun import figma:asset trouvé${NC}"
fi
echo ""

# ============================================================================
# 5. Vérifier que .env n'est pas dans git
# ============================================================================
echo "5️⃣  Vérification .env..."
if [ -f ".env" ]; then
  if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}❌ .env est tracké par git (DANGER!)${NC}"
    echo "   Exécuter: git rm --cached .env"
    ERRORS=$((ERRORS+1))
  else
    echo -e "${GREEN}✅ .env existe mais n'est pas tracké${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .env n'existe pas${NC}"
  echo "   (Optionnel pour le build Vercel)"
fi
echo ""

# ============================================================================
# 6. Vérifier .gitignore
# ============================================================================
echo "6️⃣  Vérification .gitignore..."
if [ -f ".gitignore" ]; then
  if grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
    echo -e "${GREEN}✅ .gitignore configuré correctement${NC}"
  else
    echo -e "${YELLOW}⚠️  .gitignore incomplet${NC}"
    WARNINGS=$((WARNINGS+1))
  fi
else
  echo -e "${RED}❌ .gitignore manquant${NC}"
  ERRORS=$((ERRORS+1))
fi
echo ""

# ============================================================================
# 7. TEST BUILD
# ============================================================================
echo "7️⃣  Test build production..."
echo "   (Ceci peut prendre 30-60 secondes...)"
npm run build > /tmp/build.log 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build réussi!${NC}"
  
  # Vérifier la taille du bundle
  if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "   📦 Taille du build: $DIST_SIZE"
    
    # Vérifier que index.html existe
    if [ -f "dist/index.html" ]; then
      echo -e "${GREEN}   ✅ index.html généré${NC}"
    else
      echo -e "${RED}   ❌ index.html manquant${NC}"
      ERRORS=$((ERRORS+1))
    fi
  fi
else
  echo -e "${RED}❌ Build échoué${NC}"
  echo ""
  echo "Dernières lignes du log:"
  tail -20 /tmp/build.log
  ERRORS=$((ERRORS+1))
fi
echo ""

# ============================================================================
# 8. Vérifier vercel.json
# ============================================================================
echo "8️⃣  Vérification vercel.json..."
if [ -f "vercel.json" ]; then
  if grep -q "X-Frame-Options" vercel.json && grep -q "Strict-Transport-Security" vercel.json; then
    echo -e "${GREEN}✅ Headers de sécurité configurés${NC}"
  else
    echo -e "${YELLOW}⚠️  Headers de sécurité incomplets${NC}"
    WARNINGS=$((WARNINGS+1))
  fi
else
  echo -e "${YELLOW}⚠️  vercel.json manquant (optionnel)${NC}"
  WARNINGS=$((WARNINGS+1))
fi
echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo "=========================================="
echo "🎯 RÉSUMÉ"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Aucune erreur bloquante${NC}"
else
  echo -e "${RED}❌ $ERRORS erreur(s) bloquante(s)${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Aucun warning${NC}"
else
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🚀 BUILD READY - Tu peux push sur GitHub!${NC}"
  echo ""
  echo "Commandes à exécuter:"
  echo "  git add ."
  echo "  git commit -m \"Add production security architecture\""
  echo "  git push origin main"
  echo ""
  exit 0
else
  echo -e "${RED}🛑 CORRIGE LES ERREURS AVANT DE PUSH${NC}"
  echo ""
  echo "Voir BUILD_VERIFICATION.md pour de l'aide"
  echo ""
  exit 1
fi
