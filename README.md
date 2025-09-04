# 🧠 MindStats - Football Mental Performance Analytics

[![Deploy to Digital Ocean](https://img.shields.io/badge/Deploy-Digital%20Ocean-0080FF?style=for-the-badge&logo=digitalocean)](https://cloud.digitalocean.com/apps)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)

> Sistema avançado de análise de performance mental para jogadores de futebol, integrando dados de StatsBomb, SkillCorner e Wyscout via biblioteca Kloppy.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visão geral do sistema com estatísticas e top performers
- **Análise de Jogadores**: Análise detalhada com filtros dinâmicos e gráficos interativos
- **Visualizações Avançadas**: Beeswarm plots e heatmaps por posição
- **Catálogo de Métricas**: Documentação completa de todos os núcleos mentais e métricas individuais
- **Integração Supabase**: Conexão direta com banco de dados PostgreSQL

## 🛠️ Tecnologias

- **React 18** - Framework frontend
- **Vite** - Build tool e dev server
- **Supabase** - Backend as a Service
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos

## 📊 Métricas Implementadas

### 8 Núcleos Mentais:
- Adaptation & Learning
- Attention & Perception
- Collective Integration
- Decision & Judgment
- Energy Management
- Initiative & Risk
- Resilience & Recovery
- Self-Regulation & Discipline

### 10 Métricas Individuais:
- Controlled Reception Rate
- Under Pressure Control
- Decision Latency
- Choice Accuracy
- Threat Added
- Dribble Success
- Recovery Speed
- Error Bounce Back
- Press Synchrony
- Fouls per 90

## 🔧 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

### 4. Build para Produção
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Dashboard.jsx    # Dashboard principal
│   ├── PlayerAnalysis.jsx # Análise de jogadores
│   ├── Visualizations.jsx # Visualizações avançadas
│   ├── MetricsCatalog.jsx # Catálogo de métricas
│   ├── PlayerRadarChart.jsx # Gráfico radar
│   ├── PlayerMetricsChart.jsx # Gráfico de métricas
│   ├── BeeswarmChart.jsx # Gráfico beeswarm
│   └── HeatmapChart.jsx # Heatmap de posições
├── lib/
│   └── supabase.js      # Configuração e funções do Supabase
├── App.jsx              # Componente principal
├── main.jsx             # Entry point
└── index.css            # Estilos globais
```

## 🗄️ Integração com Banco de Dados

O frontend se conecta diretamente com as seguintes tabelas do Supabase:

- `player_complete_profile` (view) - Perfis completos dos jogadores
- `top_performers` (view) - Top performers
- `leagues` - Ligas disponíveis
- `mental_nuclei_definitions` - Definições dos núcleos mentais
- `individual_metrics_definitions` - Definições das métricas individuais
- `position_benchmarks` - Benchmarks por posição

## 🎨 Design System

- **Tema Escuro**: Interface moderna com fundo escuro
- **Cores Principais**: Azul (#3b82f6) e Verde (#10b981)
- **Tipografia**: System fonts para melhor performance
- **Responsivo**: Funciona em desktop e mobile
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 🔍 Funcionalidades Detalhadas

### Dashboard
- Estatísticas gerais do sistema
- Top 8 performers
- Status dos provedores de dados
- Overview dos núcleos mentais

### Player Analysis
- Filtros por liga, posição e temporada
- Lista de jogadores com busca
- Gráfico radar dos núcleos mentais
- Gráfico de barras das métricas individuais
- Score geral calculado automaticamente

### Visualizations
- Beeswarm plot com cores por posição
- Heatmap de campo com médias por posição
- Filtros dinâmicos por métrica e liga
- Estatísticas da visualização atual

### Metrics Catalog
- Documentação completa de todas as métricas
- Busca por nome ou descrição
- Mapeamento para provedores de dados
- Informações técnicas detalhadas

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
# Deploy da pasta dist/
```

### Netlify
```bash
npm run build
# Deploy da pasta dist/
```

### Servidor Próprio
```bash
npm run build
# Servir arquivos da pasta dist/
```

## 🔐 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Chaves de API expostas apenas no frontend (anon key)
- Políticas de acesso configuradas no banco
- Validação de dados no cliente e servidor

## 📈 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: React.memo em componentes pesados
- **Otimização de Queries**: Consultas eficientes no Supabase
- **Caching**: Cache automático do Supabase
- **Bundle Splitting**: Código dividido automaticamente pelo Vite

## 🐛 Troubleshooting

### Erro de Conexão com Supabase
1. Verifique se as credenciais no `.env` estão corretas
2. Confirme se o RLS está configurado corretamente
3. Verifique se as tabelas existem no banco

### Dados Não Aparecem
1. Verifique se há dados nas tabelas
2. Confirme se as políticas de RLS permitem leitura
3. Verifique o console do navegador para erros

### Performance Lenta
1. Verifique se os índices estão criados no banco
2. Otimize as consultas no `supabase.js`
3. Considere implementar paginação

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Supabase
2. Consulte os logs do navegador
3. Verifique as configurações do banco de dados

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

