# Documentação - Adventure CRM

Bem-vindo à documentação do Adventure CRM. Aqui você encontra todos os guias e informações sobre o sistema.

## 📚 Índice

### Integração WhatsApp

- **[Visão Geral](WHATSAPP_INTEGRATION.md)** - Arquitetura, funcionalidades e estrutura
- **[Guia de Configuração](SETUP_GUIDE.md)** - Passo a passo completo para configurar
- **[Solução de Problemas](TROUBLESHOOTING.md)** - Troubleshooting e debug
- **[Regras do Firestore](FIRESTORE_RULES.md)** - Configuração de segurança

### Configuração Multi-Tenant

- **[Configuração Firebase Multi-Tenant](FIREBASE_MULTI_TENANT_SETUP.md)** - Guia completo para configurar o Firebase Firestore para suportar multi-tenant (projectId)

## 🚀 Início Rápido

Se você está configurando a integração WhatsApp pela primeira vez:

1. Comece pelo [Guia de Configuração](SETUP_GUIDE.md)
2. Configure as [Regras do Firestore](FIRESTORE_RULES.md)
3. Consulte [Solução de Problemas](TROUBLESHOOTING.md) se encontrar erros

## 📖 Outros Documentos

- **[README Principal](../README.md)** - Visão geral do projeto
- **[README da Extensão](../extension/README.md)** - Detalhes técnicos da extensão Chrome

## 🔄 Status da Documentação

- ✅ **Atualizado:** Toda documentação reflete a solução atual (REST API direta ao Firestore)
- ✅ **Organizado:** Documentação centralizada na pasta `docs/`
- ✅ **Completo:** Guias passo a passo e troubleshooting incluídos

## 💡 Notas

- A integração WhatsApp funciona **100% gratuitamente** no plano Spark do Firebase
- Não é necessário Firebase Functions (não utilizadas na solução atual)
- Todas as operações são feitas via REST API do Firestore


