# Guia de Configuração - Integração WhatsApp

Este guia explica passo a passo como configurar a integração WhatsApp do Adventure CRM.

## 📋 Pré-requisitos

- Chrome ou navegador baseado em Chromium
- Conta Firebase com projeto `adv-labs` configurado
- Acesso ao Adventure CRM (aplicação web)
- WhatsApp Web acessível

## 🚀 Passo a Passo

### Passo 1: Gerar Ícones da Extensão (5 minutos)

A extensão precisa de ícones PNG do cursor vermelho da identidade visual.

**Opção A - Usar o conversor HTML (Recomendado):**
1. Abra o arquivo `extension/convert-icon.html` no navegador Chrome
2. Clique nos 3 botões para baixar cada tamanho (16x16, 48x48, 128x128)
3. Salve os arquivos na pasta `extension/` com os nomes:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Opção B - Converter online:**
1. Acesse https://convertio.co/svg-png/ ou https://cloudconvert.com/svg-to-png
2. Faça upload de: `public/assets/brand/navigation_cursor/navigation-cursor-red.svg`
3. Configure os tamanhos: 16x16, 48x48, 128x128
4. Baixe e salve na pasta `extension/`

**Opção C - Linha de comando (ImageMagick):**
```bash
convert -background none -resize 16x16 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon16.png
convert -background none -resize 48x48 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon48.png
convert -background none -resize 128x128 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon128.png
```

---

### Passo 2: Configurar Regras do Firestore (OBRIGATÓRIO) ⚠️

**⚠️ SEM ISSO A EXTENSÃO NÃO FUNCIONARÁ!**

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules

2. Cole as regras do arquivo [FIRESTORE_RULES.md](FIRESTORE_RULES.md)

3. Clique em **"Publicar"**

**Importante:** As regras garantem que apenas usuários autenticados possam criar/editar seus próprios dados.

---

### Passo 3: Obter Token Firebase (2 minutos)

1. Abra o Adventure CRM no navegador e faça login
2. Abra o Console do Desenvolvedor (F12)
3. Execute o seguinte comando:

```javascript
window.copyFirebaseToken()
```

Isso copiará o token automaticamente para a área de transferência.

**Alternativa manual:**
```javascript
import { auth } from '@/lib/firebase/auth'
auth.currentUser.getIdToken().then(token => {
  console.log('Token:', token)
  navigator.clipboard.writeText(token)
  alert('Token copiado!')
})
```

**Nota:** O token expira após ~1 hora. Você precisará atualizá-lo periodicamente.

---

### Passo 4: Instalar Extensão no Chrome (3 minutos)

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `extension/` deste projeto
5. A extensão será instalada ✅

---

### Passo 5: Configurar Token na Extensão (1 minuto)

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Cole o token obtido no Passo 3 no campo "Token Firebase"
3. Opcionalmente, informe seu User ID (pode deixar vazio)
4. Clique em **"Salvar Configuração"** ✅

---

### Passo 6: Testar no WhatsApp Web (5 minutos)

1. Abra o WhatsApp Web (web.whatsapp.com)
2. Faça login no WhatsApp Web
3. Abra uma conversa qualquer
4. Você verá um **botão flutuante à direita** (cursor vermelho) ✅
5. Clique no botão para abrir a sidebar
6. A sidebar deve:
   - Detectar o número da conversa
   - Mostrar opções para criar/vincular contato
   - Mostrar opções para criar/vincular negociação
   - Permitir selecionar mensagens

**Teste:**
- Clique em "Criar Contato" e preencha o formulário
- Verifique no CRM se o contato foi criado

---

### Passo 7: Testar Botão WhatsApp no CRM (2 minutos)

1. No Adventure CRM, abra uma negociação que tenha um contato com telefone
2. Na página de detalhes da negociação, você verá um botão **"WhatsApp"** ✅
3. Clique no botão
4. Deve abrir uma nova aba com o WhatsApp Web direcionado para a conversa ✅

---

## ✅ Checklist Final

- [ ] **Passo 1:** Ícones gerados (icon16.png, icon48.png, icon128.png em `extension/`)
- [ ] **Passo 2:** Regras do Firestore configuradas e publicadas
- [ ] **Passo 3:** Token obtido via `window.copyFirebaseToken()`
- [ ] **Passo 4:** Extensão instalada no Chrome
- [ ] **Passo 5:** Token configurado na extensão
- [ ] **Passo 6:** Testado no WhatsApp Web (sidebar aparece e funciona)
- [ ] **Passo 7:** Botão WhatsApp testado no CRM (abre conversa)

---

## 🎉 Tudo Pronto!

Após completar os 7 passos acima, a integração estará 100% funcional!

**Funcionalidades disponíveis:**
- ✅ Criar contato direto do WhatsApp Web
- ✅ Criar negociação direto do WhatsApp Web
- ✅ Salvar mensagens selecionadas no banco
- ✅ Abrir WhatsApp direto da negociação no CRM

---

## 📚 Próximos Passos

- Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md) se encontrar problemas
- Ver [FIRESTORE_RULES.md](FIRESTORE_RULES.md) para detalhes das regras
- Ver [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md) para visão geral

