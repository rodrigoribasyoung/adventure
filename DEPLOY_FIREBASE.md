# Deploy das Firebase Functions

## Pré-requisitos

1. Node.js 18+ instalado
2. Firebase CLI instalado (já instalado: `npm install -g firebase-tools`)
3. Acesso ao projeto Firebase `adv-labs`

## Passo a Passo

### 1. Fazer Login no Firebase

Execute no terminal:

```bash
firebase login
```

Isso abrirá o navegador para autenticação. Faça login com a conta que tem acesso ao projeto.

### 2. Verificar Projeto

```bash
firebase projects:list
```

Certifique-se de que `adv-labs` está na lista.

### 3. Configurar Projeto (se necessário)

Se ainda não tiver o arquivo `.firebaserc` na raiz do projeto:

```bash
firebase use adv-labs
```

Ou crie manualmente o arquivo `.firebaserc`:

```json
{
  "projects": {
    "default": "adv-labs"
  }
}
```

### 4. Instalar Dependências das Functions

```bash
cd functions
npm install
```

### 5. Fazer Build

```bash
npm run build
```

Isso compila o TypeScript para JavaScript na pasta `lib/`.

### 6. Fazer Deploy

```bash
firebase deploy --only functions
```

**Importante:** Anote a URL que aparecerá no final, algo como:
```
✔  functions[api/whatsapp/createContact(us-central1)]: Successful create operation.
✔  functions[api/whatsapp/createDeal(us-central1)]: Successful create operation.
✔  functions[api/whatsapp/saveMessages(us-central1)]: Successful create operation.
✔  functions[api/whatsapp/getContacts(us-central1)]: Successful create operation.
✔  functions[api/whatsapp/getDeals(us-central1)]: Successful create operation.

Function URL (createContact): https://us-central1-adv-labs.cloudfunctions.net/api/whatsapp/createContact
```

A URL base será: `https://us-central1-adv-labs.cloudfunctions.net`

### 7. Atualizar URL na Extensão

Após o deploy, atualize a constante `FIREBASE_FUNCTIONS_URL` no arquivo `extension/content.js` (linha ~3) com a URL real.

---

## Verificar Deploy

Para verificar se as functions estão funcionando:

```bash
firebase functions:list
```

Para ver os logs:

```bash
firebase functions:log
```

---

## Testar Endpoints Manualmente

Após o deploy, você pode testar os endpoints:

```bash
# Substitua <TOKEN> pelo seu token Firebase
curl -X GET "https://us-central1-adv-labs.cloudfunctions.net/api/whatsapp/getContacts" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Troubleshooting

### Erro: "Project not found"
- Verifique se o projeto `adv-labs` existe no Firebase Console
- Execute `firebase use adv-labs` para configurar

### Erro: "Permission denied"
- Verifique se sua conta tem permissão de administrador no projeto Firebase
- Acesse https://console.firebase.google.com e verifique as permissões

### Erro no build TypeScript
- Verifique se todas as dependências estão instaladas: `cd functions && npm install`
- Verifique se há erros de sintaxe: `npm run build`

### Functions não aparecem após deploy
- Aguarde alguns minutos (pode levar tempo para propagar)
- Verifique em: https://console.firebase.google.com/project/adv-labs/functions

