# Pre-Commit Validation

Este projeto está configurado para validar o código antes de cada commit.

## Scripts Disponíveis

### type-check
Verifica erros de TypeScript sem gerar arquivos:
```bash
npm run type-check
```

### lint
Verifica problemas de linting com ESLint:
```bash
npm run lint
```

### validate
Executa type-check e lint em sequência:
```bash
npm run validate
```

## Git Hook Pre-Commit

Um git hook foi configurado em `.git/hooks/pre-commit` para executar validações automaticamente antes de cada commit.

**Se o hook não estiver funcionando:**
1. Certifique-se de que o arquivo tem permissão de execução:
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

2. Execute manualmente antes do commit:
   ```bash
   npm run validate
   ```

## Recomendações

- Sempre execute `npm run validate` antes de fazer commit
- Se encontrar erros, corrija-os antes de fazer commit
- O build no Vercel executará essas mesmas validações

## Prática Recomendada

Para evitar erros de TypeScript com parâmetros não usados:

1. Use prefixo underscore `_` para parâmetros não utilizados:
   ```typescript
   const handleClick = (_event: MouseEvent) => {
     // _event não é usado, mas é necessário para a assinatura
   }
   ```

2. Ou remova o parâmetro se não for necessário:
   ```typescript
   const handleClick = () => {
     // sem parâmetros
   }
   ```



