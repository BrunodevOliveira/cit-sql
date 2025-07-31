import axios from 'axios';
import * as vscode from 'vscode';
import extrairEndpointTokenQuery from './utils/extrairEndpointTokenQuery';
import { CitSqlViewProvider } from './views/provider';
import criarTabela from './views/tabela/tabela.webview';

export function activate(context: vscode.ExtensionContext) {
    const provider = new CitSqlViewProvider(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CitSqlViewProvider.viewType, provider));

    let disposable = vscode.commands.registerCommand('extension.executeSqlQuery', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum texto ativo no editor');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection).replace(/\r\n|\r|\n/g, ' ');

        if (!text) {
            vscode.window.showErrorMessage('Nenhuma consulta selecionada');
            return;
        }

        const { endpoint, token, query } = extrairEndpointTokenQuery(text);

        if (endpoint) {
            context.globalState.update('sqlQueryExecutor.endpoint', endpoint);
        }

        const storedEndpoint = context.globalState.get('sqlQueryExecutor.endpoint') as string;
        const finalEndpoint = endpoint || storedEndpoint;

        let finalToken: string | undefined = token;

        let envName = "Endpoint direto";
        if (!finalToken) {
            const connectedEnv = context.globalState.get<{ name: string }>('connectedEnvironment');
            if (connectedEnv) {
                envName = connectedEnv.name;
                const key = `cit-sql.env.${connectedEnv.name}`;
                finalToken = await context.secrets.get(key);
            }
        }

        if (!finalEndpoint || !finalToken) {
            vscode.window.showErrorMessage('Endpoint ou token não fornecidos');
            return;
        }

        try {
            const response = await axios.post(finalEndpoint!, { sql: query }, { headers: { 'Authorization': `Bearer ${finalToken}` } });
            const data = response.data.retorno;

            if (!Array.isArray(data)) {
                throw new Error('Formato dos dados retornados inválidos');
            }


            const panel = vscode.window.createWebviewPanel(
                'sqlResults', 
                'Resultado da Consulta SQL', 
                vscode.ViewColumn.One, 
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    enableFindWidget: true,
                }
            );

            panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'assets', 'database.png');

            panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'exportToCsv':
                            const uri = await vscode.window.showSaveDialog({
                                filters: {
                                    'CSV': ['csv']
                                }
                            });

                            if (uri) {
                                vscode.workspace.fs.writeFile(uri, Buffer.from(message.payload, 'utf8'));
                                vscode.window.showInformationMessage('Arquivo CSV salvo com sucesso!');
                            }
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );

            panel.webview.html = criarTabela(data, envName, panel.webview, context);
        } catch (error:any) {

            vscode.window.showErrorMessage(`Error ao realizar a consulta: ${error.response.data.message || error}`);
        }
    });

    context.subscriptions.push(disposable);
}



export function deactivate() {}