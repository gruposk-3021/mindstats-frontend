import React, { useState, useEffect } from 'react'
import { BarChart3, Radar, Table, TrendingUp, Users } from 'lucide-react'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar as RechartsRadar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

const ComparisonView = ({ players, metrics, comparisonType, includeNuclei }) => {
  const [chartData, setChartData] = useState([])
  const [tableData, setTableData] = useState([])
  const [nucleiData, setNucleiData] = useState([])
  const [activeView, setActiveView] = useState(comparisonType || 'radar')

  // Cores para os jogadores
  const playerColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'
  ]

  useEffect(() => {
    prepareChartData()
    prepareTableData()
    if (includeNuclei) {
      prepareNucleiData()
    }
  }, [players, metrics, includeNuclei])

  const prepareChartData = () => {
    if (!players.length || !metrics.length) return

    // Preparar dados para radar chart
    const radarData = metrics.map(metric => {
      const dataPoint = {
        metric: getMetricDisplayName(metric),
        fullName: metric
      }
      
      players.forEach((player, index) => {
        const metricValue = player.metrics?.find(m => m.metric_code === metric)?.value || 0
        dataPoint[`player_${index}`] = metricValue
        dataPoint[`${player.name}`] = metricValue
      })
      
      return dataPoint
    })

    setChartData(radarData)
  }

  const prepareTableData = () => {
    if (!players.length || !metrics.length) return

    const tableRows = players.map(player => {
      const row = {
        id: player.id,
        name: player.name,
        position: player.position,
        team: player.team_name,
        league: player.league_name
      }
      
      metrics.forEach(metric => {
        const metricValue = player.metrics?.find(m => m.metric_code === metric)?.value || 0
        row[metric] = metricValue
      })
      
      return row
    })

    setTableData(tableRows)
  }

  const prepareNucleiData = () => {
    if (!players.length || !includeNuclei) return

    // Preparar dados dos núcleos mentais
    const nucleiMetrics = [
      'adaptation_learning',
      'decision_making', 
      'pressure_management',
      'creativity_risk',
      'resilience_recovery',
      'tactical_discipline',
      'technical_consistency',
      'mental_agility'
    ]

    const nucleiChartData = nucleiMetrics.map(nucleus => {
      const dataPoint = {
        nucleus: getNucleusDisplayName(nucleus),
        fullName: nucleus
      }
      
      players.forEach((player, index) => {
        const nucleusValue = player.nuclei?.find(n => n.nucleus_code === nucleus)?.value || 0
        dataPoint[`player_${index}`] = nucleusValue
        dataPoint[`${player.name}`] = nucleusValue
      })
      
      return dataPoint
    })

    setNucleiData(nucleiChartData)
  }

  const getMetricDisplayName = (metric) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getNucleusDisplayName = (nucleus) => {
    const names = {
      adaptation_learning: 'Adaptation & Learning',
      decision_making: 'Decision Making',
      pressure_management: 'Pressure Management',
      creativity_risk: 'Creativity & Risk',
      resilience_recovery: 'Resilience & Recovery',
      tactical_discipline: 'Tactical Discipline',
      technical_consistency: 'Technical Consistency',
      mental_agility: 'Mental Agility'
    }
    return names[nucleus] || nucleus
  }

  const calculatePlayerAverage = (player) => {
    if (!player.metrics || player.metrics.length === 0) return 0
    
    const relevantMetrics = player.metrics.filter(m => metrics.includes(m.metric_code))
    if (relevantMetrics.length === 0) return 0
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0)
    return (sum / relevantMetrics.length).toFixed(1)
  }

  const getPlayerRank = (player) => {
    const averages = players.map(p => ({
      id: p.id,
      average: parseFloat(calculatePlayerAverage(p))
    }))
    
    averages.sort((a, b) => b.average - a.average)
    return averages.findIndex(p => p.id === player.id) + 1
  }

  const renderRadarChart = (data, title) => (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12 }}
            className="radar-axis"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fontSize: 10 }}
          />
          {players.map((player, index) => (
            <RechartsRadar
              key={player.id}
              name={player.name}
              dataKey={`player_${index}`}
              stroke={playerColors[index]}
              fill={playerColors[index]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Tooltip 
            formatter={(value, name) => [`${value}%`, name]}
            labelFormatter={(label) => `Metric: ${label}`}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderBarChart = (data, title) => (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="metric" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value, name) => [`${value}%`, name]}
          />
          <Legend />
          {players.map((player, index) => (
            <Bar
              key={player.id}
              dataKey={`player_${index}`}
              name={player.name}
              fill={playerColors[index]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderTableView = () => (
    <div className="table-container">
      <h3 className="chart-title">Detailed Comparison Table</h3>
      <div className="table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Team</th>
              <th>League</th>
              <th>Average</th>
              <th>Rank</th>
              {metrics.map(metric => (
                <th key={metric}>{getMetricDisplayName(metric)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              const player = players.find(p => p.id === row.id)
              const average = calculatePlayerAverage(player)
              const rank = getPlayerRank(player)
              
              return (
                <tr key={row.id}>
                  <td className="player-name">
                    <div 
                      className="player-color-indicator"
                      style={{ backgroundColor: playerColors[index] }}
                    />
                    {row.name}
                  </td>
                  <td>{row.position}</td>
                  <td>{row.team}</td>
                  <td>{row.league}</td>
                  <td className="average-cell">
                    <strong>{average}%</strong>
                  </td>
                  <td className="rank-cell">
                    <span className={`rank-badge rank-${rank}`}>
                      #{rank}
                    </span>
                  </td>
                  {metrics.map(metric => (
                    <td key={metric} className="metric-cell">
                      {row[metric]?.toFixed(1) || '0.0'}%
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const viewOptions = [
    { id: 'radar', name: 'Radar Chart', icon: Radar },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'table', name: 'Table View', icon: Table }
  ]

  if (!players.length) {
    return (
      <div className="empty-state">
        <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>No players selected for comparison</p>
      </div>
    )
  }

  return (
    <div className="comparison-view">
      {/* View Selector */}
      <div className="view-selector" style={{ marginBottom: '2rem' }}>
        <div className="view-tabs">
          {viewOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                className={`view-tab ${activeView === option.id ? 'active' : ''}`}
                onClick={() => setActiveView(option.id)}
              >
                <Icon size={16} style={{ marginRight: '0.5rem' }} />
                {option.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Player Summary */}
      <div className="players-summary" style={{ marginBottom: '2rem' }}>
        <h3>Comparing {players.length} Players</h3>
        <div className="players-list">
          {players.map((player, index) => (
            <div key={player.id} className="player-summary-card">
              <div 
                className="player-color"
                style={{ backgroundColor: playerColors[index] }}
              />
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-details">
                  {player.position} • {player.team_name}
                </div>
                <div className="player-stats">
                  Avg: {calculatePlayerAverage(player)}% • Rank: #{getPlayerRank(player)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Comparison */}
      <div className="comparison-charts">
        {activeView === 'radar' && renderRadarChart(chartData, 'Individual Metrics Comparison')}
        {activeView === 'bar' && renderBarChart(chartData, 'Individual Metrics Comparison')}
        {activeView === 'table' && renderTableView()}
      </div>

      {/* Mental Nuclei Comparison */}
      {includeNuclei && nucleiData.length > 0 && activeView !== 'table' && (
        <div className="nuclei-comparison" style={{ marginTop: '3rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Mental Nuclei Comparison
              </h2>
              <p className="card-description">
                Comparison of mental performance nuclei
              </p>
            </div>
            
            {activeView === 'radar' && renderRadarChart(nucleiData, 'Mental Nuclei')}
            {activeView === 'bar' && renderBarChart(nucleiData, 'Mental Nuclei')}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="comparison-insights" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Key Insights</h2>
          </div>
          
          <div className="insights-grid">
            {/* Top Performer */}
            <div className="insight-card">
              <h4>Top Performer</h4>
              <div className="insight-content">
                {(() => {
                  const topPlayer = players.reduce((top, player) => {
                    const avg = parseFloat(calculatePlayerAverage(player))
                    const topAvg = parseFloat(calculatePlayerAverage(top))
                    return avg > topAvg ? player : top
                  })
                  return (
                    <div>
                      <strong>{topPlayer.name}</strong>
                      <br />
                      Average: {calculatePlayerAverage(topPlayer)}%
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Most Consistent */}
            <div className="insight-card">
              <h4>Most Consistent</h4>
              <div className="insight-content">
                {(() => {
                  const consistentPlayer = players.reduce((most, player) => {
                    const playerMetrics = player.metrics?.filter(m => metrics.includes(m.metric_code)) || []
                    const values = playerMetrics.map(m => m.value)
                    const variance = values.length > 0 ? 
                      values.reduce((sum, val) => sum + Math.pow(val - values.reduce((a, b) => a + b, 0) / values.length, 2), 0) / values.length : 
                      Infinity
                    
                    const mostMetrics = most.metrics?.filter(m => metrics.includes(m.metric_code)) || []
                    const mostValues = mostMetrics.map(m => m.value)
                    const mostVariance = mostValues.length > 0 ? 
                      mostValues.reduce((sum, val) => sum + Math.pow(val - mostValues.reduce((a, b) => a + b, 0) / mostValues.length, 2), 0) / mostValues.length : 
                      Infinity
                    
                    return variance < mostVariance ? player : most
                  })
                  return (
                    <div>
                      <strong>{consistentPlayer.name}</strong>
                      <br />
                      Low variance across metrics
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Best in Category */}
            <div className="insight-card">
              <h4>Highest Single Metric</h4>
              <div className="insight-content">
                {(() => {
                  let bestMetric = { player: null, metric: '', value: 0 }
                  
                  players.forEach(player => {
                    const playerMetrics = player.metrics?.filter(m => metrics.includes(m.metric_code)) || []
                    playerMetrics.forEach(metric => {
                      if (metric.value > bestMetric.value) {
                        bestMetric = {
                          player: player.name,
                          metric: getMetricDisplayName(metric.metric_code),
                          value: metric.value
                        }
                      }
                    })
                  })
                  
                  return (
                    <div>
                      <strong>{bestMetric.player}</strong>
                      <br />
                      {bestMetric.metric}: {bestMetric.value.toFixed(1)}%
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="insight-card">
              <h4>Comparison Summary</h4>
              <div className="insight-content">
                <div>
                  <strong>{players.length}</strong> players compared
                  <br />
                  <strong>{metrics.length}</strong> metrics analyzed
                  <br />
                  {includeNuclei && <span><strong>8</strong> mental nuclei included</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonView

 
