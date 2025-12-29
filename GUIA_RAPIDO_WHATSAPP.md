# 🚀 Guia Rápido - Integração WhatsApp

## 📝 Resumo dos Próximos Passos

### 1️⃣ Gerar Ícones (5 minutos)

**Opção mais fácil:**
1. Abra `extension/convert-icon.html` no navegador Chrome
2. Clique nos 3 botões para baixar os ícones
3. Salve na pasta `extension/` como:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Alternativa online:**
- Acesse https://convertio.co/svg-png/
- Faça upload de `public/assets/brand/navigation_cursor/navigation-cursor-red.svg`
- Converta para PNG nos tamanhos: 16x16, 48x48, 128x128
- Baixe e salve em `extension/`

---

### 2️⃣ Deploy Firebase Functions (10 minutos)

#### Passo 2.1: Login no Firebase
```bash
firebase login
```
Isso abrirá o navegador. Faça login com sua conta Google que tem acesso ao projeto `adv-labs`.

#### Passo 2.2: Verificar Projeto
```bash
firebase projects:list
```
Confirme que `adv-labs` está na lista.

#### Passo 2.3: Deploy
```bash
cd functions
firebase deploy --only functions
```

**⚠️ IMPORTANTE:** Anote a URL que aparecerá, exemplo:
```
Function URL: https://us-central1-adv-labs.cloudfunctions.net/api/whatsapp/createContact
```

A URL base será: `https://us-central1-adv-labs.cloudfunctions.net`

#### Passo 2.4: Atualizar URL na Extensão
Abra `extension/content.js` e na linha 3, atualize:
```javascript
const FIREBASE_FUNCTIONS_URL = 'https://us-central1-adv-labs.cloudfunctions.net'
```
(Substitua pela URL real do seu deploy)

---

### 3️⃣ Obter Token Firebase (2 minutos)

1. Abra o Adventure CRM no navegador e faça login
2. Pressione F12 para abrir o console
3. Digite e pressione Enter:
```javascript
window.copyFirebaseToken()
```
4. O token será copiado automaticamente!

---

### 4️⃣ Instalar Extensão (3 minutos)

1. Abra Chrome → `chrome://extensions/`
2. Ative "Modo do desenvolvedor" (canto superior direito)
3. Clique "Carregar sem compactação"
4. Selecione a pasta `extension/`
5. Clique no ícone da extensão
6. Cole o token do Passo 3
7. Clique "Salvar Configuração"

---

### 5️⃣ Testar (5 minutos)

1. Abra WhatsApp Web (web.whatsapp.com)
2. Faça login
3. Abra uma conversa
4. Veja o botão flutuante à direita (cursor vermelho)
5. Clique para abrir a sidebar
6. Teste criar contato/negociação

---

## ✅ Checklist Final

- [ ] Ícones gerados e salvos em `extension/`
- [ ] Firebase Functions deployadas
- [ ] URL atualizada em `extension/content.js`
- [ ] Token obtido e configurado na extensão
- [ ] Extensão instalada no Chrome
- [ ] Testado no WhatsApp Web
- [ ] Botão WhatsApp testado no CRM

---

## 🆘 Problemas Comuns

**"Token inválido"**
→ Obtenha um novo token (expira após ~1h)

**"Functions não encontradas"**
→ Verifique a URL em `extension/content.js`

**"Extensão não aparece"**
→ Recarregue a página do WhatsApp Web (F5)

**"Número não detectado"**
→ Abra uma conversa real (não a tela inicial)

---

## 📚 Documentação Completa

- `PROXIMOS_PASSOS_WHATSAPP.md` - Guia detalhado
- `DEPLOY_FIREBASE.md` - Instruções de deploy
- `extension/README.md` - Documentação da extensão
- `functions/README.md` - Documentação das APIs

