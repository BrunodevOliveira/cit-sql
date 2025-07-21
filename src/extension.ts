import * as vscode from 'vscode';
import axios from 'axios';
import criarTabela from './views/tabela.webview';
import extrairEndpointTokenQuery from './utils/extrairEndpointTokenQuery';
import { getWebviewContent } from './views/main.webview';

export function activate(context: vscode.ExtensionContext) {
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
        if (token) {
            context.globalState.update('sqlQueryExecutor.token', token);
        }

        const storedEndpoint = context.globalState.get('sqlQueryExecutor.endpoint') as string;
        const storedToken = context.globalState.get('sqlQueryExecutor.token') as string;

        const finalEndpoint = endpoint || storedEndpoint;
        const finalToken = token || storedToken;

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


            const tabelaHtml = criarTabela(data, finalEndpoint);
            criarWebview(context, tabelaHtml);
        } catch (error) {
            vscode.window.showErrorMessage(`Error ao realizar a consulta: ${error}`);
        }
    });

    let menuCommand = vscode.commands.registerCommand('extension.openMenu', () => {
        const panel = vscode.window.createWebviewPanel(
            'citSqlMenu',
            'CIT-SQL Menu',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent(panel.webview, context);

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'saveEnvironment':
                        let environments = context.globalState.get<any[]>('environments') || [];
                        const existingEnvIndex = environments.findIndex(env => env.name === message.env.name);
                        if (existingEnvIndex > -1) {
                            environments[existingEnvIndex] = message.env;
                        } else {
                            environments.push(message.env);
                        }
                        context.globalState.update('environments', environments);
                        panel.webview.postMessage({ command: 'loadEnvironments', envs: environments });
                        vscode.window.showInformationMessage('Ambiente salvo com sucesso!');
                        return;
                    case 'connectToEnvironment':
                        const envs = context.globalState.get<any[]>('environments') || [];
                        const selectedEnv = envs.find(env => env.name === message.envName);
                        if (selectedEnv) {
                            context.globalState.update('sqlQueryExecutor.endpoint', selectedEnv.endpoint);
                            context.globalState.update('sqlQueryExecutor.token', selectedEnv.token);
                            vscode.window.showInformationMessage(`Conectado ao ambiente: ${selectedEnv.name}`);
                        }
                        return;
                    case 'editEnvironment':
                        // Lógica para editar o ambiente
                        return;
                }
            },
            undefined,
            context.subscriptions
        );

        const environments = context.globalState.get<any[]>('environments') || [];
        panel.webview.postMessage({ command: 'loadEnvironments', envs: environments });
    });

    context.subscriptions.push(disposable, menuCommand);
}

function criarWebview(context: vscode.ExtensionContext, htmlContent: string) {
    // Criar e mostrar o painel webview
    const panel = vscode.window.createWebviewPanel(
        'sqlResults', // Identificador único
        'Resultado da Consulta SQL', // Título mostrado ao usuário
        vscode.ViewColumn.One, // Coluna onde será aberto
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
        }
    );

    // Definir o conteúdo HTML do webview
    panel.webview.html = htmlContent;
}

export function deactivate() {}