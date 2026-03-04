@echo off
REM ============================================================================
REM Script de verification AVANT PUSH - Supabase Setup (Windows)
REM ============================================================================

echo ======================================================================
echo VERIFICATION PRE-PUSH - SUPABASE SETUP
echo ======================================================================
echo.

set ERRORS=0

REM ============================================================================
REM 1. Verifier nouveaux fichiers
REM ============================================================================
echo 1. Verification nouveaux fichiers...

if exist "scripts\import-vocabulary.ts" (
    echo   [OK] scripts\import-vocabulary.ts
) else (
    echo   [ERREUR] scripts\import-vocabulary.ts - MANQUANT
    set /a ERRORS+=1
)

if exist "scripts\README.md" (
    echo   [OK] scripts\README.md
) else (
    echo   [ERREUR] scripts\README.md - MANQUANT
    set /a ERRORS+=1
)

if exist "SUPABASE_SETUP_GUIDE.md" (
    echo   [OK] SUPABASE_SETUP_GUIDE.md
) else (
    echo   [ERREUR] SUPABASE_SETUP_GUIDE.md - MANQUANT
    set /a ERRORS+=1
)

if exist "FRONTEND_MIGRATION_GUIDE.md" (
    echo   [OK] FRONTEND_MIGRATION_GUIDE.md
) else (
    echo   [ERREUR] FRONTEND_MIGRATION_GUIDE.md - MANQUANT
    set /a ERRORS+=1
)

if exist "SUPABASE_FILES_SUMMARY.md" (
    echo   [OK] SUPABASE_FILES_SUMMARY.md
) else (
    echo   [ERREUR] SUPABASE_FILES_SUMMARY.md - MANQUANT
    set /a ERRORS+=1
)

echo.

REM ============================================================================
REM 2. Verifier package.json
REM ============================================================================
echo 2. Verification package.json...

findstr /C:"tsx" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] tsx installe
) else (
    echo   [ERREUR] tsx manquant
    set /a ERRORS+=1
)

findstr /C:"dotenv" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] dotenv installe
) else (
    echo   [ERREUR] dotenv manquant
    set /a ERRORS+=1
)

echo.

REM ============================================================================
REM 3. Verifier figma:asset
REM ============================================================================
echo 3. Verification imports figma:asset...

findstr /S /C:"from \"figma:" src\*.tsx src\*.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo   [ERREUR] Imports figma:asset trouves
    findstr /S /C:"from \"figma:" src\*.tsx src\*.ts
    set /a ERRORS+=1
) else (
    echo   [OK] Aucun import figma:asset trouve
)

echo.

REM ============================================================================
REM 4. Verifier .env
REM ============================================================================
echo 4. Verification .env protection...

if exist ".env" (
    git ls-files --error-unmatch .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [WARNING] .env est tracke par Git (DANGER!)
        echo   Execute: git rm --cached .env
        set /a ERRORS+=1
    ) else (
        echo   [OK] .env existe mais pas tracke
    )
) else (
    echo   [INFO] .env n'existe pas (normal si pas configure)
)

echo.

REM ============================================================================
REM 5. Test build
REM ============================================================================
echo 5. Test build production...

npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Build reussi
) else (
    echo   [ERREUR] Build echoue
    set /a ERRORS+=1
)

echo.

REM ============================================================================
REM RESUME
REM ============================================================================
echo ======================================================================
echo RESUME
echo ======================================================================
echo.

if %ERRORS% equ 0 (
    echo [OK] TOUTES LES VERIFICATIONS SONT OK
    echo.
    echo Pret a push:
    echo   git add .
    echo   git commit -m "Add Supabase setup scripts and migration guides"
    echo   git push origin main
    echo.
) else (
    echo [ERREUR] %ERRORS% ERREUR^(S^) DETECTEE^(S^)
    echo.
    echo Corriger les erreurs avant de push.
    echo.
)

pause
