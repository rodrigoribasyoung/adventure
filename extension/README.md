# Adventure CRM - Extensão WhatsApp

Extensão do Chrome para integrar o Adventure CRM com WhatsApp Web.

## Instalação

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `extension/` deste projeto
5. A extensão será instalada

## Configuração

1. Faça login no Adventure CRM (aplicação web)
2. Abra o console do navegador (F12)
3. Execute o seguinte código para obter seu token Firebase:

```javascript
firebase.auth().currentUser.getIdToken().then(token => {
  console.log('Token:', token);
  navigator.clipboard.writeText(token);
  console.log('Token copiado para a área de transferência!');
});
```

4. Clique no ícone da extensão no Chrome
5. Cole o token no campo "Token Firebase"
6. Opcionalmente, informe seu User ID
7. Clique em "Salvar Configuração"

## Uso

1. Abra o WhatsApp Web (web.whatsapp.com)
2. Clique no botão flutuante à direita da tela para abrir a sidebar
3. A sidebar detectará automaticamente o número da conversa atual
4. Use os botões para:
   - Criar ou vincular contato
   - Criar ou vincular negociação
   - Selecionar e salvar mensagens

## Funcionalidades

- **Detecção automática de número**: A sidebar detecta o número da conversa atual
- **Criar/Vincular Contato**: Cria um novo contato ou vincula a um existente
- **Criar/Vincular Negociação**: Cria uma nova negociação ou vincula a uma existente
- **Salvar Mensagens**: Selecione mensagens e salve-as no banco de dados vinculadas à negociação

## Notas

- A extensão requer um funil ativo no CRM para criar negociações
- As mensagens são salvas vinculadas à negociação (se houver)
- O token Firebase expira periodicamente - você precisará atualizá-lo

