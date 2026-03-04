@echo off
REM ============================================================================
REM Script de test securite automatique (Windows)
REM Usage: scripts\test-security.bat https://ton-site.vercel.app
REM ============================================================================

if "%1"=="" (
    echo Erreur: URL manquante
    echo Usage: %0 ^<URL^>
    echo Exemple: %0 https://ton-site.vercel.app
    exit /b 1
)

set URL=%1
set SCORE=0
set TOTAL=90

echo ======================================================================
echo TEST DE SECURITE - %URL%
echo ======================================================================
echo.

REM ============================================================================
REM Test 1: Headers HTTP (15 points)
REM ============================================================================
echo 1. Test Headers HTTP...

curl -s -I "%URL%" > headers.tmp 2>nul

findstr /I "content-security-policy" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] CSP header present (+5^)
    set /a SCORE+=5
) else (
    echo   [ERREUR] CSP header manquant (0^)
)

findstr /I "strict-transport-security" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] HSTS header present (+5^)
    set /a SCORE+=5
) else (
    echo   [ERREUR] HSTS header manquant (0^)
)

findstr /I "x-frame-options" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] X-Frame-Options present (+5^)
    set /a SCORE+=5
) else (
    echo   [ERREUR] X-Frame-Options manquant (0^)
)

echo.

REM ============================================================================
REM Test 2: HTTPS force (10 points)
REM ============================================================================
echo 2. Test HTTPS force...

set HTTP_URL=%URL:https=http%
curl -s -I -L "%HTTP_URL%" | findstr /I "301 302 307 308" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Redirection HTTPS active (+10^)
    set /a SCORE+=10
) else (
    echo   [ERREUR] Pas de redirection HTTPS (0^)
)

echo.

REM ============================================================================
REM Test 3: Protection XSS (10 points)
REM ============================================================================
echo 3. Test Protection XSS...

findstr /I "x-xss-protection" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] X-XSS-Protection present (+5^)
    set /a SCORE+=5
) else (
    echo   [ERREUR] X-XSS-Protection manquant (0^)
)

findstr /I "x-content-type-options" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] X-Content-Type-Options present (+5^)
    set /a SCORE+=5
) else (
    echo   [ERREUR] X-Content-Type-Options manquant (0^)
)

echo.

REM ============================================================================
REM Test 4: Cloudflare (15 points)
REM ============================================================================
echo 4. Test Cloudflare...

findstr /I "cf-ray" headers.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Cloudflare detecte (+15^)
    set /a SCORE+=15
) else (
    echo   [INFO] Cloudflare non detecte (0^)
    echo      Activer Cloudflare pour +15 points
)

echo.

REM ============================================================================
REM Test 5: SSL/TLS (10 points)
REM ============================================================================
echo 5. Test SSL/TLS...

curl -s --tlsv1.3 "%URL%" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] TLS 1.3 supporte (+10^)
    set /a SCORE+=10
) else (
    curl -s --tlsv1.2 "%URL%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [INFO] TLS 1.2 supporte (+5^)
        set /a SCORE+=5
    ) else (
        echo   [ERREUR] TLS obsolete (0^)
    )
)

echo.

REM ============================================================================
REM Test 6: Donnees protegees (20 points)
REM ============================================================================
echo 6. Test Protection donnees...

curl -s "%URL%" > body.tmp 2>nul
findstr "vocabularyDatabase" body.tmp >nul 2>&1
if %errorlevel% equ 0 (
    echo   [WARNING] Donnees statiques detectees (0^)
    echo      Migrer vers Supabase pour +20 points
) else (
    echo   [OK] Pas de donnees statiques detectees (+20^)
    set /a SCORE+=20
)

echo.

REM Nettoyer fichiers temporaires
del headers.tmp body.tmp 2>nul

REM ============================================================================
REM RESUME
REM ============================================================================
echo ======================================================================
echo RESUME
echo ======================================================================
echo.

set /a PERCENTAGE=(%SCORE% * 100) / %TOTAL%

echo Score: %SCORE% / %TOTAL% points (%PERCENTAGE%%%^)
echo.

if %PERCENTAGE% geq 90 (
    echo [EXCELLENT] Securite production-grade
    echo    Niveau 3 actif (Supabase + Cloudflare^)
) else if %PERCENTAGE% geq 70 (
    echo [BON] Securite solide
    echo    Niveau 2 actif (Cloudflare^)
    echo    Migrer vers Supabase pour atteindre 95%%
) else if %PERCENTAGE% geq 40 (
    echo [ACCEPTABLE] Securite basique
    echo    Niveau 1 actif (Headers Vercel^)
    echo    Activer Cloudflare pour 70%%
    echo    Migrer Supabase pour 95%%
) else (
    echo [FAIBLE] Amelioration necessaire
    echo    Verifier configuration Vercel
    echo    Redeployer le site
)

echo.
echo ======================================================================
echo RECOMMANDATIONS
echo ======================================================================
echo.

if %PERCENTAGE% lss 70 (
    echo 1. Activer Cloudflare (15 min^)
    echo    Protection bots + Rate limiting
    echo    Score: +30 points
    echo.
)

if %PERCENTAGE% lss 90 (
    echo 2. Configurer Supabase (1h^)
    echo    Proteger donnees backend
    echo    Score: +20 points
    echo    Guide: /SUPABASE_SETUP_GUIDE.md
    echo.
)

echo 3. Monitoring continu
echo    https://securityheaders.com (scan en ligne^)
echo    Supabase Dashboard (logs activite^)
echo.

echo ======================================================================
echo Test termine !
echo ======================================================================

pause
