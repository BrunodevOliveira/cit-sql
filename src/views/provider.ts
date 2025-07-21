
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
                case 'getEnvironments': {
                    const environments = this._context.globalState.get<any[]>('environments') || [];
                    webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments });
                    return;
                }
                case 'getEnvironment': {
                    const environments = this._context.globalState.get<any[]>('environments') || [];
                    const env = environments.find(e => e.name === message.envName);
                    if (env) {
                        webviewView.webview.postMessage({ command: 'loadEnvironment', env: env });
                    }
                    return;
                }
                case 'saveEnvironment': {
                    let environments = this._context.globalState.get<any[]>('environments') || [];
                    if (message.originalEnvName && message.originalEnvName !== message.env.name) {
                        const index = environments.findIndex(e => e.name === message.originalEnvName);
                        if (index !== -1) {
                            environments.splice(index, 1);
                        }
                    }
                    const existingEnvIndex = environments.findIndex(e => e.name === message.env.name);
                    if (existingEnvIndex > -1) {
                        environments[existingEnvIndex] = message.env;
                    } else {
                        environments.push(message.env);
                    }
                    this._context.globalState.update('environments', environments);
                    webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments });
                    webviewView.webview.postMessage({ command: 'clearForm' });
                    vscode.window.showInformationMessage('Ambiente salvo com sucesso!');
                    return;
                }
                case 'deleteEnvironment': {
                    let environments = this._context.globalState.get<any[]>('environments') || [];
                    const index = environments.findIndex(e => e.name === message.envName);
                    if (index !== -1) {
                        environments.splice(index, 1);
                        this._context.globalState.update('environments', environments);
                        webviewView.webview.postMessage({ command: 'loadEnvironments', envs: environments });
                        webviewView.webview.postMessage({ command: 'clearForm' });
                        vscode.window.showInformationMessage('Ambiente excluído com sucesso!');
                    }
                    return;
                }
                case 'connectToEnvironment': {
                    const environments = this._context.globalState.get<any[]>('environments') || [];
                    const selectedEnv = environments.find(env => env.name === message.envName);
                    if (selectedEnv) {
                        this._context.globalState.update('sqlQueryExecutor.endpoint', selectedEnv.endpoint);
                        this._context.globalState.update('sqlQueryExecutor.token', selectedEnv.token);
                        webviewView.webview.postMessage({ command: 'showSelectedEnv', env: selectedEnv });
                        vscode.window.showInformationMessage(`Conectado ao ambiente: ${selectedEnv.name}`);
                    }
                    return;
                }
            }
        });
    }
}
