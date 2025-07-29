# Cit-sql - Documentação

## Sumário
- [Visão Geral](#visão-geral)
- [Configuração Inicial](#configuração-inicial)
- [Como Usar](#como-usar)
- [Referência de Comandos](#referência-de-comandos)
- [Resolução de Problemas](#resolução-de-problemas)

## Visão Geral

A extensão Cit-sql permite executar consultas SQL diretamente no VSCode de forma prática. Ela gerencia múltiplos ambientes de banco de dados, enviando as requisições para o endpoint ativo e exibindo os resultados em uma nova aba.

## Configuração Inicial

Para começar, você precisa cadastrar os ambientes com os quais deseja trabalhar. Um ambiente consiste em um nome, um endpoint de API e um token de autenticação.

### Cadastrando um Novo Ambiente

1.  Abra a visão da extensão **CIT-SQL** na barra de atividades do VSCode (o ícone com a logo do CitSmart).
2.  Clique no botão **"Novo"**.
3.  Um formulário será exibido. Preencha os campos:
    - **Nome do Ambiente:** Um nome para identificar a conexão (ex: `TRT-23-DEV`, `PROD-Analytics`).
    - **Endpoint:** A URL completa da API para onde a consulta será enviada.
    - **Token:** O token (geralmente JWT) necessário para autenticar na API.
4.  Clique em **"Salvar Ambiente"**.

O ambiente agora aparecerá na lista de seleção. Você pode cadastrar quantos ambientes precisar.

### Editando ou Excluindo um Ambiente

1.  Selecione o ambiente desejado na lista.
2.  Clique no botão **"Editar"**.
3.  O mesmo formulário aparecerá com os dados preenchidos, permitindo que você os altere.
4.  Para excluir, clique no botão **"Excluir"** dentro do formulário de edição.

## Como Usar

Para executar uma consulta, primeiro certifique-se de que você está conectado ao ambiente correto.

1.  Na visão da extensão, selecione o ambiente desejado na lista suspensa.
2.  Clique no botão **"Conectar"**. A seção "Ambiente conectado" aparecerá, confirmando a conexão ativa.
3.  Abra qualquer arquivo e escreva sua consulta SQL.
4.  Selecione todo o texto da consulta que deseja executar.
5.  Clique com o botão direito do mouse sobre a seleção.
6.  No menu de contexto, escolha a opção **"Cit SQL execute"**.

A consulta será enviada para o endpoint do ambiente conectado e o resultado será exibido em uma nova aba.

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
| Cit SQL execute | Menu de contexto (botão direito) | Executa a consulta SQL selecionada usando as credenciais do ambiente ativo. |

## Resolução de Problemas

### Mensagens de Erro Comuns

1. **"Nenhum texto ativo no editor"**
   - **Solução:** Certifique-se de ter um editor de texto aberto e ativo.

2. **"Nenhuma consulta selecionada"**
   - **Solução:** Selecione o texto da consulta antes de executar.

3. **"Endpoint ou token não fornecidos"**
   - **Solução:** Você tentou executar uma consulta sem antes se conectar a um ambiente. Vá para a visão da extensão, selecione um ambiente e clique em "Conectar".

4. **"Error ao realizar a consulta"**
   - Verifique se o endpoint do ambiente conectado está acessível.
   - Confirme se o token do ambiente ainda é válido.
   - Verifique a sintaxe da sua consulta SQL.

### Dicas

1.  Mantenha seus tokens seguros e não os compartilhe.
2.  Use `LIMIT` em suas consultas para evitar que grandes volumes de dados sobrecarreguem o VSCode.
3.  Para trocar de ambiente, basta selecionar outro na lista e clicar em "Conectar". A nova conexão sobrescreverá a anterior.

### Gerar arquivo de instalação
- `npm install -g vsce`
- `vsce package`
- Clicar com botão direito no arquivo `cit-sql-0.0.2.vsix` -> Instalar a extensão VSIX
