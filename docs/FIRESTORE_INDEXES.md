# Índices do Firestore - Adventure CRM

## 📋 Índices Necessários

Para que as queries funcionem corretamente, você precisa criar os seguintes índices compostos no Firebase Console.

### Como Criar os Índices

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/indexes
2. Clique em "Create Index"
3. Configure cada índice conforme abaixo
4. Aguarde a criação (pode levar alguns minutos)

---

## 📊 Índices para Relatórios

### 1. marketingReports

**Collection ID:** `marketingReports`

**Fields:**
- `projectId` (Ascending)
- `date` (Descending)

**Query scope:** Collection

**Link direto:** [Criar índice marketingReports](https://console.firebase.google.com/v1/r/project/adv-labs/firestore/indexes?create_composite=ClFwcm9qZWN0cy9hZHYtbGFicy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbWFya2V0aW5nUmVwb3J0cy9pbmRleGVzL18QARoNCglwcm9qZWN0SWQQARoICgRkYXRlEAIaDAoIX19uYW1lX18QAg)

---

### 2. salesReports

**Collection ID:** `salesReports`

**Fields:**
- `projectId` (Ascending)
- `date` (Descending)

**Query scope:** Collection

**Link direto:** [Criar índice salesReports](https://console.firebase.google.com/v1/r/project/adv-labs/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9hZHYtbGFicy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvc2FsZXNSZXBvcnRzL2luZGV4ZXMvXxABGg0KCXByb2plY3RJZBABGggKBGRhdGUQAhoMCghfX25hbWVfXxAC)

---

## 📊 Índices para Outras Coleções

### 3. companies

**Collection ID:** `companies`

**Fields:**
- `projectId` (Ascending)
- `createdAt` (Descending)

**Query scope:** Collection

**Link direto:** [Criar índice companies](https://console.firebase.google.com/v1/r/project/adv-labs/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9hZHYtbGFicy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY29tcGFuaWVzL2luZGV4ZXMvXxABGg0KCXByb2plY3RJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)

---

## ⚠️ Importante

- Os índices são criados automaticamente quando você clica nos links de erro no console do navegador
- Ou você pode criar manualmente seguindo as instruções acima
- A criação pode levar alguns minutos
- Você receberá um email quando os índices estiverem prontos

---

## 🔍 Verificar Status dos Índices

1. Acesse: https://console.firebase.google.com/project/adv-labs/firestore/indexes
2. Verifique se os índices estão com status "Enabled" (verde)
3. Se estiverem "Building" (amarelo), aguarde a conclusão

---

**Última atualização:** 2024
