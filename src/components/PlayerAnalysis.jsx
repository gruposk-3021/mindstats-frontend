import React, { useState, useEffect } from 'react'
import { Search, Filter, User, TrendingUp, BarChart3 } from 'lucide-react'
import { db, POSITIONS, MENTAL_NUCLEI, INDIVIDUAL_METRICS } from '../lib/supabase'
import PlayerRadarChart from './PlayerRadarChart'
import PlayerMetricsChart from './PlayerMetricsChart'

const PlayerAnalysis = () => {
  const [players, setPlayers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtros
  const [filters, setFilters] = useState({
    league: '',
    position: '',
    season: '2023/24'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadPlayers()
  }, [filters])

  const loadInitialData = async () => {
    try {
      const leaguesData = await db.getLeagues()
      setLeagues(leaguesData)
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar dados iniciais')
    }
  }

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const playersData = await db.getPlayers(filters)
      setPlayers(playersData)
      
      // Se há um jogador selecionado, atualize seus dados
      if (selectedPlayer) {
        const updatedPlayer = playersData.find(p => p.id === selectedPlayer.id)
        if (updatedPlayer) {
          setSelectedPlayer(updatedPlayer)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err)
      setError('Erro ao carregar jogadores')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player)
  }

  const getMentalNucleiData = (player) => {
    if (!player) return []
    
    return MENTAL_NUCLEI.map(nucleus => ({
      nucleus: nucleus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: player[nucleus] || 0
    }))
  }

  const getIndividualMetricsData = (player) => {
    if (!player) return []
    
    return INDIVIDUAL_METRICS.map(metric => ({
      metric: metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: player[metric] || 0
    }))
  }

  const calculateOverallScore = (player) => {
    if (!player) return 0
    
    const mentalScores = MENTAL_NUCLEI.map(nucleus => player[nucleus] || 0)
    const validScores = mentalScores.filter(score => score > 0)
    
    if (validScores.length === 0) return 0
    
    return (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1)
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    )
  }

  return (
    <div className="player-analysis">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Player Analysis
        </h1>
        <p className="card-description" style={{ fontSize: '1.1rem' }}>
          Análise detalhada de performance mental dos jogadores
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Filtros
          </h2>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Liga</label>
            <select 
              className="select"
              value={filters.league}
              onChange={(e) => handleFilterChange('league', e.target.value)}
            >
              <option value="">Todas as ligas</option>
              {leagues.map(league => (
                <option key={league.id} value={league.name}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Posição</label>
            <select 
              className="select"
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
            >
              <option value="">Todas as posições</option>
              {POSITIONS.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Temporada</label>
            <select 
              className="select"
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
            >
              <option value="2023/24">2023/24</option>
              <option value="2022/23">2022/23</option>
              <option value="2021/22">2021/22</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Players List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <User size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Jogadores ({players.length})
            </h2>
            <p className="card-description">
              Selecione um jogador para análise detalhada
            </p>
          </div>
          
          <div style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Carregando jogadores...
              </div>
            ) : players.length > 0 ? (
              players.map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                  onClick={() => handlePlayerSelect(player)}
                  style={{
                    border: selectedPlayer?.id === player.id ? '2px solid #3b82f6' : undefined,
                    background: selectedPlayer?.id === player.id ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-info">
                        {player.position} • {player.team_name} • {player.league_name}
                      </div>
                    </div>
                    <div className="player-score">
                      {calculateOverallScore(player)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                Nenhum jogador encontrado com os filtros selecionados
              </div>
            )}
          </div>
        </div>

        {/* Player Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <BarChart3 size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Análise Detalhada
            </h2>
            <p className="card-description">
              {selectedPlayer ? `Perfil mental de ${selectedPlayer.name}` : 'Selecione um jogador para ver a análise'}
            </p>
          </div>
          
          {selectedPlayer ? (
            <div>
              {/* Player Info */}
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {selectedPlayer.name}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                  <span>{selectedPlayer.position}</span>
                  <span>•</span>
                  <span>{selectedPlayer.team_name}</span>
                  <span>•</span>
                  <span>{selectedPlayer.league_name}</span>
                  <span>•</span>
                  <span>{selectedPlayer.nationality}</span>
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#10b981'
                }}>
                  Overall Score: {calculateOverallScore(selectedPlayer)}
                </div>
              </div>

              {/* Mental Nuclei Radar Chart */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#ffffff' }}>
                  Mental Performance Nuclei
                </h4>
                <PlayerRadarChart data={getMentalNucleiData(selectedPlayer)} />
              </div>

              {/* Individual Metrics */}
              <div>
                <h4 style={{ marginBottom: '1rem', color: '#ffffff' }}>
                  Individual Metrics
                </h4>
                <PlayerMetricsChart data={getIndividualMetricsData(selectedPlayer)} />
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#64748b', 
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Search size={48} style={{ opacity: 0.5 }} />
              <p>Selecione um jogador da lista para ver sua análise detalhada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerAnalysis

