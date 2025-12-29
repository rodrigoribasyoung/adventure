# Configuração do Firebase para Multi-Tenant (projectId)

## 📋 Visão Geral

Este documento explica como configurar o Firebase Firestore para suportar o sistema multi-tenant baseado em `projectId`. O sistema permite que diferentes projetos (clientes) tenham seus dados isolados, enquanto usuários master (Adventure) têm acesso a todos os projetos.

## 🔐 1. Regras de Segurança do Firestore

### Opção A: Regras Completas (Recomendado para Produção)

Essas regras validam o acesso ao `projectId` no nível do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para verificar se usuário tem acesso ao projeto
    function canAccessProject(projectId) {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      let project = get(/databases/$(database)/documents/projects/$(projectId));
      
      return request.auth != null && (
        // Se for master, tem acesso a todos os projetos
        userDoc.data.isMaster == true ||
        // Ou se é o dono do projeto
        project.data.ownerId == request.auth.uid ||
        // Ou se está na lista de membros do projeto
        request.auth.uid in project.data.members[].userId
      )
    }
    
    // Projetos
    match /projects/{projectId} {
      allow read: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.uid in resource.data.members[].userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isMaster == true
      );
      allow create: if request.auth != null && 
                       request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                (resource.data.ownerId == request.auth.uid ||
                                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isMaster == true);
    }
    
    // Contatos - valida projectId
    match /contacts/{contactId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Empresas - valida projectId
    match /companies/{companyId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Negociações - valida projectId
    match /deals/{dealId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Serviços - valida projectId
    match /services/{serviceId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Tarefas - valida projectId
    match /tasks/{taskId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Funis - valida projectId
    match /funnels/{funnelId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Propostas - valida projectId
    match /proposals/{proposalId} {
      allow read: if request.auth != null && 
                     (resource.data.projectId == null || 
                      canAccessProject(resource.data.projectId));
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid &&
                       (request.resource.data.projectId == null ||
                        canAccessProject(request.resource.data.projectId));
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid &&
                                (resource.data.projectId == null ||
                                 canAccessProject(resource.data.projectId));
    }
    
    // Motivos de fechamento (globais, sem projectId)
    match /closeReasons/{reasonId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
                                        resource.data.createdBy == request.auth.uid;
    }
    
    // Usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversas WhatsApp
    match /whatsappConversations/{conversationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null && 
                        resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### Opção B: Regras Simplificadas (Recomendado para Desenvolvimento)

Essas regras são mais simples e confiam na validação do `projectId` no lado do cliente (app):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Projetos
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                (resource.data.ownerId == request.auth.uid ||
                                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isMaster == true);
    }
    
    // Todas as outras coleções - validação básica
    // O app filtra por projectId no lado do cliente
    match /{collection}/{documentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                                resource.data.createdBy == request.auth.uid;
    }
  }
}
```

**⚠️ Nota:** A Opção B é mais simples, mas menos segura. Use apenas em desenvolvimento ou se confiar completamente na validação do lado do cliente.

## 📍 2. Como Aplicar as Regras

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules
2. Ou navegue: Firebase Console → Firestore Database → Rules

### Passo 2: Copiar as Regras

1. Escolha a Opção A (completa) ou Opção B (simplificada)
2. Copie o código das regras
3. Cole na área de edição do Firebase Console

### Passo 3: Publicar

1. Clique no botão **"Publicar"**
2. Aguarde a confirmação
3. As regras serão aplicadas imediatamente

## 📊 3. Índices do Firestore

Para otimizar as queries que filtram por `projectId` e ordenam por `createdAt`, você precisa criar índices compostos.

### Índices Necessários

Crie os seguintes índices no Firebase Console (Firestore → Indexes):

1. **deals**
   - Collection ID: `deals`
   - Fields: 
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

2. **contacts**
   - Collection ID: `contacts`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

3. **companies**
   - Collection ID: `companies`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

4. **services**
   - Collection ID: `services`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

5. **tasks**
   - Collection ID: `tasks`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

6. **funnels**
   - Collection ID: `funnels`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

7. **proposals**
   - Collection ID: `proposals`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

### Como Criar os Índices

**Método 1: Automático (Recomendado)**

1. Execute o app e navegue pelas páginas (deals, contacts, etc.)
2. O Firebase detectará queries que precisam de índices
3. Clique nos links de erro que aparecem no console do navegador
4. O Firebase abrirá a página de criação de índices automaticamente
5. Clique em "Create Index"

**Método 2: Manual**

1. Acesse: Firebase Console → Firestore → Indexes
2. Clique em "Create Index"
3. Configure cada índice conforme listado acima
4. Clique em "Create"

**⏱️ Tempo de Criação:** Os índices podem levar alguns minutos para serem criados. Você receberá um email quando estiverem prontos.

## 🔄 4. Como o App Entende os Vínculos de projectId

### A. ProjectContext (Gerenciamento do Projeto Ativo)

O `ProjectContext` gerencia qual projeto está ativo no momento:

```typescript
// src/contexts/ProjectContext.tsx
// - Gerencia o projeto ativo (currentProject)
// - Persiste no localStorage (chave: 'adventure_current_project_id')
// - Todos os hooks usam esse contexto
```

**Fluxo:**
1. Usuário faz login
2. `ProjectContext` carrega projetos disponíveis via `useProjects()`
3. Seleciona o projeto salvo no localStorage ou o primeiro disponível
4. Todos os hooks usam `currentProject.id` para filtrar dados

### B. Hooks Filtram por projectId

Todos os hooks seguem este padrão:

```typescript
// Exemplo: useDeals.ts
const { currentProject } = useProject() // Pega projeto ativo

const fetchDeals = async () => {
  if (!currentProject) {
    setDeals([])
    return
  }
  
  // Filtra por projectId do projeto ativo
  const constraints = [
    where('projectId', '==', currentProject.id),
    orderBy('createdAt', 'desc')
  ]
  const data = await getDocuments<Deal>('deals', constraints)
  setDeals(data)
}
```

**Hooks que já fazem isso:**
- ✅ `useDeals` → filtra deals por `projectId`
- ✅ `useContacts` → filtra contatos por `projectId`
- ✅ `useCompanies` → filtra empresas por `projectId`
- ✅ `useServices` → filtra serviços por `projectId`
- ✅ `useTasks` → filtra tarefas por `projectId`
- ✅ `useFunnels` → filtra funis por `projectId`

### C. Criação de Dados (Atribuição Automática de projectId)

Ao criar um novo registro, o hook atribui automaticamente o `projectId`:

```typescript
const createDeal = async (data) => {
  if (!currentProject) {
    throw new Error('Nenhum projeto selecionado')
  }
  
  const dealData = {
    ...data,
    projectId: currentProject.id, // ← Atribuído automaticamente
    createdBy: currentUser.uid,
  }
  
  await createDocument<Deal>('deals', dealData)
}
```

### D. Fluxo Completo

```
1. Usuário faz login
   ↓
2. ProjectContext carrega projetos disponíveis
   ↓
3. Seleciona projeto ativo (localStorage ou primeiro)
   ↓
4. Todos os hooks usam currentProject.id
   ↓
5. Queries filtram: where('projectId', '==', currentProject.id)
   ↓
6. Criação de dados: projectId = currentProject.id (automático)
   ↓
7. Usuário muda projeto → ProjectContext atualiza → Hooks recarregam dados
```

## ✅ 5. Checklist de Configuração

Use este checklist para garantir que tudo está configurado corretamente:

### Firebase Console

- [ ] Regras do Firestore atualizadas (Opção A ou B)
- [ ] Regras publicadas (não apenas salvas)
- [ ] Índice criado para `deals` (projectId + createdAt)
- [ ] Índice criado para `contacts` (projectId + createdAt)
- [ ] Índice criado para `companies` (projectId + createdAt)
- [ ] Índice criado para `services` (projectId + createdAt)
- [ ] Índice criado para `tasks` (projectId + createdAt)
- [ ] Índice criado para `funnels` (projectId + createdAt)
- [ ] Índice criado para `proposals` (projectId + createdAt)
- [ ] Todos os índices estão "Enabled" (verde)

### Testes no App

- [ ] Login funciona corretamente
- [ ] Projetos são carregados após login
- [ ] Projeto padrão é selecionado automaticamente
- [ ] Dados são filtrados por projeto (só aparecem dados do projeto ativo)
- [ ] Criação de novos dados atribui `projectId` automaticamente
- [ ] Mudança de projeto recarrega os dados corretamente
- [ ] Usuário master vê todos os projetos
- [ ] Usuário normal vê apenas projetos onde tem acesso

### Validação de Segurança

- [ ] Usuário não consegue acessar dados de outro projeto (teste manual)
- [ ] Usuário não consegue criar dados com `projectId` de projeto sem acesso
- [ ] Regras do Firestore bloqueiam acesso não autorizado

## 🧪 6. Testar as Regras

### Usando o Simulador do Firebase

1. No Firebase Console, vá para Firestore → Rules
2. Clique em "Simulator"
3. Configure:
   - **Location:** `deals/123`
   - **Method:** `read`
   - **Authentication:** Seu UID
   - **Data:** `{ projectId: "projeto-id", createdBy: "seu-uid" }`
4. Clique em "Run"
5. Deve retornar "Allow" ✅

### Teste de Segurança

1. Tente criar um deal com `projectId` de um projeto que você não tem acesso
2. Deve retornar "Deny" ✅

## 🔍 7. Troubleshooting

### Erro "Permission denied" mesmo com regras configuradas

1. Verifique se as regras foram **publicadas** (não apenas salvas)
2. Verifique se o token está correto e não expirou
3. Verifique se o `projectId` está sendo definido corretamente
4. Use o simulador para testar as regras
5. Verifique se o usuário tem `isMaster: true` ou está na lista de membros do projeto

### Queries lentas ou erros de índice

1. Verifique se os índices foram criados e estão "Enabled"
2. Aguarde alguns minutos após criar os índices (podem levar tempo)
3. Verifique se está usando `where('projectId', '==', ...)` antes de `orderBy`
4. O app tem fallback para ordenação local caso o índice não exista

### Dados não aparecem após mudar de projeto

1. Verifique se o `ProjectContext` está atualizando corretamente
2. Verifique se os hooks estão recarregando os dados quando `currentProject` muda
3. Verifique o console do navegador para erros
4. Limpe o cache do navegador

### Usuário master não vê todos os projetos

1. Verifique se o campo `isMaster: true` está no documento do usuário em `users/{userId}`
2. Verifique se a regra está verificando `isMaster` corretamente
3. Verifique se o `ProjectContext` está usando `userData.isMaster` corretamente

## 📚 8. Referências

- [Documentação do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Documentação de Índices do Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Guia de Configuração](./SETUP_GUIDE.md)
- [Solução de Problemas](./TROUBLESHOOTING.md)

## 🎯 9. Próximos Passos

Após configurar o Firebase:

1. Execute o seed completo: `window.runSeed()` no console do navegador
2. Teste a criação de dados em diferentes projetos
3. Teste a mudança de projetos
4. Verifique se os dados estão isolados corretamente
5. Configure usuários master e usuários normais para testar permissões

---

**Última atualização:** 2024
**Versão:** 1.0

