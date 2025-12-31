# Integração Google Ads - Adventure CRM

Este guia explica como usar a integração do Google Ads no Adventure CRM.

## 🎯 Para Usuários Finais (Clientes)

**Não é necessário configurar nada!** A integração funciona de forma simples:

1. Selecione um projeto no sistema
2. Vá em **Configurações** → **Integrações**
3. Clique em **Conectar Google Ads**
4. Autorize o acesso à sua conta Google Ads
5. Pronto! A integração está conectada e vinculada ao seu projeto

A integração usa as credenciais OAuth do Adventure Labs, então você não precisa criar credenciais próprias.

---

## 🔧 Para Administradores (Configuração Técnica)

Esta seção é apenas para a equipe técnica do Adventure Labs configurar as credenciais OAuth globais.

### 📋 Pré-requisitos

- Acesso ao Google Cloud Console do Adventure Labs
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

### Passo 4: Configurar Variáveis de Ambiente (Adventure Labs)

**Importante:** Estas credenciais são globais do Adventure Labs e serão usadas por todos os clientes.

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

**Nota:** Uma vez configuradas, todos os clientes poderão conectar suas contas Google Ads sem precisar configurar nada.

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
5. Você será redirecionado para autorizar o acesso à sua conta Google Ads
6. Após autorizar, você será redirecionado de volta e a integração será conectada
7. A integração ficará vinculada ao projeto selecionado

**Para clientes:** Não é necessário fazer nada além de autorizar o acesso. Tudo funciona automaticamente!

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

### Erro: "Missing or insufficient permissions"

**Causa:** Este erro pode ocorrer por várias razões:

1. **Google Ads API não habilitada:**
   - A API do Google Ads não está habilitada no projeto do Google Cloud Console
   - A API requer aprovação especial do Google

2. **Escopo não configurado na Tela de Consentimento:**
   - O escopo `https://www.googleapis.com/auth/adwords` não foi adicionado na tela de consentimento OAuth

3. **API não aprovada:**
   - A Google Ads API requer aprovação do Google
   - Você precisa ter uma conta Google Ads ativa e solicitar acesso

4. **Permissões insuficientes na conta:**
   - A conta Google usada não tem acesso administrativo ao Google Ads
   - A conta não tem uma conta Google Ads vinculada

**Solução Passo a Passo:**

1. **Verificar se a API está habilitada:**
   - Acesse: https://console.cloud.google.com/apis/library
   - Procure por "Google Ads API"
   - Se não estiver habilitada, clique em "Habilitar"
   - Se aparecer "Esta API requer aprovação", você precisará solicitar acesso

2. **Solicitar acesso à Google Ads API:**
   - Acesse: https://developers.google.com/google-ads/api/docs/get-started
   - Clique em "Get Started" ou "Request Access"
   - Preencha o formulário com:
     - Informações da sua conta Google Ads
     - Justificativa do uso da API
     - Tipo de aplicativo
   - Aguarde aprovação (pode levar alguns dias)

3. **Verificar escopos na Tela de Consentimento:**
   - Acesse: https://console.cloud.google.com/apis/credentials/consent
   - Edite a tela de consentimento
   - Em "Escopos", adicione: `https://www.googleapis.com/auth/adwords`
   - Salve as alterações

4. **Verificar permissões da conta:**
   - Certifique-se de que a conta Google usada tem:
     - Acesso administrativo a uma conta Google Ads
     - Uma conta Google Ads ativa e em bom estado

5. **Testar novamente:**
   - Após fazer as alterações acima, aguarde alguns minutos
   - Tente conectar novamente
   - Se ainda não funcionar, verifique se a API foi aprovada

**Nota Importante:** A Google Ads API é uma API restrita que requer aprovação do Google. O processo de aprovação pode levar de alguns dias a algumas semanas, dependendo do caso de uso.

## 📚 Recursos Adicionais

- [Documentação Google Ads API](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Guia OAuth 2.0 do Google](https://developers.google.com/identity/protocols/oauth2)

## 🔒 Segurança

**IMPORTANTE:** O `client_secret` não deve ser exposto no frontend em produção. A implementação atual é para desenvolvimento. Em produção, recomenda-se:

1. Fazer a troca do código por token no backend
2. Armazenar tokens no backend
3. Usar o backend como proxy para chamadas à API
