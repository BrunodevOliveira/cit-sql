
(function() {
    const vscode = acquireVsCodeApi();

    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    document.querySelector(".tablinks").click();

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

    document.querySelectorAll('.tablinks').forEach(button => {
        button.addEventListener('click', (e) => {
            openTab(e, e.target.textContent.includes('Cadastro') ? 'Register' : 'Select');
        });
    });
}());
