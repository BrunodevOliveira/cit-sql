
import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'main.css'));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CIT-SQL</title>
        <link rel="stylesheet" type="text/css" href="${styleUri}">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    </head>
    <body>
        <div class="container">
            <div class="section">
               
                <label for="envSelect">Selecione o Ambiente</label>
                <select id="envSelect" name="envSelect"></select>
                <div class="button-group">
                    <button id="connectBtn"><i class="material-symbols-outlined">power</i> Conectar</button>
                    <button id="editBtn"><i class="material-symbols-outlined">edit</i> Editar</button>
                    <button id="newBtn"><i class="material-symbols-outlined">add</i> Novo</button>
                </div>
            </div>

            <div id="selectedEnvSection" class="section" style="display: none;">
                <h2><i class="codicon codicon-check"></i> Ambiente Selecionado</h2>
                <div class="env-details">
                    <div>
                        <strong>Nome:</strong>
                        <span id="selectedEnvName"></span>
                    </div>
                    <div>
                        <strong>Endpoint:</strong>
                        <span id="selectedEnvEndpoint"></span>
                    </div>
                </div>
            </div>

            <div id="formSection" class="section" style="display: none;">
                <h2 id="formTitle"></h2>
                <form id="envForm">
                    <input type="hidden" id="originalEnvName" name="originalEnvName">
                    <label for="envName">Nome do Ambiente</label>
                    <input type="text" id="envName" name="envName" placeholder="Ex: TRT-23-DEV" required>

                    <label for="endpoint">Endpoint</label>
                    <input type="text" id="endpoint" name="endpoint" placeholder="https://api.example.com" required>

                    <label for="token">Token</label>
                    <input type="password" id="token" name="token" required>

                    <div class="form-buttons">
                        <button type="submit"><i class="codicon codicon-save"></i> Salvar Ambiente</button>
                        <button type="button" id="cancelBtn">Cancelar</button>
                        <button type="button" id="deleteBtn" class="delete-btn"><i class="codicon codicon-trash"></i> Excluir</button>
                    </div>
                </form>
            </div>
        </div>
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}
