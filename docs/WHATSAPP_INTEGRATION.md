# Integração WhatsApp - Documentação Completa

## 📋 Visão Geral

A integração WhatsApp permite conectar o Adventure CRM com WhatsApp Web através de uma extensão Chrome. Esta solução é **100% gratuita** e funciona no plano Spark do Firebase, usando acesso direto ao Firestore via REST API.

## 🎯 Funcionalidades

- ✅ **Sidebar no WhatsApp Web** - Interface para criar/vincular contatos e negociações
- ✅ **Detecção automática de número** - Identifica o número da conversa atual
- ✅ **Criar/Vincular Contato** - Cria novo contato ou vincula a existente
- ✅ **Criar/Vincular Negociação** - Cria nova negociação ou vincula a existente
- ✅ **Salvar Mensagens** - Seleciona e salva mensagens do WhatsApp no banco
- ✅ **Botão WhatsApp no CRM** - Abre conversa direto da página de Deal

## 🏗️ Arquitetura

### Solução Implementada (Gratuita)

```
Extensão Chrome → REST API Firestore → Firestore Database
```

**Não usa Firebase Functions** - Acesso direto via REST API do Firestore, funcionando no plano gratuito.

## 📁 Estrutura de Arquivos

```
extension/
├── manifest.json          # Configuração da extensão
├── content.js             # Script principal (injeta sidebar)
├── sidebar.css            # Estilos da sidebar
├── background.js          # Service worker
├── popup.html/js          # Interface de configuração
├── convert-icon.html      # Gerador de ícones
└── README.md              # Documentação da extensão

docs/
├── WHATSAPP_INTEGRATION.md  # Este arquivo (visão geral)
├── SETUP_GUIDE.md          # Guia de configuração passo a passo
├── TROUBLESHOOTING.md      # Solução de problemas
└── FIRESTORE_RULES.md      # Regras de segurança do Firestore
```

## 🔧 Componentes

### 1. Extensão Chrome
- Injetada no WhatsApp Web
- Detecta número da conversa
- Interface para criar/vincular contatos e negociações
- Permite selecionar e salvar mensagens

### 2. Aplicação Web (CRM)
- Botão WhatsApp na página de Deal
- Utilitários para formatação de links WhatsApp
- Helper para obter token Firebase

### 3. Firestore Database
- Armazena contatos, negociações e conversas
- Regras de segurança configuradas
- Acesso via REST API (gratuito)

## 📚 Documentação

- **[Guia de Configuração](SETUP_GUIDE.md)** - Passo a passo completo
- **[Solução de Problemas](TROUBLESHOOTING.md)** - Troubleshooting
- **[Regras do Firestore](FIRESTORE_RULES.md)** - Configuração de segurança
- **[README da Extensão](../extension/README.md)** - Detalhes técnicos

## ✅ Status da Implementação

- ✅ Extensão Chrome implementada
- ✅ Acesso direto ao Firestore via REST API
- ✅ Botão WhatsApp no CRM
- ✅ Detecção automática de número
- ✅ Criação de contatos e negociações
- ✅ Salvamento de mensagens
- ⚠️ **Pendente:** Configurar regras do Firestore
- ⚠️ **Pendente:** Gerar ícones da extensão
- ⚠️ **Pendente:** Testes finais

## 🚀 Próximos Passos

1. **Configurar Regras do Firestore** - Ver [FIRESTORE_RULES.md](FIRESTORE_RULES.md)
2. **Gerar Ícones** - Usar `extension/convert-icon.html`
3. **Instalar Extensão** - Ver [SETUP_GUIDE.md](SETUP_GUIDE.md)
4. **Testar Integração** - Verificar todas as funcionalidades

## 💡 Notas Importantes

- **Token expira:** O token Firebase expira após ~1 hora. Atualize periodicamente na extensão.
- **Funil ativo:** É necessário ter um funil ativo no CRM para criar negociações.
- **Plano gratuito:** A solução funciona 100% no plano Spark (gratuito) do Firebase.


