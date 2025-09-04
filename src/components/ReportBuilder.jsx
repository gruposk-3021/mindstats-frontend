import React, { useState, useEffect } from 'react'
import { Users, BarChart3, Download, Plus, X, TrendingUp, Target, Zap } from 'lucide-react'
import { db, POSITIONS, INDIVIDUAL_METRICS } from '../lib/supabase'
import PlayerSelector from './PlayerSelector'
import MetricSelector from './MetricSelector'
import ComparisonView from './ComparisonView'
import BenchmarkAnalysis from './BenchmarkAnalysis'

const ReportBuilder = () => {
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [selectedMetrics, setSelectedMetrics] = useState(['controlled_reception_rate', 'decision_latency', 'threat_added'])
  const [comparisonData, setComparisonData] = useState([])
  const [benchmarkData, setBenchmarkData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('selection')
  const [reportConfig, setReportConfig] = useState({
    title: 'Player Comparison Report',
    season: '2023/24',
    includeNuclei: true,
    includeBenchmarks: true,
    comparisonType: 'radar' // radar, bar, table
  })

  useEffect(() => {
    if (selectedPlayers.length > 0 && selectedMetrics.length > 0) {
      loadComparisonData()
    }
  }, [selectedPlayers, selectedMetrics, reportConfig.season])

  const loadComparisonData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados dos jogadores selecionados
      const playersData = await Promise.all(
        selectedPlayers.map(async (playerId) => {
          const playerInfo = await db.getPlayerById(playerId)
          const playerMetrics = await db.getPlayerMetrics(playerId, reportConfig.season)
          const playerNuclei = await db.getPlayerMentalNuclei(playerId, reportConfig.season)
          
          return {
            ...playerInfo,
            metrics: playerMetrics,
            nuclei: playerNuclei
          }
        })
      )

      setComparisonData(playersData)

      // Carregar benchmarks se habilitado
      if (reportConfig.includeBenchmarks) {
        const benchmarks = await Promise.all(
          selectedMetrics.map(async (metric) => {
            const positionBenchmarks = await db.getPositionBenchmarks(metric, reportConfig.season)
            return {
              metric,
              benchmarks: positionBenchmarks
            }
          })
        )
        setBenchmarkData(benchmarks)
      }

    } catch (err) {
      console.error('Erro ao carregar dados de comparação:', err)
      setError('Erro ao carregar dados de comparação')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerAdd = (player) => {
    if (selectedPlayers.length >= 6) {
      alert('Máximo de 6 jogadores para comparação')
      return
    }
    
    if (!selectedPlayers.includes(player.id)) {
      setSelectedPlayers([...selectedPlayers, player.id])
    }
  }

  const handlePlayerRemove = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
  }

  const handleMetricToggle = (metric) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
      }
    } else {
      if (selectedMetrics.length < 10) {
        setSelectedMetrics([...selectedMetrics, metric])
      }
    }
  }

  const handleExportReport = async () => {
    try {
      setLoading(true)
      
      // Preparar dados para exportação
      const reportData = {
        config: reportConfig,
        players: comparisonData,
        metrics: selectedMetrics,
        benchmarks: benchmarkData,
        generatedAt: new Date().toISOString()
      }

      // Gerar PDF (implementar depois)
      console.log('Exportando relatório:', reportData)
      alert('Funcionalidade de exportação será implementada na próxima fase')
      
    } catch (err) {
      console.error('Erro ao exportar relatório:', err)
      setError('Erro ao exportar relatório')
    } finally {
      setLoading(false)
    }
  }

  const getMetricDisplayName = (metric) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const tabs = [
    { id: 'selection', name: 'Player Selection', icon: Users },
    { id: 'metrics', name: 'Metrics', icon: Target },
    { id: 'comparison', name: 'Comparison', icon: BarChart3 },
    { id: 'benchmarks', name: 'Benchmarks', icon: TrendingUp }
  ]

  return (
    <div className="report-builder">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Report Builder
            </h1>
            <p className="card-description" style={{ fontSize: '1.1rem' }}>
              Crie relatórios comparativos interativos entre jogadores
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedPlayers([])
                setSelectedMetrics(['controlled_reception_rate', 'decision_latency', 'threat_added'])
                setComparisonData([])
                setBenchmarkData([])
              }}
            >
              Clear All
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleExportReport}
              disabled={selectedPlayers.length === 0 || loading}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Report Configuration</h2>
        </div>
        
        <div className="grid grid-4" style={{ gap: '1rem' }}>
          <div className="filter-group">
            <label className="filter-label">Report Title</label>
            <input 
              type="text"
              className="input"
              value={reportConfig.title}
              onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Season</label>
            <select 
              className="select"
              value={reportConfig.season}
              onChange={(e) => setReportConfig({...reportConfig, season: e.target.value})}
            >
              <option value="2023/24">2023/24</option>
              <option value="2022/23">2022/23</option>
              <option value="2021/22">2021/22</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Comparison Type</label>
            <select 
              className="select"
              value={reportConfig.comparisonType}
              onChange={(e) => setReportConfig({...reportConfig, comparisonType: e.target.value})}
            >
              <option value="radar">Radar Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="table">Table View</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  checked={reportConfig.includeNuclei}
                  onChange={(e) => setReportConfig({...reportConfig, includeNuclei: e.target.checked})}
                />
                Include Mental Nuclei
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  checked={reportConfig.includeBenchmarks}
                  onChange={(e) => setReportConfig({...reportConfig, includeBenchmarks: e.target.checked})}
                />
                Include Benchmarks
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} style={{ marginRight: '0.5rem' }} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'selection' && (
          <div className="grid grid-2" style={{ gap: '2rem' }}>
            {/* Player Selector */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Users size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Select Players
                </h2>
                <p className="card-description">
                  Choose up to 6 players for comparison
                </p>
              </div>
              
              <PlayerSelector 
                onPlayerSelect={handlePlayerAdd}
                selectedPlayers={selectedPlayers}
                maxPlayers={6}
              />
            </div>

            {/* Selected Players */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Selected Players ({selectedPlayers.length}/6)
                </h2>
              </div>
              
              {selectedPlayers.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No players selected</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Use the selector to add players for comparison
                  </p>
                </div>
              ) : (
                <div className="selected-players">
                  {comparisonData.map((player, index) => (
                    <div key={player.id} className="selected-player-card">
                      <div className="player-info">
                        <div className="player-name">{player.name}</div>
                        <div className="player-details">
                          {player.position} • {player.team_name}
                        </div>
                      </div>
                      
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handlePlayerRemove(player.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Target size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Select Metrics
              </h2>
              <p className="card-description">
                Choose metrics for comparison (1-10 metrics)
              </p>
            </div>
            
            <MetricSelector 
              selectedMetrics={selectedMetrics}
              onMetricToggle={handleMetricToggle}
              maxMetrics={10}
            />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div>
            {selectedPlayers.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No players selected for comparison</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Go to Player Selection tab to add players
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="card">
                <div className="loading">
                  <div className="spinner"></div>
                  Loading comparison data...
                </div>
              </div>
            ) : (
              <ComparisonView 
                players={comparisonData}
                metrics={selectedMetrics}
                comparisonType={reportConfig.comparisonType}
                includeNuclei={reportConfig.includeNuclei}
              />
            )}
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div>
            {!reportConfig.includeBenchmarks ? (
              <div className="card">
                <div className="empty-state">
                  <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Benchmarks disabled</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Enable benchmarks in Report Configuration
                  </p>
                </div>
              </div>
            ) : selectedPlayers.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No players selected</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Select players to see benchmark analysis
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="card">
                <div className="loading">
                  <div className="spinner"></div>
                  Loading benchmark data...
                </div>
              </div>
            ) : (
              <BenchmarkAnalysis 
                players={comparisonData}
                benchmarks={benchmarkData}
                metrics={selectedMetrics}
              />
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error" style={{ marginTop: '2rem' }}>
          {error}
        </div>
      )}

      {/* Summary Stats */}
      {selectedPlayers.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              <Zap size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Report Summary
            </h2>
          </div>
          
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-value">{selectedPlayers.length}</div>
              <div className="stat-label">Players Selected</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{selectedMetrics.length}</div>
              <div className="stat-label">Metrics Selected</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{reportConfig.season}</div>
              <div className="stat-label">Season</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">
                {reportConfig.includeNuclei ? 'Yes' : 'No'}
              </div>
              <div className="stat-label">Mental Nuclei</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportBuilder

