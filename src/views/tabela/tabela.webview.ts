
import * as vscode from 'vscode';

export default function criarTabela(data: any[], envName: string, webview: vscode.Webview, context: vscode.ExtensionContext): string {
    if (data.length === 0) {
        return '<h2>Sem registros</h2>';
    }

    const headers = [...new Set(data.flatMap(Object.keys))];

    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'views', 'tabela', 'style.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'views', 'tabela', 'script.js'));

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Gestão - Tabela Moderna</title>
        <link rel="stylesheet" type="text/css" href="${styleUri}">
    </head>
    <body>
    <button id="theme-toggle" class="theme-toggle-btn">
    <svg id="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- O ícone será definido pelo script -->
    </svg>
    </button>
    <div class="container">
    
    <div class="card card-header">
                <div class="card-content">
                    <div class="card-title">
                        <div>
                            <p><strong>Ambiente:</strong> ${envName}</p>
                            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString()}</p>
                            <p id="recordCount">0 de 0 registros</p>
                        </div>
                    </div>
                    
                    <div class="controls">
                        <div class="search-container">
                            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path>
                            </svg>
                            <input type="text" id="searchInput" class="search-input" placeholder="Buscar nos campos...">
                        </div>
                        <button id="exportBtn" class="export-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path>
                            </svg>
                            Exportar CSV
                        </button>
                    </div>
                </div>
            </div>
    
            <div class="card table-card">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                ${headers.map(header => `
                                <th data-field="${header}">
                                    <div class="sort-header">
                                        ${header}
                                        <svg class="sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4"></path>
                                        </svg>
                                    </div>
                                </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Dados serão inseridos aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
    
            <div id="footerInfo" class="footer-info"></div>
        </div>
      
        <script id="viewData" type="application/json">
            ${JSON.stringify({ data: data, headers: headers })}
        </script>
        <script>
            const vscode = acquireVsCodeApi();
            const { data, headers } = JSON.parse(document.getElementById('viewData').textContent);
            let currentData = data;
            let filteredData = data;
        </script>
        <script src="${scriptUri}"></script>
    </body>
    </html>
    `;

    return html;
}
