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

## Licença

Proprietário - Adventure Labs

