# Regras do Firestore - Hierarquia de Acesso

## 📋 Visão Geral

Este documento descreve a hierarquia de acesso implementada no Firebase Firestore para o Adventure CRM. A hierarquia permite controle granular de acesso baseado em níveis de usuário.

## 🎯 Hierarquia de Acesso

### 0. Desenvolvedor (`developer`)
- **Acesso:** Completo - geral
- **Onde é definido:** Backend e Firebase
- **Permissões:**
  - ✅ Acesso total a todas as coleções
  - ✅ Pode criar, ler, atualizar e excluir qualquer documento
  - ✅ Pode excluir usuários
  - ✅ Pode gerenciar projetos, contas e todas as entidades

### 1. Proprietário (`owner`)
- **Acesso:** Completo - geral
- **Onde é definido:** Backend e Firebase
- **Permissões:**
  - ✅ Acesso total a todas as coleções (exceto exclusão de usuários)
  - ✅ Pode criar, ler e atualizar qualquer documento
  - ✅ Pode gerenciar projetos e contas
  - ❌ Não pode excluir usuários (apenas Desenvolvedor)

### 2. Cliente (`client`)
- **Acesso:** Completo a nível de Projeto
- **Onde é definido:** Frontend do app (via `projectUsers`)
- **Permissões:**
  - ✅ Acesso completo aos dados do projeto vinculado
  - ✅ Pode criar, ler, atualizar e excluir dados do projeto
  - ✅ Acesso limitado ao projeto específico via `projectUsers`
  - ❌ Não pode acessar dados de outros projetos
  - ❌ Não pode gerenciar projetos ou usuários

### 3. Usuário (`user`)
- **Acesso:** Específico por nível de cargo
- **Onde é definido:** Frontend do app (via `projectMembers` e `projectUsers`)
- **Permissões:**
  - ✅ Acesso aos dados do projeto vinculado
  - ✅ Permissões específicas baseadas no cargo/função
  - ✅ Acesso limitado ao projeto específico via `projectUsers`
  - ❌ Não pode acessar dados de outros projetos
  - ❌ Não pode gerenciar projetos ou usuários
  - ⚠️ Permissões específicas serão definidas no frontend

## 🔐 Como Funciona

### Estrutura de Dados

#### User (Coleção `users`)
```typescript
{
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  userType: 'developer' | 'owner' | 'client' | 'user' // Hierarquia de acesso
  isMaster?: boolean // DEPRECATED: usar userType
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}
```

#### ProjectUser (Coleção `projectUsers`)
Vincula usuários (clientes/usuários) a projetos:
```typescript
{
  id: string
  projectId: string
  userId: string
  role: 'owner' | 'admin' | 'user' | 'viewer'
  accessLevel: 'full' | 'limited'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Verificação de Acesso

As regras do Firestore verificam:

1. **Desenvolvedor/Proprietário:** Acesso direto via `userType`
2. **Cliente/Usuário:** Acesso via `projectUsers` vinculando `userId` + `projectId`

## 📝 Regras do Firestore

### Helper Functions

```javascript
// Verificar se é Desenvolvedor
function isDeveloper() {
  return request.auth != null && 
         getUserData().userType == 'developer';
}

// Verificar se é Proprietário
function isOwner() {
  return request.auth != null && 
         getUserData().userType == 'owner';
}

// Verificar se é Desenvolvedor ou Proprietário
function isDeveloperOrOwner() {
  return isDeveloper() || isOwner();
}

// Verificar acesso a projeto
function hasProjectAccess(projectId) {
  if (isDeveloperOrOwner()) return true;
  // Verificar projectUsers
  return exists(/databases/$(database)/documents/projectUsers/$(request.auth.uid + '_' + projectId));
}
```

### Regras por Coleção

#### Users
- **Leitura:** Todos autenticados
- **Criação:** Desenvolvedor/Proprietário ou próprio usuário
- **Atualização:** Próprio usuário ou Desenvolvedor/Proprietário
- **Exclusão:** Apenas Desenvolvedor

#### Projects
- **Leitura:** Desenvolvedor/Proprietário (todos) ou Cliente/Usuário (apenas com acesso)
- **Criação:** Desenvolvedor/Proprietário
- **Atualização:** Desenvolvedor/Proprietário ou dono do projeto
- **Exclusão:** Apenas Desenvolvedor/Proprietário

#### Dados do Projeto (Contacts, Deals, Tasks, etc.)
- **Leitura:** Desenvolvedor/Proprietário (todos) ou Cliente/Usuário (apenas do projeto com acesso)
- **Criação:** Desenvolvedor/Proprietário ou quem tem acesso ao projeto
- **Atualização:** Desenvolvedor/Proprietário ou criador com acesso ao projeto
- **Exclusão:** Desenvolvedor/Proprietário ou criador com acesso ao projeto

## 🚀 Configuração

### Passo 1: Definir userType no Firebase Console

Para definir um usuário como Desenvolvedor ou Proprietário:

1. Acesse o Firebase Console
2. Vá para Firestore Database
3. Abra a coleção `users`
4. Selecione o documento do usuário
5. Adicione o campo `userType` com valor:
   - `'developer'` para Desenvolvedor
   - `'owner'` para Proprietário

### Passo 2: Aplicar as Regras

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/rules
2. Copie o conteúdo do arquivo `firestore.rules` na raiz do projeto
3. Cole no editor de regras
4. Clique em **"Publicar"**

### Passo 3: Configurar Clientes e Usuários

Para Clientes e Usuários, crie documentos em `projectUsers`:

```typescript
// Exemplo: Vincular cliente a um projeto
{
  id: 'userId_projectId',
  projectId: 'projeto-123',
  userId: 'user-456',
  role: 'owner', // ou 'admin', 'user', 'viewer'
  accessLevel: 'full', // ou 'limited'
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

## 🧪 Testar as Regras

### Usando o Simulador do Firebase

1. No Firebase Console, vá para Firestore → Rules
2. Clique em "Simulator"
3. Configure:
   - **Location:** `projects/projeto-123`
   - **Method:** `read`
   - **Authentication:** UID do usuário
   - **Data:** `{ userType: 'developer' }` (no documento do usuário)
4. Clique em "Run"
5. Deve retornar "Allow" ✅

### Testes Recomendados

1. **Desenvolvedor:**
   - ✅ Deve conseguir ler/escrever qualquer documento
   - ✅ Deve conseguir excluir usuários

2. **Proprietário:**
   - ✅ Deve conseguir ler/escrever qualquer documento
   - ❌ Não deve conseguir excluir usuários

3. **Cliente:**
   - ✅ Deve conseguir acessar apenas projetos vinculados
   - ❌ Não deve conseguir acessar outros projetos

4. **Usuário:**
   - ✅ Deve conseguir acessar apenas projetos vinculados
   - ❌ Não deve conseguir acessar outros projetos

## ⚠️ Avisos Importantes

1. **Sempre defina `userType`** para Desenvolvedor e Proprietário
2. **Sempre crie `projectUsers`** para Clientes e Usuários
3. **Teste as regras** antes de usar em produção
4. **Mantenha as regras atualizadas** conforme novas coleções forem adicionadas
5. **O campo `isMaster` está DEPRECATED** - use `userType` em novos desenvolvimentos

## 🔄 Migração

### Migrar de `isMaster` para `userType`

Se você já tem usuários com `isMaster: true`:

1. Atualize os documentos em `users`:
   - Se `isMaster: true` → `userType: 'owner'`
   - Se não tem `isMaster` ou `isMaster: false` → `userType: 'user'`

2. Atualize o código para usar `userType` em vez de `isMaster`

## 📚 Referências

- [Documentação do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guia de Configuração](./SETUP_GUIDE.md)
- [Solução de Problemas](./TROUBLESHOOTING.md)
- [Regras Completas](./FIRESTORE_RULES_COMPLETE.md)

---

**Última atualização:** 2024
**Versão:** 2.0
