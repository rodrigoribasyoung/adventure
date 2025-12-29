# Próximos Passos - Integração WhatsApp

Este guia explica passo a passo como finalizar a configuração da integração WhatsApp.

## 📋 Checklist de Configuração

### ✅ Passo 1: Gerar Ícones da Extensão

A extensão precisa de ícones PNG. Use o cursor vermelho da identidade visual:

**Opção A - Usar o conversor HTML (Recomendado):**
1. Abra o arquivo `extension/convert-icon.html` no navegador
2. Clique nos botões para baixar cada tamanho (16x16, 48x48, 128x128)
3. Salve os arquivos na pasta `extension/` com os nomes:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Opção B - Converter online:**
1. Acesse https://convertio.co/svg-png/ ou https://cloudconvert.com/svg-to-png
2. Faça upload de: `public/assets/brand/navigation_cursor/navigation-cursor-red.svg`
3. Configure os tamanhos: 16x16, 48x48, 128x128
4. Baixe e salve na pasta `extension/`

**Opção C - Usar ferramenta de linha de comando:**
```bash
# Se tiver ImageMagick instalado
convert -background none -resize 16x16 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon16.png
convert -background none -resize 48x48 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon48.png
convert -background none -resize 128x128 public/assets/brand/navigation_cursor/navigation-cursor-red.svg extension/icon128.png
```

---

### ✅ Passo 2: Configurar Firebase Functions

#### 2.1. Instalar dependências das Functions

```bash
cd functions
npm install
```

#### 2.2. Fazer build das Functions

```bash
npm run build
```

#### 2.3. Fazer login no Firebase (se ainda não fez)

```bash
firebase login
```

Isso abrirá o navegador para autenticação. Faça login com a conta que tem acesso ao projeto Firebase `adv-labs`.

#### 2.4. Verificar projeto Firebase

```bash
firebase projects:list
```

Certifique-se de que o projeto `adv-labs` está listado.

#### 2.5. Inicializar Firebase Functions (se necessário)

Se ainda não tiver o arquivo `.firebaserc`, execute:

```bash
firebase init functions
```

Quando perguntado:
- Selecione o projeto: `adv-labs`
- Use TypeScript: Sim
- Use ESLint: Sim
- Instalar dependências: Sim

#### 2.6. Fazer deploy das Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

**Importante:** Anote a URL base que aparecerá, algo como:
```
https://us-central1-adv-labs.cloudfunctions.net
```

---

### ✅ Passo 3: Atualizar URL das Functions na Extensão

Após o deploy, você precisa atualizar a URL das functions no código da extensão:

1. Abra o arquivo `extension/content.js`
2. Procure por todas as ocorrências de:
   ```javascript
   https://us-central1-adv-labs.cloudfunctions.net
   ```
3. Substitua pela URL real que você obteve no Passo 2.6

**Total de ocorrências a substituir:** 5
- Linha ~140: `createContact`
- Linha ~200: `createDeal`
- Linha ~386: `saveMessages`
- Linha ~440: `getLinkedDealId` (dentro da função)

---

### ✅ Passo 4: Obter Token Firebase

Para a extensão funcionar, você precisa do token de autenticação do Firebase:

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

---

### ✅ Passo 5: Instalar Extensão no Chrome

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `extension/` deste projeto
5. A extensão será instalada

---

### ✅ Passo 6: Configurar Token na Extensão

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Cole o token obtido no Passo 4 no campo "Token Firebase"
3. Opcionalmente, informe seu User ID (pode deixar vazio)
4. Clique em **"Salvar Configuração"**

---

### ✅ Passo 7: Testar a Integração

1. Abra o WhatsApp Web (web.whatsapp.com)
2. Faça login no WhatsApp Web
3. Abra uma conversa qualquer
4. Você verá um botão flutuante à direita da tela (cursor vermelho)
5. Clique no botão para abrir a sidebar
6. A sidebar deve:
   - Detectar o número da conversa
   - Mostrar opções para criar/vincular contato
   - Mostrar opções para criar/vincular negociação
   - Permitir selecionar mensagens

---

### ✅ Passo 8: Testar Botão WhatsApp no CRM

1. No Adventure CRM, abra uma negociação que tenha um contato com telefone
2. Na página de detalhes da negociação, você verá um botão **"WhatsApp"**
3. Clique no botão
4. Deve abrir uma nova aba com o WhatsApp Web direcionado para a conversa

---

## 🔧 Troubleshooting

### Extensão não aparece no WhatsApp Web
- Verifique se está em `web.whatsapp.com` (não `web.whatsapp.com/send`)
- Recarregue a página (F5)
- Verifique o console do navegador (F12) para erros
- Certifique-se de que a extensão está ativada em `chrome://extensions/`

### Erro "Token inválido" ou "Não autenticado"
- O token Firebase expira após ~1 hora
- Obtenha um novo token (Passo 4) e atualize na extensão
- Verifique se o token foi copiado completamente

### Functions não respondem
- Verifique se as functions foram deployadas: `firebase functions:list`
- Verifique os logs: `firebase functions:log`
- Confirme que a URL está correta em `extension/content.js`
- Teste a URL diretamente no navegador (deve retornar erro de método, não 404)

### Mensagens não são selecionadas
- WhatsApp Web muda a estrutura HTML frequentemente
- Pode ser necessário atualizar os seletores em `extension/content.js`
- Verifique o console para erros de JavaScript

### Número não é detectado
- Alguns números podem estar em formato diferente
- Verifique manualmente o número na conversa
- Pode ser necessário ajustar a função `getCurrentPhoneNumber()` em `content.js`

---

## 📝 Notas Importantes

1. **Token expira:** O token Firebase expira após aproximadamente 1 hora. Você precisará atualizá-lo periodicamente na extensão.

2. **Funil ativo:** Para criar negociações, é necessário ter um funil ativo no CRM.

3. **Permissões:** A extensão precisa de permissões para:
   - Acessar WhatsApp Web
   - Armazenar dados localmente (token)
   - Fazer requisições para Firebase Functions

4. **Atualizações do WhatsApp:** Se o WhatsApp Web mudar sua estrutura HTML, pode ser necessário atualizar os seletores em `content.js`.

---

## 🎯 Resumo Rápido

1. ✅ Gerar ícones (16x16, 48x48, 128x128) → `extension/`
2. ✅ Deploy das Functions → `firebase deploy --only functions`
3. ✅ Atualizar URL em `extension/content.js`
4. ✅ Obter token → `window.copyFirebaseToken()` no console
5. ✅ Instalar extensão → `chrome://extensions/`
6. ✅ Configurar token → Popup da extensão
7. ✅ Testar no WhatsApp Web
8. ✅ Testar botão no CRM

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs das Functions: `firebase functions:log`
3. Verifique se todas as dependências estão instaladas
4. Certifique-se de que o projeto Firebase está configurado corretamente

