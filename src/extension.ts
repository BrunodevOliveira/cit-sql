import axios from 'axios';
import * as vscode from 'vscode';
import extrairEndpointTokenQuery from './utils/extrairEndpointTokenQuery';
import { CitSqlViewProvider } from './views/provider';
import criarTabela from './views/tabela.webview';

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
        } catch (error:any) {

            vscode.window.showErrorMessage(`Error ao realizar a consulta: ${error.response.data.message || error}`);
        }
    });

    context.subscriptions.push(disposable);
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