# Cit-sql - Documentação

## Sumário
- [Visão Geral](#visão-geral)
<!-- - [Instalação](#instalação) -->
- [Configuração Inicial](#configuração-inicial)
- [Como Usar](#como-usar)
- [Exemplos](#exemplos)
- [Referência de Comandos](#referência-de-comandos)
- [Resolução de Problemas](#resolução-de-problemas)

## Visão Geral

A extensão Cit-sql permite executar consultas SQL diretamente no VSCode, enviando as requisições para um endpoint específico e exibindo os resultados em uma tabela.

<!-- ## Instalação

1. Abra o VSCode
2. Pressione `Ctrl+Shift+X` (Windows/Linux) ou `Cmd+Shift+X` (Mac) para abrir o painel de extensões
3. Pesquise por "Cit-sql"
4. Clique em "Instalar" -->

## Configuração Inicial

Na primeira execução, você precisará configurar dois parâmetros obrigatórios:

1. Endpoint da API
2. Token JWT para autenticação

Estes parâmetros podem ser configurados diretamente no arquivo de consulta usando as seguintes diretivas:

```sql
--endpoint: https://seu-endpoint.com/api
--token: seu-token-jwt-aqui
```

**Nota**: Após a primeira configuração, estes valores são armazenados e não precisam ser informados novamente nas próximas consultas.

## Como Usar

1. Abra um novo arquivo no VSCode
2. Digite sua consulta SQL, incluindo as diretivas de configuração se necessário
3. Selecione todo o texto da consulta
4. Clique com o botão direito do mouse
5. Selecione "Cit SQL execute"

### Exemplo de Consulta Completa

```sql
--endpoint: https://centraldeservicos-dev.trt23.jus.br/lowcode/esi/execute/select_apps
--token: seu-token-jwt-aqui
SELECT * FROM itsm.empregados LIMIT 100
```

### Consultas Subsequentes

Após a primeira execução, você pode executar consultas mais simples, pois o endpoint e token já estarão armazenados:

```sql
SELECT nome, matricula FROM itsm.empregados WHERE ativo = true
```

## Visualização dos Resultados

Os resultados da consulta são exibidos em:
- Uma nova aba no VSCode
- Formato de tabela Markdown
- Com cabeçalho contendo o endpoint utilizado
- Data e hora da execução
- Dados organizados em colunas alinhadas

## Referência de Comandos

| Comando | Atalho | Descrição |
|---------|---------|-----------|
| Cit SQL execute | Menu de contexto (botão direito) | Executa a consulta SQL selecionada |

## Resolução de Problemas

### Mensagens de Erro Comuns

1. "No active text editor"
   - Solução: Certifique-se de ter um editor de texto aberto e ativo

2. "No text selected"
   - Solução: Selecione o texto da consulta antes de executar

3. "Endpoint or token not provided and not found in storage"
   - Solução: Configure o endpoint e token usando as diretivas --endpoint e --token

4. "Error executing query"
   - Verifique se o endpoint está acessível
   - Confirme se o token JWT é válido
   - Verifique a sintaxe da consulta SQL

### Alterando Configurações

Para alterar o endpoint ou token já configurados, basta incluir as diretivas novamente em qualquer consulta:

```sql
--endpoint: https://novo-endpoint.com/api
--token: novo-token-jwt
SELECT * FROM tabela
```

### Dicas

1. Mantenha seus tokens JWT seguros e não os compartilhe
2. Use LIMIT em suas consultas para evitar conjuntos de dados muito grandes
3. Verifique a formatação da consulta antes de executar
4. Certifique-se de que todas as diretivas estejam em linhas separadas

### Gerar aquivo de instalação 
- npm install -g vsce
- vsce package
- Clicar com botão direito no arquivo cit-sql-0.0.1.vsix -> Instalar a extensão VSIX