
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
        <details open>
            <summary>Seleção de Ambiente</summary>
            <form id="selectForm">
                <label for="envSelect">Selecione o Ambiente</label>
                <select id="envSelect" name="envSelect"></select>
                <button type="button" id="connectBtn">Conectar</button>
                <button type="button" id="editBtn">Editar</button>
            </form>
        </details>

        <details>
            <summary>Cadastro de Ambiente</summary>
            <form id="registerForm">
                <label for="envName">Nome do Ambiente</label>
                <input type="text" id="envName" name="envName" required>

                <label for="endpoint">Endpoint</label>
                <input type="text" id="endpoint" name="endpoint" required>

                <label for="token">Token</label>
                <input type="text" id="token" name="token" required>

                <button type="submit">Salvar</button>
            </form>
        </details>

        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}
