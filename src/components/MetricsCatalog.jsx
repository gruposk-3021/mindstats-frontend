import React, { useState, useEffect } from 'react'
import { Brain, BarChart3, Info, Search } from 'lucide-react'
import { db } from '../lib/supabase'

const MetricsCatalog = () => {
  const [mentalNuclei, setMentalNuclei] = useState([])
  const [individualMetrics, setIndividualMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('nuclei')

  useEffect(() => {
    loadMetricsData()
  }, [])

  const loadMetricsData = async () => {
    try {
      setLoading(true)
      const [nucleiData, metricsData] = await Promise.all([
        db.getMentalNucleiDefinitions(),
        db.getIndividualMetricsDefinitions()
      ])
      
      setMentalNuclei(nucleiData)
      setIndividualMetrics(metricsData)
    } catch (err) {
      console.error('Erro ao carregar métricas:', err)
      setError('Erro ao carregar catálogo de métricas')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const formatMetricName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Carregando catálogo de métricas...
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

  const filteredNuclei = filterItems(mentalNuclei, searchTerm)
  const filteredMetrics = filterItems(individualMetrics, searchTerm)

  return (
    <div className="metrics-catalog">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Metrics Catalog
        </h1>
        <p className="card-description" style={{ fontSize: '1.1rem' }}>
          Catálogo completo de métricas de performance mental
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} 
          />
          <input
            type="text"
            placeholder="Buscar métricas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
          <button
            className={`nav-tab ${activeTab === 'nuclei' ? 'active' : ''}`}
            onClick={() => setActiveTab('nuclei')}
            style={{ borderBottom: 'none', borderRadius: '0' }}
          >
            <Brain size={16} />
            Mental Nuclei ({filteredNuclei.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
            style={{ borderBottom: 'none', borderRadius: '0' }}
          >
            <BarChart3 size={16} />
            Individual Metrics ({filteredMetrics.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'nuclei' && (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          {filteredNuclei.map(nucleus => (
            <div key={nucleus.id} className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1.1rem'
                }}>
                  <Brain size={18} style={{ color: '#3b82f6' }} />
                  {nucleus.name}
                </h3>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                  {nucleus.description}
                </p>
              </div>
              
              {nucleus.component_metrics && nucleus.component_metrics.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontSize: '0.9rem', 
                    color: '#ffffff', 
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Métricas Componentes:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {nucleus.component_metrics.map(metric => (
                      <span
                        key={metric}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#3b82f6'
                        }}
                      >
                        {formatMetricName(metric)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Escala de valores:
                </span>
                <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '500' }}>
                  {nucleus.min_value}% - {nucleus.max_value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          {filteredMetrics.map(metric => (
            <div key={metric.id} className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1.1rem'
                }}>
                  <BarChart3 size={18} style={{ color: '#10b981' }} />
                  {metric.name}
                </h3>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                  {metric.description}
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Unidade:
                  </span>
                  <div style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '500' }}>
                    {metric.unit}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Código:
                  </span>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#3b82f6', 
                    fontFamily: 'monospace',
                    fontWeight: '500'
                  }}>
                    {metric.code}
                  </div>
                </div>
              </div>
              
              {metric.provider_mapping && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    fontSize: '0.9rem', 
                    color: '#ffffff', 
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Mapeamento de Provedores:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {Object.entries(metric.provider_mapping).map(([provider, field]) => (
                      <div key={provider} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}>
                        <span style={{ color: '#94a3b8' }}>{provider}:</span>
                        <span style={{ 
                          color: '#3b82f6', 
                          fontFamily: 'monospace' 
                        }}>
                          {field}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ 
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Escala de valores:
                </span>
                <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '500' }}>
                  {metric.min_value}% - {metric.max_value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'nuclei' && filteredNuclei.length === 0) || 
        (activeTab === 'metrics' && filteredMetrics.length === 0)) && (
        <div style={{ 
          textAlign: 'center', 
          color: '#64748b', 
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Info size={48} style={{ opacity: 0.5 }} />
          <p>
            {searchTerm 
              ? `Nenhuma métrica encontrada para "${searchTerm}"`
              : 'Nenhuma métrica disponível'
            }
          </p>
          {searchTerm && (
            <button 
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MetricsCatalog

