# Firebase Functions - Adventure CRM WhatsApp Integration

Funções Firebase para comunicação entre a extensão Chrome e o CRM.

## Configuração

1. Instale as dependências:
```bash
cd functions
npm install
```

2. Configure o Firebase CLI (se ainda não fez):
```bash
npm install -g firebase-tools
firebase login
```

3. Inicialize o projeto (se necessário):
```bash
firebase init functions
```

## Deploy

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Endpoints

### POST /api/whatsapp/createContact
Cria um novo contato.

**Headers:**
- `Authorization: Bearer <firebase-token>`

**Body:**
```json
{
  "name": "Nome do Contato",
  "email": "email@example.com",
  "phone": "5511999999999",
  "userId": "user-id"
}
```

### POST /api/whatsapp/createDeal
Cria uma nova negociação.

**Headers:**
- `Authorization: Bearer <firebase-token>`

**Body:**
```json
{
  "title": "Título da Negociação",
  "value": 5000.00,
  "contactId": "contact-id",
  "phoneNumber": "5511999999999",
  "userId": "user-id"
}
```

### POST /api/whatsapp/saveMessages
Salva mensagens selecionadas do WhatsApp.

**Headers:**
- `Authorization: Bearer <firebase-token>`

**Body:**
```json
{
  "phoneNumber": "5511999999999",
  "messages": [
    {
      "text": "Texto da mensagem",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "dealId": "deal-id",
  "userId": "user-id"
}
```

### GET /api/whatsapp/getContacts
Busca contatos.

**Headers:**
- `Authorization: Bearer <firebase-token>`

**Query Parameters:**
- `phone`: Filtrar por telefone
- `search`: Busca por nome, email ou telefone

### GET /api/whatsapp/getDeals
Busca negociações.

**Headers:**
- `Authorization: Bearer <firebase-token>`

**Query Parameters:**
- `phoneNumber`: Filtrar por número de telefone (via contato)
- `contactId`: Filtrar por ID do contato
- `search`: Busca por título

## Autenticação

Todos os endpoints requerem autenticação via token Firebase no header `Authorization: Bearer <token>`.

O token é verificado usando `admin.auth().verifyIdToken()`.

