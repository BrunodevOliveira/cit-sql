import axios from "axios";
import * as vscode from "vscode";
import extrairEndpointTokenQuery from "./utils/extrairEndpointTokenQuery";
import { CitSqlViewProvider } from "./views/provider";
import criarTabela from "./views/tabela/tabela.webview";

export function activate(context: vscode.ExtensionContext) {
  const provider = new CitSqlViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CitSqlViewProvider.viewType,
      provider
    )
  );

  let disposable = vscode.commands.registerCommand(
    "extension.executeSqlQuery",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Nenhum texto ativo no editor");
        return;
      }

      const selection = editor.selection;
      const text = editor.document
        .getText(selection)
        .replace(/\r\n|\r|\n/g, " ");

      if (!text) {
        vscode.window.showErrorMessage("Nenhuma consulta selecionada");
        return;
      }

      const { endpoint, token, query } = extrairEndpointTokenQuery(text);

      if (endpoint) {
        context.globalState.update("sqlQueryExecutor.endpoint", endpoint);
      }

      const storedEndpoint = context.globalState.get(
        "sqlQueryExecutor.endpoint"
      ) as string;
      const finalEndpoint = endpoint || storedEndpoint;

      let finalToken: string | undefined = token;

      let envName = "Endpoint direto";
      if (!finalToken) {
        const connectedEnv = context.globalState.get<{ name: string }>(
          "connectedEnvironment"
        );
        if (connectedEnv) {
          envName = connectedEnv.name;
          const key = `cit-sql.env.${connectedEnv.name}`;
          finalToken = await context.secrets.get(key);
        }
      }

      if (!finalEndpoint || !finalToken) {
        vscode.window.showErrorMessage("Endpoint ou token não fornecidos");
        return;
      }

      const cancelTokenSource = axios.CancelToken.source();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Executando consulta SQL",
          cancellable: true,
        },
        async (progress, cancellationToken) => {
          // Atualizar progresso inicial
          progress.report({
            increment: 0,
            message: `Conectando em ${envName}...`,
          });

          // Configurar handler para cancelamento do VSCode
          cancellationToken.onCancellationRequested(() => {
            cancelTokenSource.cancel("Consulta cancelada pelo usuário");
          });

          // Simular progresso
          const progressInterval = setInterval(() => {
            progress.report({
              increment: 5,
              message: "Aguardando resposta do servidor...",
            });
          }, 500);

          try {
            // Fazer requisição com cancelToken
            const response = await axios.post(
              finalEndpoint!,
              { sql: query },
              {
                headers: { Authorization: `Bearer ${finalToken}` },
                cancelToken: cancelTokenSource.token,
                timeout: 600000, // 10 minutos de timeout como fallback
              }
            );

            clearInterval(progressInterval);

            const data = response.data.retorno;

            if (!Array.isArray(data)) {
              throw new Error("Formato dos dados retornados inválidos");
            }

            // Atualizar progresso final
            progress.report({
              increment: 100,
              message: `Consulta concluída! ${data.length} registros retornados.`,
            });

            // Aguardar um pouco para o usuário ver a mensagem de sucesso
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Criar painel com os resultados
            const panel = vscode.window.createWebviewPanel(
              "sqlResults",
              "Resultado da Consulta SQL",
              vscode.ViewColumn.One,
              {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableFindWidget: true,
              }
            );

            panel.iconPath = vscode.Uri.joinPath(
              context.extensionUri,
              "out",
              "assets",
              "database.png"
            );

            panel.webview.onDidReceiveMessage(
              async (message: { command: string; payload: string }) => {
                switch (message.command) {
                  case "exportToCsv":
                    const uri = await vscode.window.showSaveDialog({
                      filters: {
                        CSV: ["csv"],
                      },
                    });

                    if (uri) {
                      const buffer = Buffer.from(message.payload, "utf8");
                      const uint8Array = new Uint8Array(buffer);
                      await vscode.workspace.fs.writeFile(uri, uint8Array);
                      vscode.window.showInformationMessage(
                        "Arquivo CSV salvo com sucesso!"
                      );
                    }
                    return;
                }
              },
              undefined,
              context.subscriptions
            );

            panel.webview.html = criarTabela(
              data,
              envName,
              panel.webview,
              context
            );
          } catch (error: any) {
            clearInterval(progressInterval);

            // Verificar se foi cancelamento
            if (axios.isCancel(error)) {
              vscode.window.showWarningMessage(
                "Consulta SQL cancelada pelo usuário"
              );
              return;
            }

            // Verificar timeout
            if (error.code === "ECONNABORTED") {
              vscode.window.showErrorMessage(
                "Tempo limite de execução excedido (5 minutos). A consulta pode estar muito pesada."
              );
              return;
            }

            // Outros erros
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Erro desconhecido";
            vscode.window.showErrorMessage(
              `Erro ao realizar a consulta: ${errorMessage}`
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
