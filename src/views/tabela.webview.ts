export default function criarTabela(data: any[], endpoint: string): string {
    if (data.length === 0) return '<h2>Sem registros</h2>';

    // Extrair todos os cabeçalhos únicos dos objetos
    const headers = [...new Set(data.flatMap(Object.keys))];

    // Criar o HTML completo com CSS embutido
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resultado da Consulta</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #1e1e1e;
                    color: #ffffff;
                }

                h2 {
                    color: #ffffff;
                }

                .container {
                    margin: 20px 0;
                }

                .tabela-estilizada {
                    overflow-x: auto;
                    overflow-y: auto;
                    max-width: 100%;
                    max-height: 500px;
                    background-color: #3a3a3f;
                    color: #FFFFFF;
                    width: 100%;
                    border-collapse: collapse;
                    border-spacing: 10px;
                }

                .tabela-estilizada th, 
                .tabela-estilizada td {
                    background-color: #3a3a3f;
                    color: #FFFFFF;
                    border: 1px solid #FFF;
                    padding: 10px;
                    text-align: left;
                }

                .tabela-estilizada thead {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .tabela-estilizada th {
                    background-color: #2d2d30;
                }

                .info {
                    color: #cccccc;
                    font-size: 0.9em;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <h2>Resultado da Consulta</h2>
            <div class="info">API: ${endpoint}</div>
            <div class="info">Data da execução: ${new Date().toLocaleString()}</div>
            <div class="container">
                <table class="tabela-estilizada">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    return html;
}