import React, { useState, useEffect } from 'react'
import { BarChart3, Scatter, Filter, TrendingUp } from 'lucide-react'
import { db, POSITIONS, INDIVIDUAL_METRICS } from '../lib/supabase'
import BeeswarmChart from './BeeswarmChart'
import HeatmapChart from './HeatmapChart'

const Visualizations = () => {
  const [leagues, setLeagues] = useState([])
  const [visualizationData, setVisualizationData] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Filtros
  const [filters, setFilters] = useState({
    league: '',
    position: '',
    metric: 'controlled_reception_rate'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadVisualizationData()
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

  const loadVisualizationData = async () => {
    try {
      setLoading(true)
      
      // Dados para beeswarm plot
      const beeswarmData = await db.getVisualizationData(
        filters.metric,
        filters.position || null,
        filters.league || null
      )
      
      setVisualizationData(beeswarmData)
      
      // Dados para heatmap (sempre por posição)
      const allPositionsData = await Promise.all(
        POSITIONS.map(async (position) => {
          const positionData = await db.getVisualizationData(
            filters.metric,
            position,
            filters.league || null
          )
          
          const avgValue = positionData.length > 0 
            ? positionData.reduce((sum, player) => sum + (player[filters.metric] || 0), 0) / positionData.length
            : 0
          
          return {
            position,
            metric: filters.metric,
            value: avgValue,
            count: positionData.length
          }
        })
      )
      
      setHeatmapData(allPositionsData)
      
    } catch (err) {
      console.error('Erro ao carregar dados de visualização:', err)
      setError('Erro ao carregar dados de visualização')
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

  const getMetricDisplayName = (metric) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    )
  }

  return (
    <div className="visualizations">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Visualizations
        </h1>
        <p className="card-description" style={{ fontSize: '1.1rem' }}>
          Análises visuais avançadas de performance mental
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Filtros de Visualização
          </h2>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Métrica</label>
            <select 
              className="select"
              value={filters.metric}
              onChange={(e) => handleFilterChange('metric', e.target.value)}
            >
              {INDIVIDUAL_METRICS.map(metric => (
                <option key={metric} value={metric}>
                  {getMetricDisplayName(metric)}
                </option>
              ))}
            </select>
          </div>
          
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
            <label className="filter-label">Posição (Beeswarm)</label>
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
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Beeswarm Plot */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Scatter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Beeswarm Plot
            </h2>
            <p className="card-description">
              Distribuição de {getMetricDisplayName(filters.metric)} 
              {filters.position && ` para ${filters.position}`}
              {filters.league && ` na ${filters.league}`}
            </p>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Carregando dados...
            </div>
          ) : (
            <BeeswarmChart 
              data={visualizationData} 
              metric={filters.metric}
              metricName={getMetricDisplayName(filters.metric)}
            />
          )}
        </div>

        {/* Heatmap */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <BarChart3 size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Position Heatmap
            </h2>
            <p className="card-description">
              Média de {getMetricDisplayName(filters.metric)} por posição
              {filters.league && ` na ${filters.league}`}
            </p>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Carregando dados...
            </div>
          ) : (
            <HeatmapChart 
              data={heatmapData}
              metricName={getMetricDisplayName(filters.metric)}
            />
          )}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Estatísticas da Visualização
          </h2>
        </div>
        
        {visualizationData.length > 0 && (
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-value">
                {visualizationData.length}
              </div>
              <div className="stat-label">Jogadores</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">
                {Math.max(...visualizationData.map(p => p[filters.metric] || 0)).toFixed(1)}
              </div>
              <div className="stat-label">Valor Máximo</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">
                {(visualizationData.reduce((sum, p) => sum + (p[filters.metric] || 0), 0) / visualizationData.length).toFixed(1)}
              </div>
              <div className="stat-label">Média</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">
                {Math.min(...visualizationData.map(p => p[filters.metric] || 0)).toFixed(1)}
              </div>
              <div className="stat-label">Valor Mínimo</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Visualizations

