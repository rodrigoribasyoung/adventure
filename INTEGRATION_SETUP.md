# Configuração da Integração WhatsApp

Este documento explica como configurar a integração do Adventure CRM com WhatsApp Web.

## Componentes

1. **Extensão Chrome** - Injetada no WhatsApp Web
2. **Firebase Functions** - API REST para comunicação
3. **Aplicação Web** - Botão WhatsApp na página de Deal

## Passo 1: Configurar Firebase Functions

1. Instale as dependências:
```bash
cd functions
npm install
```

2. Faça o build:
```bash
npm run build
```

3. Faça o deploy (requer Firebase CLI configurado):
```bash
firebase deploy --only functions
```

4. Anote a URL base das functions (ex: `https://us-central1-adv-labs.cloudfunctions.net`)

## Passo 2: Atualizar URL das Functions na Extensão

Edite `extension/content.js` e substitua todas as ocorrências de:
```javascript
https://us-central1-adv-labs.cloudfunctions.net
```

Pela URL real das suas Firebase Functions.

## Passo 3: Obter Token Firebase

1. Abra o Adventure CRM no navegador
2. Faça login
3. Abra o Console do Desenvolvedor (F12)
4. Execute:

```javascript
import { auth } from './lib/firebase/config.js'
auth.currentUser.getIdToken().then(token => {
  console.log('Token:', token)
  navigator.clipboard.writeText(token)
  console.log('Token copiado!')
})
```

Ou, se estiver usando a aplicação:
```javascript
// No console do navegador na aplicação web
firebase.auth().currentUser.getIdToken().then(token => {
  console.log('Token:', token)
  navigator.clipboard.writeText(token)
  alert('Token copiado para a área de transferência!')
})
```

## Passo 4: Instalar Extensão Chrome

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `extension/`
5. Clique no ícone da extensão
6. Cole o token obtido no passo 3
7. Clique em "Salvar Configuração"

## Passo 5: Criar Ícones da Extensão

A extensão precisa de ícones. Crie ou baixe:
- `extension/icon16.png` (16x16)
- `extension/icon48.png` (48x48)
- `extension/icon128.png` (128x128)

Você pode usar um gerador online ou criar manualmente.

## Uso

1. Abra WhatsApp Web (web.whatsapp.com)
2. Clique no botão flutuante à direita
3. A sidebar abrirá com as opções:
   - Criar/Vincular Contato
   - Criar/Vincular Negociação
   - Selecionar e Salvar Mensagens

## Troubleshooting

### Extensão não aparece no WhatsApp Web
- Verifique se está em `web.whatsapp.com`
- Recarregue a página
- Verifique o console do navegador para erros

### Erro de autenticação
- Verifique se o token está correto
- Tokens expiram - obtenha um novo token
- Verifique se o User ID está correto (opcional)

### Mensagens não são selecionadas
- WhatsApp Web muda a estrutura HTML frequentemente
- Pode ser necessário atualizar os seletores em `content.js`
- Verifique o console para erros

### Functions não respondem
- Verifique se as functions foram deployadas
- Verifique a URL nas requisições
- Verifique os logs: `firebase functions:log`

## Notas Importantes

- O token Firebase expira periodicamente (geralmente após 1 hora)
- Você precisará atualizar o token na extensão quando expirar
- As mensagens são salvas no Firestore na coleção `whatsappConversations`
- É necessário ter um funil ativo para criar negociações

