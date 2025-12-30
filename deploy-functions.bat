@echo off
echo ========================================
echo Deploy Firebase Functions - Adventure CRM
echo ========================================
echo.

echo Verificando login no Firebase...
firebase projects:list
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Voce precisa fazer login primeiro!
    echo Execute: firebase login
    pause
    exit /b 1
)

echo.
echo Fazendo build das functions...
cd functions
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERRO no build! Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo Fazendo deploy...
call firebase deploy --only functions
if %errorlevel% neq 0 (
    echo.
    echo ERRO no deploy! Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deploy concluido com sucesso!
echo.
echo IMPORTANTE: Anote a URL das functions acima
echo e atualize em extension/content.js (linha 3)
echo ========================================
pause



