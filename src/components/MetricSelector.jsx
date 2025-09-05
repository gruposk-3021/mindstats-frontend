import React, { useState, useEffect } from 'react'
import { Target, Check, X, Info, Search } from 'lucide-react'
import { INDIVIDUAL_METRICS } from '../lib/supabase'

const MetricSelector = ({ selectedMetrics, onMetricToggle, maxMetrics = 10 }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [filteredMetrics, setFilteredMetrics] = useState([])

  // Definições detalhadas das métricas
  const metricDefinitions = {
    controlled_reception_rate: {
      name: 'Controlled Reception Rate',
      description: 'Taxa de recepções controladas com sucesso',
      category: 'technical',
      unit: '%',
      tooltip: 'Mede a capacidade do jogador de receber a bola de forma controlada, mantendo a posse'
    },
    under_pressure_control: {
      name: 'Under Pressure Control',
      description: 'Controle de bola sob pressão defensiva',
      category: 'mental',
      unit: '%',
      tooltip: 'Avalia como o jogador mantém o controle da bola quando pressionado por adversários'
    },
    decision_latency: {
      name: 'Decision Latency',
      description: 'Velocidade de tomada de decisão',
      category: 'mental',
      unit: '%',
      tooltip: 'Mede a rapidez com que o jogador toma decisões táticas (valores altos = decisões mais rápidas)'
    },
    choice_accuracy: {
      name: 'Choice Accuracy',
      description: 'Precisão das escolhas táticas',
      category: 'tactical',
      unit: '%',
      tooltip: 'Avalia a qualidade das decisões táticas tomadas pelo jogador'
    },
    threat_added: {
      name: 'Threat Added',
      description: 'Capacidade de adicionar ameaça ofensiva',
      category: 'offensive',
      unit: '%',
      tooltip: 'Mede a contribuição do jogador para criar situações de perigo ofensivo'
    },
    dribble_success: {
      name: 'Dribble Success',
      description: 'Taxa de sucesso em dribles',
      category: 'technical',
      unit: '%',
      tooltip: 'Percentual de dribles bem-sucedidos em relação ao total de tentativas'
    },
    recovery_speed: {
      name: 'Recovery Speed',
      description: 'Velocidade de recuperação após perda de bola',
      category: 'mental',
      unit: '%',
      tooltip: 'Rapidez com que o jogador se recupera mentalmente após perder a posse'
    },
    error_bounce_back: {
      name: 'Error Bounce Back',
      description: 'Capacidade de recuperação após erros',
      category: 'mental',
      unit: '%',
      tooltip: 'Habilidade de manter o desempenho após cometer erros'
    },
    press_synchrony: {
      name: 'Press Synchrony',
      description: 'Sincronia com pressão coletiva',
      category: 'tactical',
      unit: '%',
      tooltip: 'Coordenação do jogador com a pressão defensiva da equipe'
    },
    fouls_per_90: {
      name: 'Fouls per 90',
      description: 'Disciplina tática (menos faltas = melhor)',
      category: 'tactical',
      unit: '%',
      tooltip: 'Disciplina do jogador medida pela frequência de faltas (valores altos = menos faltas)'
    }
  }

  const categories = {
    all: { name: 'All Metrics', color: '#6b7280' },
    technical: { name: 'Technical', color: '#3b82f6' },
    mental: { name: 'Mental', color: '#8b5cf6' },
    tactical: { name: 'Tactical', color: '#10b981' },
    offensive: { name: 'Offensive', color: '#f59e0b' }
  }

  useEffect(() => {
    applyFilters()
  }, [searchTerm, categoryFilter])

  const applyFilters = () => {
    let filtered = INDIVIDUAL_METRICS.filter(metric => {
      const definition = metricDefinitions[metric]
      if (!definition) return false

      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesName = definition.name.toLowerCase().includes(searchLower)
        const matchesDescription = definition.description.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }

      // Filtro de categoria
      if (categoryFilter !== 'all' && definition.category !== categoryFilter) {
        return false
      }

      return true
    })

    setFilteredMetrics(filtered)
  }

  const isMetricSelected = (metric) => {
    return selectedMetrics.includes(metric)
  }

  const canSelectMore = () => {
    return selectedMetrics.length < maxMetrics
  }

  const getSelectedByCategory = (category) => {
    return selectedMetrics.filter(metric => {
      const definition = metricDefinitions[metric]
      return definition && definition.category === category
    }).length
  }

  const handleSelectAll = () => {
    const availableMetrics = filteredMetrics.slice(0, maxMetrics)
    availableMetrics.forEach(metric => {
      if (!isMetricSelected(metric)) {
        onMetricToggle(metric)
      }
    })
  }

  const handleDeselectAll = () => {
    filteredMetrics.forEach(metric => {
      if (isMetricSelected(metric)) {
        onMetricToggle(metric)
      }
    })
  }

  return (
    <div className="metric-selector">
      {/* Header Controls */}
      <div className="selector-controls" style={{ marginBottom: '1.5rem' }}>
        {/* Search */}
        <div className="filter-group" style={{ flex: 1 }}>
          <label className="filter-label">Search Metrics</label>
          <div className="input-with-icon">
            <Search size={16} className="input-icon" />
            <input 
              type="text"
              className="input"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select 
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {Object.entries(categories).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="filter-group">
          <label className="filter-label">Actions</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={handleSelectAll}
              disabled={!canSelectMore()}
            >
              Select All
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={handleDeselectAll}
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      <div className="selection-info" style={{ marginBottom: '1.5rem' }}>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-value">{selectedMetrics.length}</div>
            <div className="info-label">Selected</div>
          </div>
          
          <div className="info-card">
            <div className="info-value">{maxMetrics - selectedMetrics.length}</div>
            <div className="info-label">Remaining</div>
          </div>
          
          <div className="info-card">
            <div className="info-value">{filteredMetrics.length}</div>
            <div className="info-label">Available</div>
          </div>
        </div>

        {selectedMetrics.length >= maxMetrics && (
          <div className="warning-message">
            <Info size={16} style={{ marginRight: '0.5rem' }} />
            Maximum metrics selected. Deselect some to add others.
          </div>
        )}
      </div>

      {/* Category Summary */}
      <div className="category-summary" style={{ marginBottom: '1.5rem' }}>
        <div className="category-chips">
          {Object.entries(categories).slice(1).map(([key, category]) => {
            const count = getSelectedByCategory(key)
            return (
              <div 
                key={key} 
                className="category-chip"
                style={{ 
                  backgroundColor: count > 0 ? category.color + '20' : 'transparent',
                  borderColor: category.color,
                  color: category.color
                }}
              >
                <span>{category.name}</span>
                <span className="count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {filteredMetrics.length === 0 ? (
          <div className="empty-state">
            <Target size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No metrics found</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          filteredMetrics.map(metric => {
            const definition = metricDefinitions[metric]
            const isSelected = isMetricSelected(metric)
            const canSelect = canSelectMore() || isSelected
            const categoryColor = categories[definition.category]?.color || '#6b7280'

            return (
              <div 
                key={metric}
                className={`metric-card ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                onClick={() => canSelect && onMetricToggle(metric)}
              >
                <div className="metric-header">
                  <div className="metric-name">{definition.name}</div>
                  <div className="metric-actions">
                    <div 
                      className="category-indicator"
                      style={{ backgroundColor: categoryColor }}
                      title={categories[definition.category]?.name}
                    />
                    <button 
                      className={`btn-icon btn-sm ${isSelected ? 'btn-danger' : 'btn-primary'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canSelect) onMetricToggle(metric)
                      }}
                      disabled={!canSelect}
                    >
                      {isSelected ? <X size={14} /> : <Check size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="metric-description">
                  {definition.description}
                </div>
                
                <div className="metric-details">
                  <span className="metric-unit">Unit: {definition.unit}</span>
                  <span className="metric-category">{categories[definition.category]?.name}</span>
                </div>
                
                <div className="metric-tooltip">
                  <Info size={12} style={{ marginRight: '0.25rem' }} />
                  {definition.tooltip}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Selected Metrics Summary */}
      {selectedMetrics.length > 0 && (
        <div className="selected-summary" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Selected Metrics ({selectedMetrics.length})</h3>
          
          <div className="selected-metrics-list">
            {selectedMetrics.map(metric => {
              const definition = metricDefinitions[metric]
              const categoryColor = categories[definition.category]?.color || '#6b7280'
              
              return (
                <div key={metric} className="selected-metric-item">
                  <div 
                    className="category-dot"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="metric-name">{definition.name}</span>
                  <button 
                    className="btn-icon btn-sm btn-danger"
                    onClick={() => onMetricToggle(metric)}
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MetricSelector

 
