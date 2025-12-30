# 🐛 Bugs Detectados - Adventure CRM

Este arquivo documenta os bugs detectados no sistema para serem resolvidos em conjunto.

---

## 📋 Lista de Bugs

### 1. Select - Texto fica branco/invisível após perder foco

**Descrição:**
Quando o usuário seleciona uma opção em um menu suspenso (select) e depois move o cursor para outro campo (saí do select), o texto do select anterior fica branco/invisível. O texto da opção selecionada não é mais visível.

**Contexto:**
- Acontece em todos os menus suspensos da aplicação
- Ocorre após o select perder o foco (blur)
- O texto da opção selecionada fica com a mesma cor do fundo, tornando-se invisível

**Passos para reproduzir:**
1. Abrir a página com formulários contendo selects (ex: MarketingInterestForm)
2. Clicar em um select e selecionar uma opção (ex: "CEO / Diretor")
3. Mover o cursor para fora do select (clicar em outro campo ou mover o mouse)
4. Observar que o texto do select anterior ficou branco/invisível

**Severidade:** Alta - Afeta usabilidade do formulário

**Status:** 🔴 Pendente

---

## 📝 Notas

- Adicionar novos bugs abaixo desta linha
- Manter formato consistente
- Usar emojis para facilitar identificação visual
- Atualizar status quando bug for resolvido

---

