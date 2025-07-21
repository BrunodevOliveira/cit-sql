
(function() {
    const vscode = acquireVsCodeApi();
    const formSection = document.getElementById('formSection');
    const selectedEnvSection = document.getElementById('selectedEnvSection');
    const formTitle = document.getElementById('formTitle');
    const envForm = document.getElementById('envForm');
    const deleteBtn = document.getElementById('deleteBtn');

    function getEnvs(){
        vscode.postMessage({ command: 'getEnvironments' });
    }

    getEnvs();

    document.getElementById('newBtn').addEventListener('click', () => {
        formTitle.innerHTML = '<i class="codicon codicon-add"></i> Cadastro de Ambiente';
        envForm.reset();
        deleteBtn.style.display = 'none';
        selectedEnvSection.style.display = 'none';
        formSection.style.display = 'block';
    });

    document.getElementById('editBtn').addEventListener('click', () => {
        const selectedEnv = document.getElementById('envSelect').value;
        if (selectedEnv) {
            vscode.postMessage({ command: 'getEnvironment', envName: selectedEnv });
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        formSection.style.display = 'none';
        selectedEnvSection.style.display = 'block';
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
        const envName = document.getElementById('originalEnvName').value;
        vscode.postMessage({ command: 'deleteEnvironment', envName: envName });
    });

    envForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalEnvName = document.getElementById('originalEnvName').value;
        const envName = document.getElementById('envName').value;
        const endpoint = document.getElementById('endpoint').value;
        const token = document.getElementById('token').value;
        vscode.postMessage({
            command: 'saveEnvironment',
            originalEnvName: originalEnvName,
            env: { name: envName, endpoint: endpoint, token: token }
        });
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'loadEnvironments':
                const select = document.getElementById('envSelect');
                const selectedValue = select.value;
                select.innerHTML = '';
                message.envs.forEach(env => {
                    const option = document.createElement('option');
                    option.value = env.name;
                    option.textContent = env.name;
                    select.appendChild(option);
                });
                select.value = selectedValue;
                if (select.value) {
                    vscode.postMessage({ command: 'getEnvironment', envName: select.value });
                }
                break;
            case 'loadEnvironment':
                formTitle.innerHTML = '<i class="codicon codicon-edit"></i> Edição de Ambiente';
                document.getElementById('originalEnvName').value = message.env.name;
                document.getElementById('envName').value = message.env.name;
                document.getElementById('endpoint').value = message.env.endpoint;
                document.getElementById('token').value = message.env.token;
                deleteBtn.style.display = 'block';
                selectedEnvSection.style.display = 'none';
                formSection.style.display = 'block';
                break;
            case 'showSelectedEnv':
                document.getElementById('selectedEnvName').textContent = message.env.name;
                document.getElementById('selectedEnvEndpoint').textContent = message.env.endpoint;
                selectedEnvSection.style.display = 'block';
                formSection.style.display = 'none';
                break;
            case 'clearForm':
                envForm.reset();
                formSection.style.display = 'none';
                selectedEnvSection.style.display = 'block';
                break;
        }
    });

    document.getElementById('connectBtn').addEventListener('click', () => {
        const selectedEnv = document.getElementById('envSelect').value;
        if (selectedEnv) {
            vscode.postMessage({ command: 'connectToEnvironment', envName: selectedEnv });
        }
    });

    document.getElementById('envSelect').addEventListener('change', (e) => {
        const selectedEnv = e.target.value;
        if (selectedEnv) {
            vscode.postMessage({ command: 'getEnvironment', envName: selectedEnv });
        }
    });
}());
