import React, { useState, useEffect } from 'react'
import { Users, Trophy, BarChart3, Database, TrendingUp, Brain } from 'lucide-react'
import { db } from '../lib/supabase'

const Dashboard = ({ dashboardStats }) => {
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const performers = await db.getTopPerformers(8)
      setTopPerformers(performers)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Players',
      value: dashboardStats.players.toLocaleString(),
      icon: Users,
      color: '#3b82f6',
      description: 'Jogadores analisados'
    },
    {
      title: 'Leagues',
      value: dashboardStats.leagues,
      icon: Trophy,
      color: '#10b981',
      description: 'Ligas europeias'
    },
    {
      title: 'Teams',
      value: dashboardStats.teams.toLocaleString(),
      icon: BarChart3,
      color: '#f59e0b',
      description: 'Times cadastrados'
    },
    {
      title: 'Metrics Processed',
      value: dashboardStats.metrics.toLocaleString(),
      icon: Database,
      color: '#8b5cf6',
      description: 'Métricas processadas'
    }
  ]

  const mentalNuclei = [
    { name: 'Adaptation & Learning', description: 'Capacidade de aprender e se adaptar' },
    { name: 'Attention & Perception', description: 'Foco e percepção de jogo' },
    { name: 'Collective Integration', description: 'Integração com movimentos coletivos' },
    { name: 'Decision & Judgment', description: 'Qualidade das decisões táticas' },
    { name: 'Energy Management', description: 'Gestão de energia física e mental' },
    { name: 'Initiative & Risk', description: 'Propensão a tomar iniciativas' },
    { name: 'Resilience & Recovery', description: 'Capacidade de recuperação' },
    { name: 'Self-Regulation & Discipline', description: 'Autorregulação e disciplina' }
  ]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Carregando dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          MindStats Dashboard
        </h1>
        <p className="card-description" style={{ fontSize: '1.1rem' }}>
          Análise de performance mental para jogadores de futebol
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card stat-card">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Icon size={32} style={{ color: stat.color }} />
              </div>
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {stat.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {stat.description}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Top Performers
            </h2>
            <p className="card-description">
              Jogadores com melhor performance mental geral
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topPerformers.length > 0 ? (
              topPerformers.map((player, index) => (
                <div key={index} className="player-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-info">
                        {player.position} • {player.team} • {player.league}
                      </div>
                    </div>
                    <div className="player-score">
                      {player.overall_mental_score}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                Nenhum dado de performance disponível
              </div>
            )}
          </div>
        </div>

        {/* Mental Nuclei Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Brain size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Mental Performance Nuclei
            </h2>
            <p className="card-description">
              Os 8 núcleos de análise mental implementados
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mentalNuclei.map((nucleus, index) => (
              <div key={index} className="metric-item">
                <div>
                  <div className="metric-name" style={{ 
                    color: '#ffffff', 
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    {nucleus.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {nucleus.description}
                  </div>
                </div>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#10b981' 
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">System Status</h2>
          <p className="card-description">
            Status da integração com provedores de dados
          </p>
        </div>
        
        <div className="grid grid-3">
          <div className="metric-item">
            <div>
              <div className="metric-name" style={{ color: '#ffffff', fontWeight: '500' }}>
                StatsBomb
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Event data provider
              </div>
            </div>
            <div style={{ 
              padding: '0.25rem 0.5rem',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              READY
            </div>
          </div>
          
          <div className="metric-item">
            <div>
              <div className="metric-name" style={{ color: '#ffffff', fontWeight: '500' }}>
                SkillCorner
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tracking data provider
              </div>
            </div>
            <div style={{ 
              padding: '0.25rem 0.5rem',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              READY
            </div>
          </div>
          
          <div className="metric-item">
            <div>
              <div className="metric-name" style={{ color: '#ffffff', fontWeight: '500' }}>
                Wyscout
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Advanced stats provider
              </div>
            </div>
            <div style={{ 
              padding: '0.25rem 0.5rem',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              READY
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

