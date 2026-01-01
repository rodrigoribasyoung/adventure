# Plano de Unificação de Usuários e Responsáveis

## Estrutura Proposta

### Hierarquia de Acesso

1. **Desenvolvedor/Admin** (Adventure Labs)
   - `userType: 'developer' | 'owner'`
   - Acesso completo ao sistema
   - Pode gerenciar tenants, projetos e usuários

2. **Tenant** (Dono da Conta)
   - Uma conta pode ter múltiplos projetos
   - Acesso a todos os projetos da conta
   - Pode gerenciar usuários dos projetos

3. **Projeto** (Unidade/Empreendimento)
   - Pertence a uma Tenant
   - Uma Tenant pode ter múltiplos projetos
   - Cada projeto tem seus próprios usuários/responsáveis

4. **Usuários/Responsáveis** (Gestores, SDRs, MKT, Closers)
   - Usuários associados a projetos
   - Podem criar/editar negociações, tarefas, etc.
   - Substituem os atuais ProjectMembers

## Mudanças Necessárias

### 1. Estrutura de Dados

**Atual:**
- `User` - usuários do sistema (developer, owner, client, user)
- `ProjectMember` - responsáveis/colaboradores do projeto
- `ProjectUser` - relação usuário-projeto (cliente da Adventure)

**Nova:**
- `User` - mantém a estrutura atual para developers/owners
- `ProjectUser` - expandido para incluir todos os usuários do projeto (responsáveis)
  - Adicionar campos: `functionLevel`, `active`, `role` (cargo), `phone`
  - Remover `ProjectMember` - unificar em `ProjectUser`

### 2. Migração

1. Migrar dados de `ProjectMember` para `ProjectUser`
2. Atualizar referências de `assignedTo` (de `projectMemberId` para `userId`)
3. Atualizar interfaces e componentes

### 3. Componentes a Atualizar

- `ProjectMembersPage` → `ProjectUsersPage` (ou manter nome mas usar ProjectUser)
- `useProjectMembers` → `useProjectUsers` (expandido)
- `DealForm` - usar `ProjectUser` ao invés de `ProjectMember`
- `TaskForm` - usar `ProjectUser` ao invés de `ProjectMember`
- Todos os lugares que usam `ProjectMember`

## Implementação

### Fase 1: Atualizar Tipos
- Expandir `ProjectUser` com campos de `ProjectMember`
- Marcar `ProjectMember` como deprecated

### Fase 2: Atualizar Hooks
- Criar `useProjectUsers` que substitui `useProjectMembers`
- Manter compatibilidade temporária

### Fase 3: Atualizar Componentes
- Atualizar formulários e listas
- Atualizar referências em deals e tasks

### Fase 4: Migração de Dados
- Script para migrar ProjectMembers para ProjectUsers
- Atualizar referências de assignedTo

### Fase 5: Limpeza
- Remover código de ProjectMember
- Atualizar documentação

