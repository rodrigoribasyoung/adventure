# CRM Adventure Labs

Sistema de CRM focado em serviços desenvolvido para a Adventure Labs.

## Tecnologias

- React 18 + TypeScript
- Vite
- Firebase (Firestore + Auth)
- Tailwind CSS
- React Router v6
- React Hook Form + Zod

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Firebase configurada

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Firebase.

## Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Build

```bash
npm run build
```

## Validação

Antes de fazer commit, é recomendado validar o código:

```bash
# Verificar tipos TypeScript
npm run type-check

# Verificar lint
npm run lint

# Executar ambas as validações
npm run validate
```

**Nota:** Um git hook pre-commit foi configurado para executar validações automaticamente antes de cada commit. Se o hook não funcionar, você pode executar `npm run validate` manualmente antes de fazer commit.

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── features/       # Módulos por funcionalidade
├── lib/           # Utilitários e configurações
├── contexts/      # Context providers
├── routes/        # Configuração de rotas
├── styles/        # Estilos globais
└── types/         # TypeScript types
```

## Design System

- Tema: Dark mode com fundo azul marinho escuro
- Cores principais: Vermelho #DA0028 e Azul #042AA1
- Estilo: Tech minimalista

## Integração WhatsApp

O sistema possui integração com WhatsApp Web através de uma extensão Chrome. A solução é **100% gratuita** e funciona no plano Spark do Firebase.

### Documentação

- **[Guia de Configuração](docs/SETUP_GUIDE.md)** - Passo a passo completo para configurar
- **[Solução de Problemas](docs/TROUBLESHOOTING.md)** - Troubleshooting e debug
- **[Regras do Firestore](docs/FIRESTORE_RULES.md)** - Configuração de segurança
- **[Documentação Completa](docs/WHATSAPP_INTEGRATION.md)** - Visão geral e arquitetura

### Funcionalidades

- ✅ Sidebar no WhatsApp Web para criar/vincular contatos e negociações
- ✅ Seleção e salvamento de mensagens do WhatsApp
- ✅ Botão WhatsApp na página de detalhes da negociação
- ✅ Detecção automática do número de telefone
- ✅ Acesso direto ao Firestore (sem necessidade de Firebase Functions)

## Licença

Proprietário - Adventure Labs

