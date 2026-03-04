#!/bin/bash

# ============================================================================
# Script de test sécurité automatique
# Usage: ./scripts/test-security.sh https://ton-site.vercel.app
# ============================================================================

if [ -z "$1" ]; then
  echo "❌ Usage: $0 <URL>"
  echo "   Exemple: $0 https://ton-site.vercel.app"
  exit 1
fi

URL="$1"
SCORE=0
TOTAL=0

echo "======================================================================"
echo "🔒 TEST DE SÉCURITÉ - $URL"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Headers HTTP (15 points)
# ============================================================================
echo "1️⃣  Test Headers HTTP..."
TOTAL=$((TOTAL + 15))

HEADERS=$(curl -s -I "$URL" 2>/dev/null)

if echo "$HEADERS" | grep -qi "content-security-policy"; then
  echo "  ✅ CSP header présent (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ CSP header manquant (0)"
fi

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  echo "  ✅ HSTS header présent (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ HSTS header manquant (0)"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
  echo "  ✅ X-Frame-Options présent (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ X-Frame-Options manquant (0)"
fi

echo ""

# ============================================================================
# Test 2: HTTPS forcé (10 points)
# ============================================================================
echo "2️⃣  Test HTTPS forcé..."
TOTAL=$((TOTAL + 10))

HTTP_URL="${URL/https/http}"
HTTP_RESPONSE=$(curl -s -I -L "$HTTP_URL" 2>/dev/null | grep -i "HTTP" | head -1)

if echo "$HTTP_RESPONSE" | grep -q "301\|302\|307\|308"; then
  echo "  ✅ Redirection HTTPS active (+10)"
  SCORE=$((SCORE + 10))
else
  echo "  ❌ Pas de redirection HTTPS (0)"
fi

echo ""

# ============================================================================
# Test 3: Protection XSS Headers (10 points)
# ============================================================================
echo "3️⃣  Test Protection XSS..."
TOTAL=$((TOTAL + 10))

if echo "$HEADERS" | grep -qi "x-xss-protection"; then
  echo "  ✅ X-XSS-Protection présent (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ X-XSS-Protection manquant (0)"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  echo "  ✅ X-Content-Type-Options présent (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ X-Content-Type-Options manquant (0)"
fi

echo ""

# ============================================================================
# Test 4: Cloudflare actif (15 points)
# ============================================================================
echo "4️⃣  Test Cloudflare..."
TOTAL=$((TOTAL + 15))

if echo "$HEADERS" | grep -qi "cf-ray"; then
  echo "  ✅ Cloudflare détecté (+15)"
  SCORE=$((SCORE + 15))
else
  echo "  🟡 Cloudflare non détecté (0)"
  echo "     → Activer Cloudflare pour +15 points"
fi

echo ""

# ============================================================================
# Test 5: Rate Limiting (10 points)
# ============================================================================
echo "5️⃣  Test Rate Limiting (10 requêtes rapides)..."
TOTAL=$((TOTAL + 10))

BLOCKED=0
for i in {1..10}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)
  if [ "$STATUS" == "429" ] || [ "$STATUS" == "403" ]; then
    BLOCKED=$((BLOCKED + 1))
  fi
  sleep 0.1
done

if [ "$BLOCKED" -gt 0 ]; then
  echo "  ✅ Rate limiting actif ($BLOCKED/10 bloquées) (+10)"
  SCORE=$((SCORE + 10))
else
  echo "  🟡 Pas de rate limiting détecté (0)"
  echo "     → Configurer Cloudflare ou Supabase pour +10 points"
fi

echo ""

# ============================================================================
# Test 6: Données protégées (20 points)
# ============================================================================
echo "6️⃣  Test Protection données..."
TOTAL=$((TOTAL + 20))

BODY=$(curl -s "$URL" 2>/dev/null)

