# Configuração de Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Variáveis de Ambiente

Para o aplicativo funcionar corretamente no Vercel, você PRECISA adicionar as variáveis de ambiente abaixo.

## Via Dashboard do Vercel:

1. Acesse https://vercel.com
2. Vá para seu projeto
3. Settings → Environment Variables
4. Adicione as seguintes variáveis:

### Variáveis necessárias:

```
VITE_FIREBASE_API_KEY=AIzaSyCT-lXPqlD0ocUQeEaKavoU7JvbqBE9uSo
VITE_FIREBASE_AUTH_DOMAIN=adv-labs.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=adv-labs
VITE_FIREBASE_STORAGE_BUCKET=adv-labs.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=227032080106
VITE_FIREBASE_APP_ID=1:227032080106:web:b11927d925a3937fe4c193
```

### Importante:

- Adicione para todos os ambientes (Production, Preview, Development)
- Após adicionar, você precisa fazer um novo deploy para as variáveis serem aplicadas

## Via CLI do Vercel:

```bash
# Linkar o projeto (se ainda não fez)
vercel link

# Adicionar variáveis
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

## Configuração no Firebase:

1. Acesse Firebase Console → Authentication → Settings
2. Em "Authorized domains", adicione o domínio do Vercel:
   - Seu domínio: `seu-projeto.vercel.app`
   - Domínios customizados se tiver

