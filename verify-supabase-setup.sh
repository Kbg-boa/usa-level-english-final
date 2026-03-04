#!/bin/bash

# ============================================================================
# Script de vérification AVANT PUSH - Supabase Setup
# ============================================================================

echo "======================================================================"
echo "VÉRIFICATION PRE-PUSH - SUPABASE SETUP"
echo "======================================================================"
echo ""

ERRORS=0

# ============================================================================
# 1. Vérifier que les nouveaux fichiers existent
# ============================================================================
echo "1️⃣  Vérification nouveaux fichiers..."

FILES=(
  "scripts/import-vocabulary.ts"
  "scripts/README.md"
  "SUPABASE_SETUP_GUIDE.md"
  "FRONTEND_MIGRATION_GUIDE.md"
  "SUPABASE_FILES_SUMMARY.md"
  "COMMIT_SUPABASE_RAPIDE.txt"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - MANQUANT"
    ERRORS=$((ERRORS+1))
  fi
done
echo ""

# ============================================================================
# 2. Vérifier package.json contient tsx et dotenv
# ============================================================================
echo "2️⃣  Vérification package.json..."

if grep -q '"tsx"' package.json; then
  echo "  ✅ tsx installé"
else
  echo "  ❌ tsx manquant dans package.json"
  ERRORS=$((ERRORS+1))
fi

if grep -q '"dotenv"' package.json; then
  echo "  ✅ dotenv installé"
else
  echo "  ❌ dotenv manquant dans package.json"
  ERRORS=$((ERRORS+1))
fi
echo ""

# ============================================================================
# 3. Vérifier aucun figma:asset dans src/
# ============================================================================
echo "3️⃣  Vérification imports figma:asset..."

FIGMA_IMPORTS=$(grep -r "from ['\"]figma:" src/ 2>/dev/null | wc -l)
if [ "$FIGMA_IMPORTS" -gt 0 ]; then
  echo "  ❌ $FIGMA_IMPORTS imports figma:asset trouvés"
  grep -r "from ['\"]figma:" src/
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ Aucun import figma:asset trouvé"
fi
echo ""

# ============================================================================
# 4. Vérifier .env n'est pas tracké par Git
# ============================================================================
echo "4️⃣  Vérification .env protection..."

if [ -f ".env" ]; then
  if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "  ⚠️  WARNING: .env est tracké par Git (DANGER!)"
    echo "  → Exécuter: git rm --cached .env"
    ERRORS=$((ERRORS+1))
  else
    echo "  ✅ .env existe mais pas tracké (OK)"
  fi
else
  echo "  ℹ️  .env n'existe pas (normal si pas encore configuré)"
fi
echo ""

# ============================================================================
# 5. Test de build
# ============================================================================
echo "5️⃣  Test build production..."

if npm run build > /tmp/build.log 2>&1; then
  echo "  ✅ Build réussi"
else
  echo "  ❌ Build échoué"
  echo ""
  echo "Logs d'erreur:"
  tail -20 /tmp/build.log
  ERRORS=$((ERRORS+1))
fi
echo ""

# ============================================================================
# 6. Vérifier taille des fichiers
# ============================================================================
echo "6️⃣  Vérification taille fichiers..."

TOTAL_SIZE=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file")
    TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
  fi
done

TOTAL_KB=$((TOTAL_SIZE / 1024))
echo "  ℹ️  Taille totale ajoutée: ${TOTAL_KB} KB"

if [ "$TOTAL_KB" -gt 500 ]; then
  echo "  ⚠️  Fichiers lourds (> 500 KB)"
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ Taille acceptable"
fi
echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo "======================================================================"
echo "RÉSUMÉ"
echo "======================================================================"
echo ""

if [ "$ERRORS" -eq 0 ]; then
  echo "✅ TOUTES LES VÉRIFICATIONS SONT OK"
  echo ""
  echo "Prêt à push:"
  echo "  git add ."
  echo "  git commit -m \"Add Supabase setup scripts and migration guides\""
  echo "  git push origin main"
  echo ""
  exit 0
else
  echo "❌ $ERRORS ERREUR(S) DÉTECTÉE(S)"
  echo ""
  echo "Corriger les erreurs avant de push."
  echo ""
  exit 1
fi
