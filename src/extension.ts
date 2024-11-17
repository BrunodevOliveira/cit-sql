import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.executeSqlQuery', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection).replace(/\r\n|\r|\n/g, ' ');

        if (!text) {
            vscode.window.showErrorMessage('No text selected');
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
            vscode.window.showErrorMessage('Endpoint or token not provided and not found in storage');
            return;
        }

        try {
            const response = await axios.post(finalEndpoint!, { sql: query }, { headers: { 'Authorization': `Bearer ${finalToken}` } });
            const data = response.data.retorno;

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format');
            }
            

            const tabelaHtml = criarTabela(data, finalEndpoint);
            criarWebview(context, tabelaHtml);
        } catch (error) {
            vscode.window.showErrorMessage(`Error executing query: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

function extrairEndpointTokenQuery(text: string): { endpoint?: string; token?: string; query: string } {
    const endpointMatch = text.match(/--endpoint:\s*(https?:\/\/[^\s]+)/);
    const tokenMatch = text.match(/--token:\s*([^\s]+)/);

    const endpoint = endpointMatch ? endpointMatch[1] : undefined;
    const token = tokenMatch ? tokenMatch[1] : undefined;
    
    let query = text;
    if (endpointMatch) {
        query = query.replace(endpointMatch[0], '');
    }
    if (tokenMatch) {
        query = query.replace(tokenMatch[0], '');
    }
    query = query.trim();

    return { endpoint, token, query };
}

//Tabela antiga
function criarTabela(data: any[], endpoint: string): string {
    if (data.length === 0) return '<h2>Sem registros</h2>';

    // Extrair todos os cabeçalhos únicos dos objetos
    const headers = [...new Set(data.flatMap(Object.keys))];

    // Criar o HTML completo com CSS embutido
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resultado da Consulta</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #1e1e1e;
                    color: #ffffff;
                }

                h2 {
                    color: #ffffff;
                }

                .container {
                    margin: 20px 0;
                }

                .tabela-estilizada {
                    overflow-x: auto;
                    overflow-y: auto;
                    max-width: 100%;
                    max-height: 500px;
                    background-color: #3a3a3f;
                    color: #FFFFFF;
                    width: 100%;
                    border-collapse: collapse;
                    border-spacing: 10px;
                }

                .tabela-estilizada th, 
                .tabela-estilizada td {
                    background-color: #3a3a3f;
                    color: #FFFFFF;
                    border: 1px solid #FFF;
                    padding: 10px;
                    text-align: left;
                }

                .tabela-estilizada thead {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .tabela-estilizada th {
                    background-color: #2d2d30;
                }

                .info {
                    color: #cccccc;
                    font-size: 0.9em;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <h2>Resultado da Consulta</h2>
            <div class="info">API: ${endpoint}</div>
            <div class="info">Data da execução: ${new Date().toLocaleString()}</div>
            <div class="container">
                <table class="tabela-estilizada">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    return html;
}

// Adicione esta função para criar e mostrar o webview
function criarWebview(context: vscode.ExtensionContext, htmlContent: string) {
    // Criar e mostrar o painel webview
    const panel = vscode.window.createWebviewPanel(
        'sqlResults', // Identificador único
        'Resultado da Consulta SQL', // Título mostrado ao usuário
        vscode.ViewColumn.One, // Coluna onde será aberto
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    // Definir o conteúdo HTML do webview
    panel.webview.html = htmlContent;
}

export function deactivate() {}