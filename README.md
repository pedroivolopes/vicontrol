# Sistema de Gestão Financeira - PF e PJ

Sistema completo de gestão financeira desenvolvido para gerenciar finanças de Pessoa Física (PF) e Pessoa Jurídica (PJ). Oferece controle de receitas, despesas, contas bancárias, categorias e relatórios financeiros detalhados.

## 🚀 Funcionalidades Implementadas

### ✅ Dashboard
- **Cards de Resumo**: Visualização rápida de receitas, despesas, saldo total e valores pendentes
- **Gráficos Interativos**: 
  - Gráfico de barras comparando receitas vs despesas por mês
  - Gráfico de pizza mostrando distribuição de despesas por categoria
- **Transações Recentes**: Lista das últimas 5 transações realizadas
- **Filtros por Tipo de Pessoa**: PF, PJ ou Todos

### ✅ Gestão de Transações
- Cadastro completo de transações (receitas e despesas)
- Campos inclusos:
  - Descrição
  - Valor
  - Data
  - Categoria
  - Conta
  - Status (Pago/Pendente)
  - Transação recorrente
  - Observações
- Edição e exclusão de transações
- Listagem completa em formato de tabela
- Diferenciação visual por tipo (receita/despesa)

### ✅ Gestão de Contas
- Cadastro de contas bancárias separadas por PF e PJ
- Informações:
  - Nome da conta
  - Tipo de pessoa (PF/PJ)
  - Saldo inicial
  - Cor de identificação
  - Status (Ativa/Inativa)
- Cálculo automático do saldo atual baseado nas transações
- Cards visuais com informações consolidadas

### ✅ Gestão de Categorias
- Categorias separadas para receitas e despesas
- Personalização:
  - Nome da categoria
  - Tipo (receita/despesa)
  - Cor de identificação
  - Ícone (Font Awesome)
- Categorias pré-cadastradas:
  - **Receitas**: Salário, Freelance, Investimentos, Vendas
  - **Despesas**: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Impostos, Fornecedores

### ✅ Relatórios
- Geração de relatórios por período:
  - Mês atual
  - Mês anterior
  - Último trimestre
  - Ano atual
  - Período personalizado
- Resumo financeiro com totais
- Listagem detalhada de transações do período
- Opção de exportação (em desenvolvimento)

### ✅ Interface Responsiva
- Design moderno e profissional
- Totalmente responsivo (desktop, tablet e mobile)
- Sidebar de navegação
- Modais para cadastro e edição
- Feedback visual em todas as ações

## 📁 Estrutura do Projeto

```
/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos completos
├── js/
│   └── app.js          # Lógica da aplicação
└── README.md           # Documentação
```

## 🗄️ Estrutura de Dados

### Tabela: contas
- `id` (text): Identificador único
- `nome` (text): Nome da conta
- `tipo_pessoa` (text): PF ou PJ
- `saldo_inicial` (number): Saldo inicial da conta
- `cor` (text): Cor de identificação
- `ativa` (bool): Se a conta está ativa

### Tabela: categorias
- `id` (text): Identificador único
- `nome` (text): Nome da categoria
- `tipo` (text): receita ou despesa
- `cor` (text): Cor de identificação
- `icone` (text): Ícone Font Awesome

### Tabela: transacoes
- `id` (text): Identificador único
- `descricao` (text): Descrição da transação
- `valor` (number): Valor da transação
- `tipo` (text): receita ou despesa
- `categoria_id` (text): ID da categoria
- `conta_id` (text): ID da conta
- `data` (datetime): Data da transação
- `pago` (bool): Se foi paga/recebida
- `recorrente` (bool): Se é recorrente
- `observacoes` (text): Observações adicionais

## 🎯 Funcionalidades de Entrada

### URI Principal
- **`/` ou `/index.html`**: Página principal do sistema

### Páginas Disponíveis
1. **Dashboard** (`#dashboard`): Visão geral das finanças
2. **Transações** (`#transacoes`): Gerenciamento de receitas e despesas
3. **Contas** (`#contas`): Gerenciamento de contas bancárias
4. **Categorias** (`#categorias`): Gerenciamento de categorias
5. **Relatórios** (`#relatorios`): Geração de relatórios financeiros

## 🔌 Supabase (Persistência de Dados)