# Chercher vocabularyDatabase dans le HTML/JS
if echo "$BODY" | grep -q "vocabularyDatabase"; then
  echo "  ⚠️  Données statiques détectées (0)"
  echo "     → Migrer vers Supabase pour +20 points"
else
  echo "  ✅ Pas de données statiques détectées (+20)"
  SCORE=$((SCORE + 20))
fi

echo ""

# ============================================================================
# Test 7: SSL/TLS Quality (10 points)
# ============================================================================
echo "7️⃣  Test SSL/TLS..."
TOTAL=$((TOTAL + 10))

TLS_VERSION=$(echo "$HEADERS" | grep -i "TLS" | head -1)

if curl -s --tlsv1.3 "$URL" > /dev/null 2>&1; then
  echo "  ✅ TLS 1.3 supporté (+10)"
  SCORE=$((SCORE + 10))
elif curl -s --tlsv1.2 "$URL" > /dev/null 2>&1; then
  echo "  🟡 TLS 1.2 supporté (+5)"
  SCORE=$((SCORE + 5))
else
  echo "  ❌ TLS obsolète (0)"
fi

echo ""

# ============================================================================
# Test 8: Bot Protection (10 points)
# ============================================================================
echo "8️⃣  Test Protection Bots..."
TOTAL=$((TOTAL + 10))

BOT_RESPONSE=$(curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1)" -I "$URL" 2>/dev/null)
BOT_STATUS=$(echo "$BOT_RESPONSE" | grep "HTTP" | head -1 | awk '{print $2}')

if [ "$BOT_STATUS" == "403" ] || echo "$BOT_RESPONSE" | grep -qi "captcha"; then
  echo "  ✅ Protection bots active (+10)"
  SCORE=$((SCORE + 10))
else
  echo "  🟡 Pas de protection bots détectée (0)"
  echo "     → Activer Cloudflare Bot Fight Mode pour +10 points"
fi

echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo "======================================================================"
echo "📊 RÉSUMÉ"
echo "======================================================================"
echo ""

PERCENTAGE=$((SCORE * 100 / TOTAL))

echo "Score: $SCORE / $TOTAL points ($PERCENTAGE%)"
echo ""

if [ "$PERCENTAGE" -ge 90 ]; then
  echo "🟢 EXCELLENT - Sécurité production-grade"
  echo "   Niveau 3 actif (Supabase + Cloudflare)"
elif [ "$PERCENTAGE" -ge 70 ]; then
  echo "🟡 BON - Sécurité solide"
  echo "   Niveau 2 actif (Cloudflare)"
  echo "   → Migrer vers Supabase pour atteindre 95%"
elif [ "$PERCENTAGE" -ge 40 ]; then
  echo "🟡 ACCEPTABLE - Sécurité basique"
  echo "   Niveau 1 actif (Headers Vercel)"
  echo "   → Activer Cloudflare pour 70%"
  echo "   → Migrer Supabase pour 95%"
else
  echo "🔴 FAIBLE - Amélioration nécessaire"
  echo "   → Vérifier configuration Vercel"
  echo "   → Redéployer le site"
fi

echo ""
echo "======================================================================"
echo "📖 RECOMMANDATIONS"
echo "======================================================================"
echo ""

if [ "$PERCENTAGE" -lt 70 ]; then
  echo "1. Activer Cloudflare (15 min)"
  echo "   → Protection bots + Rate limiting"
  echo "   → Score: +30 points"
  echo ""
fi

if [ "$PERCENTAGE" -lt 90 ]; then
  echo "2. Configurer Supabase (1h)"
  echo "   → Protéger données backend"
  echo "   → Score: +20 points"
  echo "   → Guide: /SUPABASE_SETUP_GUIDE.md"
  echo ""
fi

echo "3. Monitoring continu"
echo "   → https://securityheaders.com (scan en ligne)"
echo "   → Supabase Dashboard (logs activité)"
echo ""

echo "======================================================================"
echo "Test terminé ! 🔒"
echo "======================================================================"
