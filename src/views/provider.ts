
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

        webviewView.webview.onDidReceiveMessage(async message => {
            const key = (name: string) => `cit-sql.env.${name}`;

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
                        let token = await this._context.secrets.get(key(env.name));
                        if (!token && env.token) { // Migração implícita
                            token = env.token;
                            await this._context.secrets.store(key(env.name), token!);
                        }
                        webviewView.webview.postMessage({ command: 'loadEnvironment', env: { ...env, token } });
                    }
                    return;
                }
                case 'showEnvironment': {
                    const environments = this._context.globalState.get<any[]>('environments') || [];
                    const env = environments.find(e => e.name === message.envName);
                    if (env) {
                        webviewView.webview.postMessage({ command: 'showSelectedEnv', env: env });
                    }
                    return;
                }
                case 'saveEnvironment': {
                    let environments = this._context.globalState.get<any[]>('environments') || [];
                    const { token, ...envData } = message.env;

                    if (message.originalEnvName && message.originalEnvName !== envData.name) {
                        const index = environments.findIndex(e => e.name === message.originalEnvName);
                        if (index !== -1) {
                            environments.splice(index, 1);
                            await this._context.secrets.delete(key(message.originalEnvName));
                        }
                    }

                    await this._context.secrets.store(key(envData.name), token);

                    const existingEnvIndex = environments.findIndex(e => e.name === envData.name);
                    if (existingEnvIndex > -1) {
                        environments[existingEnvIndex] = envData;
                    } else {
                        environments.push(envData);
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
                        await this._context.secrets.delete(key(message.envName));
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
                        // Migração de token legado para o SecretStorage
                        if (selectedEnv.token) {
                            await this._context.secrets.store(key(selectedEnv.name), selectedEnv.token);
                            delete selectedEnv.token; // Remove o token do objeto em memória
                            this._context.globalState.update('environments', environments); // Atualiza a lista sem o token
                        }

                        this._context.globalState.update('sqlQueryExecutor.endpoint', selectedEnv.endpoint);
                        this._context.globalState.update('connectedEnvironment', { name: selectedEnv.name, endpoint: selectedEnv.endpoint });
                        webviewView.webview.postMessage({ command: 'connectionSuccess', env: selectedEnv });
                        vscode.window.showInformationMessage(`Conectado ao ambiente: ${selectedEnv.name}`);
                    }
                    return;
                }
                case 'getConnectionStatus': {
                    const connectedEnv = this._context.globalState.get<any>('connectedEnvironment');
                    if (connectedEnv) {
                        webviewView.webview.postMessage({ command: 'connectionSuccess', env: connectedEnv });
                    }
                    return;
                }
            }
        });
    }
}
