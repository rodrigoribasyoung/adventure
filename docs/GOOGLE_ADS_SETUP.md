# Configuração do Google Ads OAuth

Este guia explica como configurar a integração OAuth do Google Ads no Adventure CRM.

## 📋 Pré-requisitos

- Conta Google com acesso ao Google Ads
- Acesso ao Google Cloud Console
- Permissões para criar projetos e credenciais OAuth

## 🚀 Passo a Passo

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Dê um nome ao projeto (ex: "Adventure CRM Integrations")
4. Clique em "Criar"

### Passo 2: Habilitar Google Ads API

1. No menu lateral, vá em **APIs e Serviços** → **Biblioteca**
2. Procure por "Google Ads API"
3. Clique em "Google Ads API" e depois em "Habilitar"

**Importante:** A Google Ads API requer aprovação. Você precisará:
- Ter uma conta Google Ads ativa
- Solicitar acesso à API através do formulário oficial
- Aguardar aprovação (pode levar alguns dias)

### Passo 3: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar credenciais** → **ID do cliente OAuth**
3. Configure:
   - **Tipo de aplicativo:** Aplicativo da Web
   - **Nome:** Adventure CRM Google Ads
   - **URIs de redirecionamento autorizados:**
     - `http://localhost:5173/auth/google-ads/callback` (desenvolvimento)
     - `https://seu-dominio.vercel.app/auth/google-ads/callback` (produção)
4. Clique em **Criar**
5. **Copie o Client ID e Client Secret** (você precisará deles)

### Passo 4: Configurar Variáveis de Ambiente

#### Desenvolvimento Local

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
VITE_GOOGLE_ADS_CLIENT_ID=seu-client-id-aqui
VITE_GOOGLE_ADS_CLIENT_SECRET=seu-client-secret-aqui
```

#### Produção (Vercel)

1. Acesse: https://vercel.com
2. Vá para seu projeto → **Settings** → **Environment Variables**
3. Adicione:
   - `VITE_GOOGLE_ADS_CLIENT_ID` = seu-client-id
   - `VITE_GOOGLE_ADS_CLIENT_SECRET` = seu-client-secret
4. Selecione os ambientes (Production, Preview, Development)
5. Faça um novo deploy para aplicar as variáveis

### Passo 5: Configurar Tela de Consentimento OAuth

1. No Google Cloud Console, vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Selecione **Externo** (ou **Interno** se for apenas para sua organização)
3. Preencha:
   - **Nome do aplicativo:** Adventure CRM
   - **Email de suporte:** seu-email@exemplo.com
   - **Logo:** (opcional)
4. Adicione os escopos necessários:
   - `https://www.googleapis.com/auth/adwords`
5. Adicione usuários de teste (se for Externo)
6. Salve e continue

### Passo 6: Testar a Integração

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse o sistema e vá em **Configurações** → **Integrações**
3. Selecione um projeto
4. Clique em **Conectar Google Ads**
5. Você será redirecionado para autorizar o acesso
6. Após autorizar, você será redirecionado de volta e a integração será conectada

## ⚠️ Problemas Comuns

### Erro: "Missing required parameter: client_id"

**Causa:** A variável de ambiente `VITE_GOOGLE_ADS_CLIENT_ID` não está configurada.

**Solução:**
1. Verifique se o arquivo `.env.local` existe e contém a variável
2. Reinicie o servidor de desenvolvimento (`npm run dev`)
3. No Vercel, verifique se as variáveis estão configuradas e faça um novo deploy

### Erro: "redirect_uri_mismatch"

**Causa:** A URI de redirecionamento não está autorizada no Google Cloud Console.

**Solução:**
1. Acesse Google Cloud Console → Credenciais
2. Edite o OAuth 2.0 Client ID
3. Adicione a URI exata que aparece no erro em "URIs de redirecionamento autorizados"
4. Salve e aguarde alguns minutos para propagação

### Erro: "Access blocked: This app's request is invalid"

**Causa:** A tela de consentimento OAuth não está configurada corretamente.

**Solução:**
1. Complete a configuração da Tela de Consentimento OAuth
2. Adicione seu email como usuário de teste (se for Externo)
3. Aguarde a verificação (pode levar alguns dias para produção)

## 📚 Recursos Adicionais

- [Documentação Google Ads API](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Guia OAuth 2.0 do Google](https://developers.google.com/identity/protocols/oauth2)

## 🔒 Segurança

**IMPORTANTE:** O `client_secret` não deve ser exposto no frontend em produção. A implementação atual é para desenvolvimento. Em produção, recomenda-se:

1. Fazer a troca do código por token no backend
2. Armazenar tokens no backend
3. Usar o backend como proxy para chamadas à API
