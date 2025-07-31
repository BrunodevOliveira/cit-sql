// Estado da aplicação
let sortField = null;
let sortDirection = null;
let searchTerm = '';

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');
const recordCount = document.getElementById('recordCount');
const footerInfo = document.getElementById('footerInfo');
const exportBtn = document.getElementById('exportBtn');


// Função de busca
function filterData() {
    if (!searchTerm.trim()) {
        filteredData = [...currentData];
    } else {
        const term = searchTerm.toLowerCase();
        filteredData = currentData.filter(item => 
            Object.values(item).some(value => 
                String(value).toLowerCase().includes(term)
            )
        );
    }
    renderTable();
    updateFooter();
}

// Função de ordenação
function sortData() {
    if (!sortField || !sortDirection) {
        return;
    }

    filteredData.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (sortDirection === 'asc') {
            return aString.localeCompare(bString);
        } else {
            return bString.localeCompare(aString);
        }
    });
}

// Função para atualizar ícones de ordenação
function updateSortIcons() {
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.classList.remove('active');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4"></path>';
    });

    if (sortField) {
        const activeHeader = document.querySelector(`th[data-field="${sortField}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.classList.add('active');
            if (sortDirection === 'asc') {
                activeHeader.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M5 8l2-2 2 2"></path>';
            } else if (sortDirection === 'desc') {
                activeHeader.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20V4M5 16l2 2 2-2"></path>';
            }
        }
    }
}

// Função para renderizar a tabela
function renderTable() {
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${headers.length}" class="empty-state">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
                    </svg>
                    <p>${searchTerm ? 'Nenhum resultado encontrado para sua busca.' : 'Nenhum dado disponível.'}</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredData.map(row => `
        <tr>
            ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
        </tr>
    `).join('');
}

// Função para atualizar contadores
function updateCounters() {
    recordCount.textContent = `${filteredData.length} de ${currentData.length} registros`;
}

// Função para atualizar footer
function updateFooter() {
    if (filteredData.length > 0) {
        let footerText = `Mostrando ${filteredData.length} de ${currentData.length} registros`;
        if (searchTerm) {
            footerText += ` (filtrado por: "${searchTerm}")`;
        }
        footerInfo.textContent = footerText;
        footerInfo.style.display = 'block';
    } else {
        footerInfo.style.display = 'none';
    }
    updateCounters();
}

// Função para exportar CSV
function exportToCsv() {
    const csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        )
    ].join('\n');

    vscode.postMessage({
        command: 'exportToCsv',
        payload: csvContent
    });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterData();
});

exportBtn.addEventListener('click', exportToCsv);

document.querySelectorAll('th[data-field]').forEach(header => {
    header.addEventListener('click', () => {
        const field = header.getAttribute('data-field');
        
        if (sortField === field) {
            if (sortDirection === 'asc') {
                sortDirection = 'desc';
            } else if (sortDirection === 'desc') {
                sortDirection = null;
                sortField = null;
            } else {
                sortDirection = 'asc';
            }
        } else {
            sortField = field;
            sortDirection = 'asc';
        }

        if (sortField && sortDirection) {
            sortData();
        } else {
            filteredData = [...currentData];
            filterData();
            return;
        }
        
        updateSortIcons();
        renderTable();
        updateFooter();
    });
});

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
`;

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Inicialização
function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    renderTable();
    updateFooter();
    updateSortIcons();
}

document.addEventListener('DOMContentLoaded', init);