O sistema utiliza o Supabase como banco de dados e faz as operações via `supabase-js`.

### ✅ Como configurar
1. Crie um projeto no Supabase e copie:
   - **Project URL**
   - **Anon Public Key**
2. Abra o arquivo `js/config.js` e substitua:
   - `url`
   - `anonKey`
3. Garanta que as tabelas abaixo existam no Supabase.

## 🎨 Bibliotecas Utilizadas

- **Chart.js**: Visualização de dados em gráficos
- **Font Awesome 6**: Ícones
- **Google Fonts (Inter)**: Tipografia moderna

## 💡 Como Usar

### 1. Configuração Inicial
- O sistema já vem com contas e categorias pré-cadastradas
- Você pode adicionar mais contas e categorias conforme necessário

### 2. Cadastrar uma Transação
1. Acesse a página "Transações"
2. Clique em "Nova Transação"
3. Selecione o tipo (Receita ou Despesa)
4. Preencha os campos obrigatórios
5. Clique em "Salvar"

### 3. Visualizar Dashboard
- Acesse a página "Dashboard" para ver:
  - Resumo financeiro do mês atual
  - Gráficos comparativos
  - Últimas transações

### 4. Gerar Relatórios
1. Acesse a página "Relatórios"
2. Selecione o período desejado
3. Clique em "Gerar Relatório"

### 5. Filtrar por Tipo de Pessoa
- Use os botões no topo (Todos, PF, PJ) para filtrar as informações

## 🔜 Próximas Funcionalidades Recomendadas

1. **Metas Financeiras**
   - Definir metas mensais de economia
   - Acompanhamento de progresso

2. **Transações Recorrentes Automáticas**
   - Gerar automaticamente transações marcadas como recorrentes

3. **Exportação de Relatórios**
   - Exportar para PDF
   - Exportar para Excel/CSV

4. **Anexos**
   - Adicionar comprovantes às transações
   - Upload de notas fiscais

5. **Dashboard Avançado**
   - Mais gráficos e análises
   - Previsões de fluxo de caixa
   - Comparativo entre períodos

6. **Notificações**
   - Alertas de contas a pagar
   - Lembretes de vencimento

7. **Multi-moeda**
   - Suporte a múltiplas moedas
   - Conversão automática

8. **Importação de Extratos**
   - Importar extratos bancários (OFX, CSV)
   - Categorização automática

## 🎯 Benefícios do Sistema

### Para Pessoa Física
- Controle total das finanças pessoais
- Visualização clara de gastos por categoria
- Planejamento financeiro mensal
- Acompanhamento de metas

### Para Pessoa Jurídica
- Gestão de contas empresariais
- Controle de receitas e despesas operacionais
- Relatórios para tomada de decisão
- Separação de finanças pessoais e empresariais

## 📊 Indicadores Disponíveis

- **Receitas do Mês**: Total de receitas confirmadas
- **Despesas do Mês**: Total de despesas pagas
- **Saldo Total**: Saldo atual de todas as contas
- **Valores Pendentes**: Transações não confirmadas
- **Despesas por Categoria**: Distribuição percentual
- **Evolução Mensal**: Histórico dos últimos 6 meses

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna e responsiva
- **JavaScript (ES6+)**: Lógica e interatividade
- **Chart.js**: Visualizações de dados
- **Font Awesome**: Biblioteca de ícones
- **Supabase**: Persistência de dados

## 📱 Compatibilidade

- ✅ Google Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera
- ✅ Dispositivos móveis (iOS e Android)

## 🎨 Paleta de Cores

- **Primary**: #3b82f6 (Azul)
- **Success**: #10b981 (Verde)
- **Danger**: #ef4444 (Vermelho)
- **Warning**: #f59e0b (Laranja)
- **Info**: #06b6d4 (Ciano)
- **Dark**: #1e293b (Cinza escuro)

## 📝 Notas Importantes

- Todas as transações são armazenadas no Supabase
- É necessário configurar a URL e a chave anon antes de usar o sistema
- O sistema calcula automaticamente o saldo das contas baseado nas transações
- Categorias e contas podem ser editadas ou excluídas
- Transações excluídas não afetam os saldos iniciais das contas

---

**Desenvolvido com ❤️ para facilitar a gestão financeira de pessoas físicas e jurídicas**
