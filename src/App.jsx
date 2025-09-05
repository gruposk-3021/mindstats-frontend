import React, { useState, useEffect } from 'react'
import { Brain, BarChart3, Users, Target, FileText } from 'lucide-react'
import Dashboard from './components/Dashboard'
import PlayerAnalysis from './components/PlayerAnalysis'
import Visualizations from './components/Visualizations'
import MetricsCatalog from './components/MetricsCatalog'
import ReportBuilder from './components/ReportBuilder'
import { db } from './lib/supabase'

/* Importar estilos do Report Builder */
@import './styles/report-builder.css';

/* Correções globais para valores numéricos */
.numeric-value {
  font-variant-numeric: tabular-nums;
}

/* Melhorias de acessibilidade */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardStats, setDashboardStats] = useState({
    players: 0,
    leagues: 0,
    teams: 0,
    metrics: 0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const stats = await db.getDashboardStats()
      setDashboardStats(stats)
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao conectar com o banco de dados. Verifique as configurações do Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: Dashboard
    },
    {
      id: 'analysis',
      name: 'Player Analysis',
      icon: Users,
      component: PlayerAnalysis
    },
    {
      id: 'reports',
      name: 'Report Builder',
      icon: FileText,
      component: ReportBuilder
    },
    {
      id: 'visualizations',
      name: 'Visualizations',
      icon: Target,
      component: Visualizations
    },
    {
      id: 'catalog',
      name: 'Metrics Catalog',
      icon: Brain,
      component: MetricsCatalog
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Carregando MindStats...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="error">
          <h2>Erro de Conexão</h2>
          <p>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Para configurar o Supabase:
          </p>
          <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
            <li>Crie um arquivo <code>.env</code> na raiz do projeto</li>
            <li>Adicione suas credenciais do Supabase:</li>
            <pre style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '0.5rem', 
              borderRadius: '4px',
              marginTop: '0.5rem',
              fontSize: '0.8rem'
            }}>
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon`}
            </pre>
          </ol>
          <button 
            className="btn btn-primary" 
            onClick={loadInitialData}
            style={{ marginTop: '1rem' }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Brain className="inline-block mr-2" size={24} />
              MindStats
              <span className="version-badge">v2.0</span>
            </div>
            
            <nav className="nav-tabs">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {tab.name}
                    {tab.id === 'reports' && (
                      <span className="new-badge">NEW</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 20px' }}>
        {ActiveComponent && (
          <ActiveComponent 
            dashboardStats={dashboardStats}
            onStatsUpdate={setDashboardStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#64748b',
        borderTop: '1px solid rgba(51, 65, 85, 0.3)',
        marginTop: '4rem'
      }}>
        <p>
          MindStats - Football Mental Performance Analytics
        </p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Powered by StatsBomb, SkillCorner & Wyscout data via Kloppy
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
          v2.0 - Now with Interactive Report Builder & Advanced Comparisons
        </p>
      </footer>
    </div>
  )
}

export default App

