# Configuração do Firebase

## Permissões do Firestore

Para o aplicativo funcionar, você precisa configurar as regras de segurança do Firestore:

1. Acesse Firebase Console → Firestore Database → Rules

2. Configure as regras (ajuste conforme necessário para seu caso):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Regras para contatos
    match /contacts/{contactId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para empresas
    match /companies/{companyId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para serviços
    match /services/{serviceId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para negociações
    match /deals/{dealId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para tarefas
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para funis
    match /funnels/{funnelId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para campos personalizados
    match /customFields/{fieldId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para conversas WhatsApp
    match /whatsappConversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Índices do Firestore

Se você usar `orderBy` nas queries, pode precisar criar índices. O Firebase mostrará links para criar índices automaticamente quando necessário.

Alternativamente, o código já tem fallback para ordenação local caso o índice não exista.

## Autenticação Google

1. Acesse Firebase Console → Authentication → Sign-in method
2. Ative "Google" como método de login
3. Configure o domínio autorizado:
   - Vá em Settings → Authorized domains
   - Adicione seu domínio do Vercel (ex: `seu-projeto.vercel.app`)

