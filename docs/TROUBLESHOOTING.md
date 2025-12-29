# Solução de Problemas - Integração WhatsApp

## 🔧 Problemas Comuns

### Extensão não aparece no WhatsApp Web

**Sintomas:**
- Botão flutuante não aparece
- Sidebar não abre

**Soluções:**
1. Verifique se está em `web.whatsapp.com` (não `web.whatsapp.com/send`)
2. Recarregue a página (F5)
3. Verifique o console do navegador (F12) para erros
4. Certifique-se de que a extensão está ativada em `chrome://extensions/`
5. Verifique se os ícones estão presentes (`icon16.png`, `icon48.png`, `icon128.png`)

---

### Erro "Token inválido" ou "Não autenticado"

**Sintomas:**
- Mensagem de erro ao tentar criar contato/negociação
- Erro 401 ou 403 nas requisições

**Soluções:**
1. O token Firebase expira após ~1 hora
2. Obtenha um novo token:
   ```javascript
   window.copyFirebaseToken()
   ```
3. Atualize o token na extensão (popup)
4. Verifique se o token foi copiado completamente (não cortado)

---

### Erro "Permission denied" no Firestore

**Sintomas:**
- Erro ao criar/ler dados
- Mensagem "Permission denied" no console

**Soluções:**
1. **Verifique se as regras do Firestore foram configuradas:**
   - Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules
   - Verifique se as regras do arquivo [FIRESTORE_RULES.md](FIRESTORE_RULES.md) estão publicadas

2. **Verifique se o token está correto:**
   - Obtenha um novo token: `window.copyFirebaseToken()`
   - Atualize na extensão

3. **Verifique se o `createdBy` está sendo definido:**
   - O campo `createdBy` deve ser igual ao `userId` do token
   - Verifique no console se o `userId` está correto

---

### Mensagens não são selecionadas

**Sintomas:**
- Checkboxes não aparecem nas mensagens
- Botão "Selecionar Mensagens" não funciona

**Soluções:**
1. WhatsApp Web muda a estrutura HTML frequentemente
2. Pode ser necessário atualizar os seletores em `extension/content.js`
3. Verifique o console para erros de JavaScript
4. Certifique-se de estar em uma conversa real (não a tela inicial)

**Atualizar seletores:**
- Abra o console (F12)
- Inspecione as mensagens no WhatsApp Web
- Atualize os seletores em `extension/content.js` na função `enableMessageSelection()`

---

### Número não é detectado

**Sintomas:**
- Sidebar mostra "Abra uma conversa" mesmo estando em uma conversa
- Número não aparece na sidebar

**Soluções:**
1. Alguns números podem estar em formato diferente
2. Verifique manualmente o número na conversa
3. Pode ser necessário ajustar a função `getCurrentPhoneNumber()` em `content.js`
4. Verifique o console para ver qual número está sendo detectado

**Debug:**
```javascript
// No console do WhatsApp Web
console.log(getCurrentPhoneNumber())
```

---

### Erro "Collection not found"

**Sintomas:**
- Erro ao criar contato/negociação
- Mensagem sobre coleção não encontrada

**Soluções:**
1. Verifique se o nome da coleção está correto:
   - `contacts` (não `contact`)
   - `deals` (não `deal`)
   - `whatsappConversations` (não `whatsapp_conversations`)

2. Verifique se as coleções existem no Firestore:
   - Acesse: https://console.firebase.google.com/project/adv-labs/firestore/data
   - As coleções serão criadas automaticamente na primeira escrita

---

### Erro "Funil não encontrado"

**Sintomas:**
- Erro ao criar negociação
- Mensagem "Nenhum funil ativo encontrado"

**Soluções:**
1. É necessário ter um funil ativo no CRM
2. Acesse o CRM → Configurações → Funis
3. Crie um funil e marque como ativo
4. Certifique-se de que o funil tem pelo menos um estágio

---

### Token expira frequentemente

**Sintomas:**
- Precisa atualizar o token constantemente
- Erro de autenticação após ~1 hora

**Soluções:**
1. **Isso é normal** - Tokens Firebase expiram por segurança
2. **Solução temporária:** Atualize o token quando necessário
3. **Futuro:** Podemos implementar renovação automática do token

**Renovar token:**
```javascript
// No console do CRM
window.copyFirebaseToken()
// Cole na extensão
```

---

## 🔍 Debug Avançado

### Verificar Requisições ao Firestore

1. Abra o console do navegador (F12)
2. Vá para a aba "Network"
3. Filtre por "firestore.googleapis.com"
4. Verifique as requisições e respostas

### Verificar Regras do Firestore

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules
2. Use o simulador de regras para testar
3. Verifique os logs em: https://console.firebase.google.com/project/adv-labs/firestore/logs

### Verificar Token

```javascript
// No console do CRM
import { auth } from '@/lib/firebase/auth'
auth.currentUser.getIdToken().then(token => {
  console.log('Token:', token)
  console.log('User ID:', auth.currentUser.uid)
})
```

---

## 📞 Ainda com Problemas?

Se nenhuma das soluções acima funcionou:

1. Verifique os logs do console do navegador
2. Verifique os logs do Firestore
3. Certifique-se de que todas as dependências estão instaladas
4. Verifique se o projeto Firebase está configurado corretamente
5. Verifique a versão do Chrome (deve ser recente)

---

## 📚 Referências

- [Guia de Configuração](SETUP_GUIDE.md)
- [Regras do Firestore](FIRESTORE_RULES.md)
- [Documentação Completa](WHATSAPP_INTEGRATION.md)


