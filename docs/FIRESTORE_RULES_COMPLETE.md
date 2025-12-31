# Regras Completas do Firestore - Adventure CRM

## ⚠️ IMPORTANTE

**ESTE ARQUIVO ESTÁ DESATUALIZADO**

As regras do Firestore foram atualizadas para suportar uma hierarquia de acesso mais robusta. 

**👉 Consulte o arquivo [FIRESTORE_RULES_HIERARCHY.md](./FIRESTORE_RULES_HIERARCHY.md) para a documentação atualizada.**

---

## 📋 Documentação Antiga (Mantida para Referência)

Essas são as regras antigas do Firestore incluindo as novas coleções `accounts` e `projects`. **Você DEVE** usar as novas regras do arquivo `firestore.rules` na raiz do projeto.

## 📋 Configuração

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules
2. Ou navegue: Firebase Console → Firestore Database → Rules

### Passo 2: Cole as Regras Completas

Cole o seguinte código na área de regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para verificar se usuário é master
    function isMaster() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isMaster == true;
    }
    
    // Accounts (Contas) - apenas master pode gerenciar
    match /accounts/{accountId} {
      allow read: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        isMaster()
      );
      allow create: if request.auth != null && 
                       (request.resource.data.ownerId == request.auth.uid && isMaster());
      allow update, delete: if request.auth != null && 
                                (resource.data.ownerId == request.auth.uid && isMaster());
    }
    
    // Projects (Projetos)
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                (resource.data.ownerId == request.auth.uid ||
                                 isMaster());
    }
    
    // ProjectUsers (relação usuário-projeto)
    match /projectUsers/{projectUserId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.userId == request.auth.uid;
    }
    
    // Usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                (request.auth.uid == userId || isMaster());
    }
    
    // Contatos
    match /contacts/{contactId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Empresas
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Serviços
    match /services/{serviceId} {
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
    
    // Tarefas
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Funis
    match /funnels/{funnelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Motivos de Fechamento
    match /closeReasons/{reasonId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // Campos Personalizados
    match /customFields/{fieldId} {
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
    
    // Propostas
    match /proposals/{proposalId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
    
    // ProjectMembers (Responsáveis/Colaboradores)
    match /projectMembers/{memberId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
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

### Accounts (Contas)
- ✅ **Leitura:** Usuário pode ler suas próprias contas ou se for master
- ✅ **Criação:** Apenas master pode criar contas
- ✅ **Edição/Exclusão:** Apenas master pode editar/excluir contas

### Projects (Projetos)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler projetos
- ✅ **Criação:** Usuário pode criar projetos (ownerId deve ser seu UID)
- ✅ **Edição/Exclusão:** Dono do projeto ou master pode editar/excluir

### ProjectUsers (Relação Usuário-Projeto)
- ✅ **Leitura:** Qualquer usuário autenticado pode ler
- ✅ **Criação:** Usuário pode criar relação para si mesmo
- ✅ **Edição/Exclusão:** Usuário pode editar/excluir suas próprias relações

### Usuários
- ✅ **Leitura:** Qualquer usuário autenticado pode ler
- ✅ **Criação:** Usuário pode criar seu próprio perfil
- ✅ **Edição/Exclusão:** Usuário pode editar seu próprio perfil ou master pode editar qualquer perfil

### Outras Coleções
- ✅ **Leitura:** Qualquer usuário autenticado pode ler
- ✅ **Criação:** Usuário pode criar (createdBy deve ser seu UID)
- ✅ **Edição/Exclusão:** Usuário pode editar/excluir seus próprios dados

---

## 🧪 Testar as Regras

### Usando o Simulador

1. No Firebase Console, vá para Firestore → Rules
2. Clique em "Simulator"
3. Teste diferentes cenários:
   - Criar conta como master
   - Criar projeto
   - Ler contas/projetos

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
5. Aguarde alguns minutos após publicar (pode levar tempo para propagar)

---

## 📚 Referências

- [Documentação do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guia de Configuração](./SETUP_GUIDE.md)
- [Solução de Problemas](./TROUBLESHOOTING.md)

