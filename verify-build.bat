@echo off
REM ============================================================================
REM SCRIPT DE VERIFICATION BUILD (Windows)
REM Executer avant de push sur GitHub
REM ============================================================================

echo.
echo USA Level English - Verification Build
echo ==========================================
echo.

set ERRORS=0
set WARNINGS=0

REM ============================================================================
REM 1. Verifier Node version
REM ============================================================================
echo 1. Verification version Node...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe
    set /a ERRORS+=1
) else (
    node -v
    echo [OK] Node version detectee
)
echo.

REM ============================================================================
REM 2. Verifier node_modules
REM ============================================================================
echo 2. Verification node_modules...
if not exist "node_modules" (
    echo [WARNING] node_modules n'existe pas
    echo Installation en cours...
    call npm install
    if %errorlevel% equ 0 (
        echo [OK] npm install reussi
    ) else (
        echo [ERREUR] npm install echoue
        set /a ERRORS+=1
    )
) else (
    echo [OK] node_modules existe
)
echo.

REM ============================================================================
REM 3. Verifier package.json
REM ============================================================================
echo 3. Verification package.json...
findstr /C:"@supabase/supabase-js" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] @supabase/supabase-js present
) else (
    echo [WARNING] @supabase/supabase-js manquant
    set /a WARNINGS+=1
)

findstr /C:"\"type\": \"module\"" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] type: module configure
) else (
    echo [ERREUR] type: module manquant
    set /a ERRORS+=1
)
echo.

REM ============================================================================
REM 4. Verifier figma:asset
REM ============================================================================
echo 4. Verification imports figma:asset...
findstr /S /C:"figma:asset" src\*.tsx src\*.ts src\*.jsx src\*.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERREUR] Imports figma:asset trouves
    findstr /S /C:"figma:asset" src\*.tsx src\*.ts
    set /a ERRORS+=1
) else (
    echo [OK] Aucun import figma:asset trouve
)
echo.

REM ============================================================================
REM 5. Verifier .gitignore
REM ============================================================================
echo 5. Verification .gitignore...
if exist ".gitignore" (
    findstr /C:"node_modules" .gitignore >nul
    if %errorlevel% equ 0 (
        echo [OK] .gitignore configure
    ) else (
        echo [WARNING] .gitignore incomplet
        set /a WARNINGS+=1
    )
) else (
    echo [ERREUR] .gitignore manquant
    set /a ERRORS+=1
)
echo.

REM ============================================================================
REM 6. TEST BUILD
REM ============================================================================
echo 6. Test build production...
echo    (Ceci peut prendre 30-60 secondes...)
call npm run build > build.log 2>&1

if %errorlevel% equ 0 (
    echo [OK] Build reussi!
    
    if exist "dist\index.html" (
        echo    [OK] index.html genere
    ) else (
        echo    [ERREUR] index.html manquant
        set /a ERRORS+=1
    )
) else (
    echo [ERREUR] Build echoue
    echo.
    echo Dernieres lignes du log:
    powershell -Command "Get-Content build.log -Tail 20"
    set /a ERRORS+=1
)
echo.

REM ============================================================================
REM 7. Verifier vercel.json
REM ============================================================================
echo 7. Verification vercel.json...
if exist "vercel.json" (
    findstr /C:"X-Frame-Options" vercel.json >nul
    if %errorlevel% equ 0 (
        echo [OK] Headers de securite configures
    ) else (
        echo [WARNING] Headers incomplets
        set /a WARNINGS+=1
    )
) else (
    echo [WARNING] vercel.json manquant
    set /a WARNINGS+=1
)
echo.

REM ============================================================================
REM RESUME
REM ============================================================================
echo ==========================================
echo RESUME
echo ==========================================
echo.

if %ERRORS% equ 0 (
    echo [OK] Aucune erreur bloquante
) else (
    echo [ERREUR] %ERRORS% erreur(s) bloquante(s)
)

if %WARNINGS% equ 0 (
    echo [OK] Aucun warning
) else (
    echo [WARNING] %WARNINGS% warning(s)
)

echo.

if %ERRORS% equ 0 (
    echo BUILD READY - Tu peux push sur GitHub!
    echo.
    echo Commandes a executer:
    echo   git add .
    echo   git commit -m "Add production security architecture"
    echo   git push origin main
    echo.
    exit /b 0
) else (
    echo CORRIGE LES ERREURS AVANT DE PUSH
    echo.
    echo Voir BUILD_VERIFICATION.md pour de l'aide
    echo.
    exit /b 1
)
