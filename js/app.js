// Estado da Aplicação
const App = {
    currentPage: 'dashboard',
    currentFilter: 'todos',
    categorias: [],
    contas: [],
    transacoes: [],
    charts: {}
};

let supabaseClient = null;

function initSupabase() {
    const config = window.SUPABASE_CONFIG || {};
    const supabaseUrl = config.url;
    const supabaseAnonKey = config.anonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
        alert('Configure a URL e a chave anon do Supabase em js/config.js');
        throw new Error('Supabase não configurado');
    }

    if (supabaseUrl.includes('SEU-PROJETO') || supabaseAnonKey.includes('SUA_SUPABASE')) {
        alert('Atualize os dados do Supabase em js/config.js');
        throw new Error('Supabase não configurado');
    }

    if (!window.supabase?.createClient) {
        throw new Error('Biblioteca do Supabase não encontrada');
    }

    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    try {
        initSupabase();
    } catch (error) {
        console.error('Erro ao iniciar Supabase:', error);
        return;
    }
    initNavigation();
    initModals();
    initForms();
    loadData();
});

// ========== NAVEGAÇÃO ==========
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Filtros de tipo de pessoa
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            App.currentFilter = btn.dataset.tipo;
            loadData();
        });
    });
}

function navigateToPage(page) {
    const pages = document.querySelectorAll('.page-content');
    const navItems = document.querySelectorAll('.nav-item');
    
    pages.forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    
    document.getElementById(`${page}-page`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    const titles = {
        dashboard: 'Dashboard',
        transacoes: 'Transações',
        contas: 'Contas',
        categorias: 'Categorias',
        relatorios: 'Relatórios'
    };
    
    document.getElementById('pageTitle').textContent = titles[page];
    App.currentPage = page;
    
    if (page === 'dashboard') loadDashboard();
    if (page === 'transacoes') loadTransacoes();
    if (page === 'contas') loadContas();
    if (page === 'categorias') loadCategorias();
}

// ========== CARREGAMENTO DE DADOS ==========
async function loadData() {
    try {
        await Promise.all([
            loadCategorias(),
            loadContas(),
            loadTransacoes()
        ]);
        
        if (App.currentPage === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function loadCategorias() {
    try {
        const { data, error } = await supabaseClient
            .from('categorias')
            .select('*')
            .limit(100);

        if (error) throw error;

        App.categorias = data || [];
        
        // Atualizar select de categorias
        updateCategoriasSelect();
        
        // Renderizar página de categorias se estiver ativa
        if (App.currentPage === 'categorias') {
            renderCategorias();
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function loadContas() {
    try {
        const { data, error } = await supabaseClient
            .from('contas')
            .select('*')
            .limit(100);

        if (error) throw error;

        App.contas = data || [];
        
        // Aplicar filtro
        if (App.currentFilter !== 'todos') {
            App.contas = App.contas.filter(c => c.tipo_pessoa === App.currentFilter);
        }
        
        // Atualizar select de contas
        updateContasSelect();
        
        // Renderizar página de contas se estiver ativa
        if (App.currentPage === 'contas') {
            renderContas();
        }
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
    }
}

async function loadTransacoes() {
    try {
        const { data, error } = await supabaseClient
            .from('transacoes')
            .select('*')
            .order('data', { ascending: false })
            .limit(1000);

        if (error) throw error;

        let transacoes = data || [];
        
        // Aplicar filtro de tipo de pessoa baseado na conta
        if (App.currentFilter !== 'todos') {
            const contasIds = App.contas.map(c => c.id);
            transacoes = transacoes.filter(t => contasIds.includes(t.conta_id));
        }
        
        App.transacoes = transacoes;
        
        if (App.currentPage === 'transacoes') {
            renderTransacoes();
        }
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

// ========== DASHBOARD ==========
async function loadDashboard() {
    // Calcular totais
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transacoesDoMes = App.transacoes.filter(t => {
        const dataTransacao = new Date(t.data);
        return dataTransacao >= firstDayOfMonth;
    });
    
    const receitas = transacoesDoMes
        .filter(t => t.tipo === 'receita' && t.pago)
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
    
    const despesas = transacoesDoMes
        .filter(t => t.tipo === 'despesa' && t.pago)
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
    
    const pendentes = App.transacoes
        .filter(t => !t.pago)
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
    
    const saldoContas = App.contas.reduce((sum, c) => sum + parseFloat(c.saldo_inicial), 0);
    const saldo = saldoContas + receitas - despesas;
    
    // Atualizar cards
    document.getElementById('totalReceitas').textContent = formatCurrency(receitas);
    document.getElementById('totalDespesas').textContent = formatCurrency(despesas);
    document.getElementById('saldoTotal').textContent = formatCurrency(saldo);
    document.getElementById('totalPendentes').textContent = formatCurrency(pendentes);
    
    // Renderizar gráficos
    renderReceitasDespesasChart(transacoesDoMes);
    renderCategoriasDespesasChart(transacoesDoMes);
    
    // Renderizar transações recentes
    renderRecentTransactions();
}

function renderReceitasDespesasChart(transacoes) {
    const ctx = document.getElementById('receitasDespesasChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (App.charts.receitasDespesas) {
        App.charts.receitasDespesas.destroy();
    }
    
    // Agrupar por mês
    const mesesData = {};
    transacoes.forEach(t => {
        const data = new Date(t.data);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        
        if (!mesesData[mesAno]) {
            mesesData[mesAno] = { receitas: 0, despesas: 0 };
        }
        
        if (t.tipo === 'receita' && t.pago) {
            mesesData[mesAno].receitas += parseFloat(t.valor);
        } else if (t.tipo === 'despesa' && t.pago) {
            mesesData[mesAno].despesas += parseFloat(t.valor);
        }
    });
    
    const labels = Object.keys(mesesData).slice(-6);
    const receitasData = labels.map(m => mesesData[m].receitas);
    const despesasData = labels.map(m => mesesData[m].despesas);
    
    App.charts.receitasDespesas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasData,
                    backgroundColor: '#10b981',
                    borderRadius: 8
                },
                {
                    label: 'Despesas',
                    data: despesasData,
                    backgroundColor: '#ef4444',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function renderCategoriasDespesasChart(transacoes) {
    const ctx = document.getElementById('categoriasDespesasChart');
    if (!ctx) return;
    
    if (App.charts.categoriasDespesas) {
        App.charts.categoriasDespesas.destroy();
    }
    
    // Agrupar despesas por categoria
    const despesasPorCategoria = {};
    transacoes
        .filter(t => t.tipo === 'despesa' && t.pago)
        .forEach(t => {
            if (!despesasPorCategoria[t.categoria_id]) {
                despesasPorCategoria[t.categoria_id] = 0;
            }
            despesasPorCategoria[t.categoria_id] += parseFloat(t.valor);
        });
    
    const categorias = Object.keys(despesasPorCategoria)
        .map(catId => {
            const cat = App.categorias.find(c => c.id === catId);
            return {
                nome: cat ? cat.nome : 'Sem categoria',
                valor: despesasPorCategoria[catId],
                cor: cat ? cat.cor : '#999999'
            };
        })
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);
    
    App.charts.categoriasDespesas = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categorias.map(c => c.nome),
            datasets: [{
                data: categorias.map(c => c.valor),
                backgroundColor: categorias.map(c => c.cor),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': R$ ' + context.parsed.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            }
        }
    });
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    const recent = App.transacoes.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = recent.map(t => {
        const categoria = App.categorias.find(c => c.id === t.categoria_id);
        const conta = App.contas.find(c => c.id === t.conta_id);
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background: ${categoria?.cor || '#999'}">
                        <i class="fas ${categoria?.icone || 'fa-circle'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${t.descricao}</h4>
                        <p>${formatDate(t.data)} • ${categoria?.nome || 'Sem categoria'} • ${conta?.nome || 'Sem conta'}</p>
                    </div>
                </div>
                <div class="transaction-value ${t.tipo}">
                    ${t.tipo === 'receita' ? '+' : '-'} ${formatCurrency(t.valor)}
                </div>
            </div>
        `;
    }).join('');
}

// ========== TRANSAÇÕES ==========
function renderTransacoes() {
    const tbody = document.getElementById('transacoesTableBody');
    
    if (App.transacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Nenhuma transação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = App.transacoes.map(t => {
        const categoria = App.categorias.find(c => c.id === t.categoria_id);
        const conta = App.contas.find(c => c.id === t.conta_id);
        
        return `
            <tr>
                <td>${formatDate(t.data)}</td>
                <td>${t.descricao}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${categoria?.cor || '#999'}"></div>
                        ${categoria?.nome || 'Sem categoria'}
                    </div>
                </td>
                <td>${conta?.nome || 'Sem conta'}</td>
                <td class="${t.tipo}">
                    <span class="badge badge-${t.tipo}">${t.tipo === 'receita' ? '+' : '-'} ${formatCurrency(t.valor)}</span>
                </td>
                <td>
                    <span class="badge ${t.pago ? 'badge-success' : 'badge-warning'}">
                        ${t.pago ? 'Pago' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editTransacao('${t.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteTransacao('${t.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== CONTAS ==========
function renderContas() {
    const container = document.getElementById('contasGrid');
    
    if (App.contas.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma conta encontrada</p>';
        return;
    }
    
    container.innerHTML = App.contas.map(c => {
        // Calcular saldo atual
        const transacoesConta = App.transacoes.filter(t => t.conta_id === c.id && t.pago);
        const receitas = transacoesConta.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + parseFloat(t.valor), 0);
        const despesas = transacoesConta.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + parseFloat(t.valor), 0);
        const saldoAtual = parseFloat(c.saldo_inicial) + receitas - despesas;
        
        return `
            <div class="conta-card" style="border-left-color: ${c.cor}">
                <div class="conta-card-header">
                    <div class="conta-card-title">
                        <h3>${c.nome}</h3>
                        <span class="conta-tipo" style="background: ${c.cor}; color: white;">${c.tipo_pessoa}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editConta('${c.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteConta('${c.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="conta-saldo">${formatCurrency(saldoAtual)}</div>
                <div class="conta-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Saldo inicial: ${formatCurrency(c.saldo_inicial)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ========== CATEGORIAS ==========
function renderCategorias() {
    const receitasList = document.getElementById('receitasCategoriasList');
    const despesasList = document.getElementById('despesasCategoriasList');
    
    const receitas = App.categorias.filter(c => c.tipo === 'receita');
    const despesas = App.categorias.filter(c => c.tipo === 'despesa');
    
    receitasList.innerHTML = receitas.length === 0 
        ? '<p class="no-data">Nenhuma categoria encontrada</p>'
        : receitas.map(renderCategoriaItem).join('');
    
    despesasList.innerHTML = despesas.length === 0
        ? '<p class="no-data">Nenhuma categoria encontrada</p>'
        : despesas.map(renderCategoriaItem).join('');
}

function renderCategoriaItem(c) {
    return `
        <div class="category-item">
            <div class="category-info">
                <div class="category-icon" style="background: ${c.cor}">
                    <i class="fas ${c.icone}"></i>
                </div>
                <span>${c.nome}</span>
            </div>
            <div class="action-buttons">
                <button class="btn-icon" onclick="editCategoria('${c.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteCategoria('${c.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ========== MODAIS ==========
function initModals() {
    // Transação Modal
    const transacaoModal = document.getElementById('transacaoModal');
    const btnNovaTransacao = document.getElementById('btnNovaTransacao');
    const closeTransacaoModal = document.getElementById('closeTransacaoModal');
    const cancelTransacao = document.getElementById('cancelTransacao');
    
    btnNovaTransacao?.addEventListener('click', () => openTransacaoModal());
    closeTransacaoModal?.addEventListener('click', () => transacaoModal.classList.remove('active'));
    cancelTransacao?.addEventListener('click', () => transacaoModal.classList.remove('active'));
    
    // Toggle tipo de transação
    const tipoBtns = document.querySelectorAll('.tipo-btn');
    tipoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tipoBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('transacaoTipo').value = btn.dataset.tipo;
            updateCategoriasSelect();
        });
    });
    
    // Conta Modal
    const contaModal = document.getElementById('contaModal');
    const btnNovaConta = document.getElementById('btnNovaConta');
    const closeContaModal = document.getElementById('closeContaModal');
    const cancelConta = document.getElementById('cancelConta');
    
    btnNovaConta?.addEventListener('click', () => openContaModal());
    closeContaModal?.addEventListener('click', () => contaModal.classList.remove('active'));
    cancelConta?.addEventListener('click', () => contaModal.classList.remove('active'));
    
    // Categoria Modal
    const categoriaModal = document.getElementById('categoriaModal');
    const btnNovaCategoria = document.getElementById('btnNovaCategoria');
    const closeCategoriaModal = document.getElementById('closeCategoriaModal');
    const cancelCategoria = document.getElementById('cancelCategoria');
    
    btnNovaCategoria?.addEventListener('click', () => openCategoriaModal());
    closeCategoriaModal?.addEventListener('click', () => categoriaModal.classList.remove('active'));
    cancelCategoria?.addEventListener('click', () => categoriaModal.classList.remove('active'));
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function openTransacaoModal(transacaoId = null) {
    const modal = document.getElementById('transacaoModal');
    const form = document.getElementById('transacaoForm');
    const title = document.getElementById('transacaoModalTitle');
    
    form.reset();
    document.getElementById('transacaoId').value = '';
    title.textContent = 'Nova Transação';
    
    // Data padrão = hoje
    document.getElementById('transacaoData').value = new Date().toISOString().split('T')[0];
    
    if (transacaoId) {
        const transacao = App.transacoes.find(t => t.id === transacaoId);
        if (transacao) {
            title.textContent = 'Editar Transação';
            document.getElementById('transacaoId').value = transacao.id;
            document.getElementById('transacaoDescricao').value = transacao.descricao;
            document.getElementById('transacaoValor').value = transacao.valor;
            document.getElementById('transacaoData').value = new Date(transacao.data).toISOString().split('T')[0];
            document.getElementById('transacaoCategoria').value = transacao.categoria_id;
            document.getElementById('transacaoConta').value = transacao.conta_id;
            document.getElementById('transacaoPago').checked = transacao.pago;
            document.getElementById('transacaoRecorrente').checked = transacao.recorrente;
            document.getElementById('transacaoObservacoes').value = transacao.observacoes || '';
            
            // Atualizar tipo
            document.getElementById('transacaoTipo').value = transacao.tipo;
            document.querySelectorAll('.tipo-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tipo === transacao.tipo);
            });
            updateCategoriasSelect();
        }
    }
    
    modal.classList.add('active');
}

function openContaModal(contaId = null) {
    const modal = document.getElementById('contaModal');
    const form = document.getElementById('contaForm');
    const title = document.getElementById('contaModalTitle');
    
    form.reset();
    document.getElementById('contaId').value = '';
    title.textContent = 'Nova Conta';
    document.getElementById('contaCor').value = '#3b82f6';
    document.getElementById('contaAtiva').checked = true;
    
    if (contaId) {
        const conta = App.contas.find(c => c.id === contaId);
        if (conta) {
            title.textContent = 'Editar Conta';
            document.getElementById('contaId').value = conta.id;
            document.getElementById('contaNome').value = conta.nome;
            document.getElementById('contaTipoPessoa').value = conta.tipo_pessoa;
            document.getElementById('contaSaldoInicial').value = conta.saldo_inicial;
            document.getElementById('contaCor').value = conta.cor;
            document.getElementById('contaAtiva').checked = conta.ativa;
        }
    }
    
    modal.classList.add('active');
}

function openCategoriaModal(categoriaId = null) {
    const modal = document.getElementById('categoriaModal');
    const form = document.getElementById('categoriaForm');
    const title = document.getElementById('categoriaModalTitle');
    
    form.reset();
    document.getElementById('categoriaId').value = '';
    title.textContent = 'Nova Categoria';
    document.getElementById('categoriaCor').value = '#3b82f6';
    
    if (categoriaId) {
        const categoria = App.categorias.find(c => c.id === categoriaId);
        if (categoria) {
            title.textContent = 'Editar Categoria';
            document.getElementById('categoriaId').value = categoria.id;
            document.getElementById('categoriaNome').value = categoria.nome;
            document.getElementById('categoriaTipo').value = categoria.tipo;
            document.getElementById('categoriaCor').value = categoria.cor;
            document.getElementById('categoriaIcone').value = categoria.icone;
        }
    }
    
    modal.classList.add('active');
}

// ========== FORMULÁRIOS ==========
function initForms() {
    // Form Transação
    document.getElementById('transacaoForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTransacao();
    });
    
    // Form Conta
    document.getElementById('contaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConta();
    });
    
    // Form Categoria
    document.getElementById('categoriaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCategoria();
    });
    
    // Relatórios
    document.getElementById('periodoFilter')?.addEventListener('change', (e) => {
        const customDate = document.getElementById('customDateRange');
        customDate.style.display = e.target.value === 'personalizado' ? 'flex' : 'none';
    });
    
    document.getElementById('btnGerarRelatorio')?.addEventListener('click', generateRelatorio);
    document.getElementById('btnExportarRelatorio')?.addEventListener('click', exportRelatorio);
}

async function saveTransacao() {
    const id = document.getElementById('transacaoId').value;
    const data = {
        descricao: document.getElementById('transacaoDescricao').value,
        valor: parseFloat(document.getElementById('transacaoValor').value),
        tipo: document.getElementById('transacaoTipo').value,
        categoria_id: document.getElementById('transacaoCategoria').value,
        conta_id: document.getElementById('transacaoConta').value,
        data: new Date(document.getElementById('transacaoData').value).getTime(),
        pago: document.getElementById('transacaoPago').checked,
        recorrente: document.getElementById('transacaoRecorrente').checked,
        observacoes: document.getElementById('transacaoObservacoes').value
    };
    
    try {
        if (id) {
            data.id = id;
            const { error } = await supabaseClient
                .from('transacoes')
                .update(data)
                .eq('id', id);

            if (error) throw error;
        } else {
            data.id = 'trans-' + Date.now();
            const { error } = await supabaseClient
                .from('transacoes')
                .insert(data);

            if (error) throw error;
        }
        
        document.getElementById('transacaoModal').classList.remove('active');
        await loadData();
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
        alert('Erro ao salvar transação');
    }
}

async function saveConta() {
    const id = document.getElementById('contaId').value;
    const data = {
        nome: document.getElementById('contaNome').value,
        tipo_pessoa: document.getElementById('contaTipoPessoa').value,
        saldo_inicial: parseFloat(document.getElementById('contaSaldoInicial').value),
        cor: document.getElementById('contaCor').value,
        ativa: document.getElementById('contaAtiva').checked
    };
    
    try {
        if (id) {
            data.id = id;
            const { error } = await supabaseClient
                .from('contas')
                .update(data)
                .eq('id', id);

            if (error) throw error;
        } else {
            data.id = 'conta-' + Date.now();
            const { error } = await supabaseClient
                .from('contas')
                .insert(data);

            if (error) throw error;
        }
        
        document.getElementById('contaModal').classList.remove('active');
        await loadData();
    } catch (error) {
        console.error('Erro ao salvar conta:', error);
        alert('Erro ao salvar conta');
    }
}

async function saveCategoria() {
    const id = document.getElementById('categoriaId').value;
    const data = {
        nome: document.getElementById('categoriaNome').value,
        tipo: document.getElementById('categoriaTipo').value,
        cor: document.getElementById('categoriaCor').value,
        icone: document.getElementById('categoriaIcone').value
    };
    
    try {
        if (id) {
            data.id = id;
            const { error } = await supabaseClient
                .from('categorias')
                .update(data)
                .eq('id', id);

            if (error) throw error;
        } else {
            data.id = 'cat-' + Date.now();
            const { error } = await supabaseClient
                .from('categorias')
                .insert(data);

            if (error) throw error;
        }
        
        document.getElementById('categoriaModal').classList.remove('active');
        await loadData();
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        alert('Erro ao salvar categoria');
    }
}

// ========== EDIÇÃO E EXCLUSÃO ==========
async function editTransacao(id) {
    openTransacaoModal(id);
}

async function deleteTransacao(id) {
    if (!confirm('Deseja realmente excluir esta transação?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('transacoes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadData();
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação');
    }
}

async function editConta(id) {
    // Recarregar todas as contas (sem filtro)
    const { data, error } = await supabaseClient
        .from('contas')
        .select('*')
        .limit(100);

    if (error) {
        console.error('Erro ao carregar contas:', error);
        alert('Erro ao carregar contas');
        return;
    }

    App.contas = data || [];
    openContaModal(id);
}

async function deleteConta(id) {
    if (!confirm('Deseja realmente excluir esta conta?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('contas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadData();
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta');
    }
}

async function editCategoria(id) {
    openCategoriaModal(id);
}

async function deleteCategoria(id) {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadData();
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
    }
}

// ========== RELATÓRIOS ==========
async function generateRelatorio() {
    const periodo = document.getElementById('periodoFilter').value;
    let dataInicio, dataFim;
    
    const now = new Date();
    
    switch (periodo) {
        case 'mes-atual':
            dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
            dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'mes-anterior':
            dataInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            dataFim = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'trimestre':
            dataInicio = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            dataFim = now;
            break;
        case 'ano':
            dataInicio = new Date(now.getFullYear(), 0, 1);
            dataFim = now;
            break;
        case 'personalizado':
            dataInicio = new Date(document.getElementById('dataInicio').value);
            dataFim = new Date(document.getElementById('dataFim').value);
            break;
    }
    
    const transacoesPeriodo = App.transacoes.filter(t => {
        const data = new Date(t.data);
        return data >= dataInicio && data <= dataFim;
    });
    
    const receitas = transacoesPeriodo
        .filter(t => t.tipo === 'receita' && t.pago)
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
    
    const despesas = transacoesPeriodo
        .filter(t => t.tipo === 'despesa' && t.pago)
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
    
    const saldo = receitas - despesas;
    
    const container = document.getElementById('relatorioContent');
    container.innerHTML = `
        <h2>Relatório Financeiro</h2>
        <p style="color: var(--gray); margin-bottom: 2rem;">
            Período: ${formatDate(dataInicio.getTime())} a ${formatDate(dataFim.getTime())}
        </p>
        
        <div class="relatorio-summary">
            <div class="summary-item">
                <h4>Total de Receitas</h4>
                <p style="color: var(--success-color);">${formatCurrency(receitas)}</p>
            </div>
            <div class="summary-item">
                <h4>Total de Despesas</h4>
                <p style="color: var(--danger-color);">${formatCurrency(despesas)}</p>
            </div>
            <div class="summary-item">
                <h4>Saldo</h4>
                <p style="color: ${saldo >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${formatCurrency(saldo)}</p>
            </div>
        </div>
        
        <h3 style="margin: 2rem 0 1rem;">Transações do Período</h3>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${transacoesPeriodo.map(t => {
                        const categoria = App.categorias.find(c => c.id === t.categoria_id);
                        return `
                            <tr>
                                <td>${formatDate(t.data)}</td>
                                <td>${t.descricao}</td>
                                <td>${categoria?.nome || 'Sem categoria'}</td>
                                <td><span class="badge badge-${t.tipo}">${t.tipo}</span></td>
                                <td class="${t.tipo}">${t.tipo === 'receita' ? '+' : '-'} ${formatCurrency(t.valor)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportRelatorio() {
    alert('Funcionalidade de exportação em desenvolvimento');
}

// ========== UTILITIES ==========
function updateCategoriasSelect() {
    const select = document.getElementById('transacaoCategoria');
    if (!select) return;
    
    const tipo = document.getElementById('transacaoTipo').value;
    const categoriasFiltradas = App.categorias.filter(c => c.tipo === tipo);
    
    select.innerHTML = '<option value="">Selecione...</option>' +
        categoriasFiltradas.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

function updateContasSelect() {
    const select = document.getElementById('transacaoConta');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione...</option>' +
        App.contas.map(c => `<option value="${c.id}">${c.nome} (${c.tipo_pessoa})</option>`).join('');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
}
