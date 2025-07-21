
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
    </head>
    <body>
        <div class="tab">
            <button class="tablinks" onclick="openTab(event, 'Register')">Cadastro de Ambiente</button>
            <button class="tablinks" onclick="openTab(event, 'Select')">Seleção de Ambiente</button>
        </div>

        <div id="Register" class="tabcontent">
            <h3>Cadastro de Ambiente</h3>
            <form id="registerForm">
                <label for="envName">Nome do Ambiente</label>
                <input type="text" id="envName" name="envName" required>

                <label for="endpoint">Endpoint</label>
                <input type="text" id="endpoint" name="endpoint" required>

                <label for="token">Token</label>
                <input type="text" id="token" name="token" required>

                <button type="submit">Salvar</button>
            </form>
        </div>

        <div id="Select" class="tabcontent">
            <h3>Seleção de Ambiente</h3>
            <form id="selectForm">
                <label for="envSelect">Selecione o Ambiente</label>
                <select id="envSelect" name="envSelect"></select>
                <button type="button" id="connectBtn">Conectar</button>
                <button type="button" id="editBtn">Editar</button>
            </form>
        </div>

        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}
