# Extensão Chrome - Adventure CRM WhatsApp

Extensão do Chrome para integrar o Adventure CRM com WhatsApp Web.

## 📋 Visão Geral

Esta extensão injeta uma sidebar no WhatsApp Web que permite:
- Criar/vincular contatos diretamente do WhatsApp
- Criar/vincular negociações diretamente do WhatsApp
- Selecionar e salvar mensagens do WhatsApp no banco de dados

## 🔧 Arquitetura

A extensão usa **REST API do Firestore diretamente**, sem necessidade de Firebase Functions. Isso permite funcionar no plano gratuito do Firebase.

**Fluxo:**
```
WhatsApp Web → Extensão → REST API Firestore → Firestore Database
```

## 📁 Arquivos Principais

- `manifest.json` - Configuração da extensão
- `content.js` - Script principal (injeta sidebar, detecta número, faz requisições)
- `sidebar.css` - Estilos da sidebar
- `background.js` - Service worker
- `popup.html/js` - Interface de configuração (token Firebase)
- `convert-icon.html` - Gerador de ícones PNG

## 🚀 Instalação e Configuração

Para instalar e configurar a extensão, consulte o [Guia de Configuração](../docs/SETUP_GUIDE.md).

## 🔑 Autenticação

A extensão usa o token Firebase (ID token) para autenticar requisições ao Firestore. O token:
- É obtido do CRM via `window.copyFirebaseToken()`
- É armazenado localmente na extensão
- Expira após ~1 hora (precisa ser renovado)

## 📚 Documentação

- **[Guia de Configuração](../docs/SETUP_GUIDE.md)** - Instalação passo a passo
- **[Solução de Problemas](../docs/TROUBLESHOOTING.md)** - Troubleshooting
- **[Regras do Firestore](../docs/FIRESTORE_RULES.md)** - Configuração de segurança
- **[Documentação Completa](../docs/WHATSAPP_INTEGRATION.md)** - Visão geral

## ⚠️ Requisitos

- Chrome ou navegador baseado em Chromium
- Token Firebase válido
- Regras do Firestore configuradas
- Funil ativo no CRM (para criar negociações)

