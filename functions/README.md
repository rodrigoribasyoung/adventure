# Firebase Functions - Adventure CRM WhatsApp Integration

## ⚠️ Status: Não Utilizado

**As Firebase Functions não são mais necessárias!**

A integração WhatsApp foi atualizada para usar **REST API do Firestore diretamente**, eliminando a necessidade de Firebase Functions. Isso permite funcionar no plano gratuito do Firebase (Spark).

## 🔄 Migração Realizada

A extensão agora faz requisições HTTP diretamente para:
```
https://firestore.googleapis.com/v1/projects/adv-labs/databases/(default)/documents/
```

Com autenticação via token Firebase no header `Authorization: Bearer <token>`.

## 📚 Documentação Atual

Para informações sobre a integração WhatsApp atual, consulte:
- **[Documentação Completa](../docs/WHATSAPP_INTEGRATION.md)**
- **[Guia de Configuração](../docs/SETUP_GUIDE.md)**

## 💡 Nota

Este diretório (`functions/`) pode ser removido no futuro, pois não é mais necessário para a integração WhatsApp. As Functions foram substituídas por acesso direto ao Firestore via REST API.

