# Regras do Firestore - Integração WhatsApp

## ⚠️ IMPORTANTE

Para a extensão funcionar, você **DEVE** configurar as regras de segurança do Firestore. Sem essas regras, a extensão não conseguirá criar ou ler dados.

## 📋 Configuração

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules

### Passo 2: Cole as Regras

Cole o seguinte código na área de regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contatos
    match /contacts/{contactId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Negociações
    match /deals/{dealId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Conversas WhatsApp
    match /whatsappConversations/{conversationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null && 
                        resource.data.createdBy == request.auth.uid;
    }
    
    // Funis (necessário para criar negociações)
    match /funnels/{funnelId} {
      allow read: if request.auth != null;
    }
    
    // Usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Passo 3: Publicar

1. Clique no botão **"Publicar"**
2. Aguarde a confirmação
3. As regras serão aplicadas imediatamente

---

## 🔒 O que essas regras fazem?

### Contatos (`contacts`)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler todos os contatos
- ✅ **Criação:** Usuário pode criar contatos, mas `createdBy` deve ser seu próprio UID
- ✅ **Edição/Exclusão:** Usuário só pode editar/excluir seus próprios contatos

### Negociações (`deals`)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler todas as negociações
- ✅ **Criação:** Usuário pode criar negociações, mas `createdBy` deve ser seu próprio UID
- ✅ **Edição/Exclusão:** Usuário só pode editar/excluir suas próprias negociações

### Conversas WhatsApp (`whatsappConversations`)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler todas as conversas
- ✅ **Criação:** Usuário pode criar conversas, mas `createdBy` deve ser seu próprio UID
- ✅ **Atualização:** Usuário só pode atualizar suas próprias conversas

### Funis (`funnels`)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler todos os funis
- ⚠️ **Escrita:** Não permitida via extensão (apenas via CRM)

### Usuários (`users`)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler todos os usuários
- ✅ **Escrita:** Usuário só pode editar seu próprio perfil

---

## 🧪 Testar as Regras

### Usando o Simulador

1. No Firebase Console, vá para Firestore → Rules
2. Clique em "Simulator"
3. Configure:
   - **Location:** `contacts/123`
   - **Method:** `create`
   - **Authentication:** Seu UID
   - **Data:** `{ createdBy: "seu-uid", name: "Teste" }`
4. Clique em "Run"
5. Deve retornar "Allow" ✅

### Teste de Segurança

1. Tente criar um contato com `createdBy` diferente do seu UID
2. Deve retornar "Deny" ✅

---

## ⚠️ Avisos Importantes

1. **Nunca remova a verificação de autenticação** (`request.auth != null`)
2. **Sempre valide o `createdBy`** para garantir que usuários só criem seus próprios dados
3. **Teste as regras** antes de usar em produção
4. **Mantenha as regras atualizadas** conforme novas coleções forem adicionadas

---

## 🔍 Troubleshooting

### Erro "Permission denied" mesmo com regras configuradas

1. Verifique se as regras foram **publicadas** (não apenas salvas)
2. Verifique se o token está correto e não expirou
3. Verifique se o `createdBy` está sendo definido corretamente
4. Use o simulador para testar as regras

### Regras não funcionam

1. Aguarde alguns minutos após publicar (pode levar tempo para propagar)
2. Limpe o cache do navegador
3. Verifique se está usando a versão correta das regras (`rules_version = '2'`)

---

## 📚 Referências

- [Documentação do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guia de Configuração](../docs/SETUP_GUIDE.md)
- [Solução de Problemas](../docs/TROUBLESHOOTING.md)



