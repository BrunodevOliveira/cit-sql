
(function() {
    const vscode = acquireVsCodeApi();

    function getEnvs(){
        vscode.postMessage({
            command: 'getEnvironments'
        });
    }

    getEnvs();

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const envName = form.elements.envName.value;
        const endpoint = form.elements.endpoint.value;
        const token = form.elements.token.value;
        vscode.postMessage({
            command: 'saveEnvironment',
            env: { name: envName, endpoint: endpoint, token: token }
        });
        form.reset();
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'loadEnvironments':
                const select = document.getElementById('envSelect');
                select.innerHTML = '';
                message.envs.forEach(env => {
                    const option = document.createElement('option');
                    option.value = env.name;
                    option.textContent = env.name;
                    select.appendChild(option);
                });
                break;
        }
    });

    document.getElementById('connectBtn').addEventListener('click', () => {
        const selectedEnv = document.getElementById('envSelect').value;
        vscode.postMessage({
            command: 'connectToEnvironment',
            envName: selectedEnv
        });
    });

    document.getElementById('editBtn').addEventListener('click', () => {
        const selectedEnv = document.getElementById('envSelect').value;
        vscode.postMessage({
            command: 'editEnvironment',
            envName: selectedEnv
        });
    });
}());
