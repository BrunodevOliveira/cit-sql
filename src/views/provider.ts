
import * as vscode from 'vscode';
import { getWebviewContent } from './main.webview';

export class CitSqlViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'cit-sql-view';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _context: vscode.ExtensionContext,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };

        webviewView.webview.html = getWebviewContent(webviewView.webview, this._context);

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'getEnvironments':
                    const environments = this._context.globalState.get<any[]>('environments') || [];
                    webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments });
                    return;
                case 'saveEnvironment':
                    let environments_save = this._context.globalState.get<any[]>('environments') || [];
                    const existingEnvIndex = environments_save.findIndex(env => env.name === message.env.name);
                    if (existingEnvIndex > -1) {
                        environments_save[existingEnvIndex] = message.env;
                    } else {
                        environments_save.push(message.env);
                    }
                    this._context.globalState.update('environments', environments_save);
                    webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments_save });
                    vscode.window.showInformationMessage('Ambiente salvo com sucesso!');
                    return;
                case 'connectToEnvironment':
                    const envs_connect = this._context.globalState.get<any[]>('environments') || [];
                    const selectedEnv = envs_connect.find(env => env.name === message.envName);
                    if (selectedEnv) {
                        this._context.globalState.update('sqlQueryExecutor.endpoint', selectedEnv.endpoint);
                        this._context.globalState.update('sqlQueryExecutor.token', selectedEnv.token);
                        vscode.window.showInformationMessage(`Conectado ao ambiente: ${selectedEnv.name}`);
                    }
                    return;
                case 'editEnvironment':
                    // Lógica para editar o ambiente
                    return;
            }
        });

        const environments = this._context.globalState.get<any[]>('environments') || [];
        webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments });
    }
}
