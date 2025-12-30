#!/bin/bash

echo "========================================"
echo "Deploy Firebase Functions - Adventure CRM"
echo "========================================"
echo ""

echo "Verificando login no Firebase..."
firebase projects:list
if [ $? -ne 0 ]; then
    echo ""
    echo "ERRO: Você precisa fazer login primeiro!"
    echo "Execute: firebase login"
    exit 1
fi

echo ""
echo "Fazendo build das functions..."
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "ERRO no build! Verifique os erros acima."
    exit 1
fi

echo ""
echo "Fazendo deploy..."
firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo ""
    echo "ERRO no deploy! Verifique os erros acima."
    exit 1
fi

echo ""
echo "========================================"
echo "Deploy concluído com sucesso!"
echo ""
echo "IMPORTANTE: Anote a URL das functions acima"
echo "e atualize em extension/content.js (linha 3)"
echo "========================================"



