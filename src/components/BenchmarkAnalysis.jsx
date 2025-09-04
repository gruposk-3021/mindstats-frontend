import React, { useState, useEffect } from 'react'
import { TrendingUp, Target, Award, AlertTriangle, Info } from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'

const BenchmarkAnalysis = ({ players, benchmarks, metrics }) => {
  const [analysisData, setAnalysisData] = useState([])
  const [performanceInsights, setPerformanceInsights] = useState([])
  const [selectedMetric, setSelectedMetric] = useState(metrics[0] || '')
  const [comparisonType, setComparisonType] = useState('position') // position, league, overall

  // Cores para diferentes tipos de performance
  const performanceColors = {
    excellent: '#10b981',    // Verde
    good: '#3b82f6',        // Azul
    average: '#f59e0b',     // Amarelo
    below: '#ef4444'        // Vermelho
  }

  useEffect(() => {
    if (players.length > 0 && benchmarks.length > 0 && selectedMetric) {
      prepareAnalysisData()
      generatePerformanceInsights()
    }
  }, [players, benchmarks, selectedMetric, comparisonType])

  const prepareAnalysisData = () => {
    const metricBenchmark = benchmarks.find(b => b.metric === selectedMetric)
    if (!metricBenchmark) return

    const analysisResults = players.map(player => {
      const playerMetric = player.metrics?.find(m => m.metric_code === selectedMetric)
      const playerValue = playerMetric?.value || 0

      // Encontrar benchmark relevante baseado no tipo de comparação
      let benchmarkValue = 0
      let benchmarkLabel = ''

      if (comparisonType === 'position') {
        const positionBenchmark = metricBenchmark.benchmarks?.find(b => b.position === player.position)
        benchmarkValue = positionBenchmark?.benchmark_value || 0
        benchmarkLabel = `${player.position} Average`
      } else if (comparisonType === 'league') {
        const leagueBenchmark = metricBenchmark.benchmarks?.find(b => b.league_name === player.league_name)
        benchmarkValue = leagueBenchmark?.benchmark_value || 0
        benchmarkLabel = `${player.league_name} Average`
      } else {
        // Overall average
        const allBenchmarks = metricBenchmark.benchmarks || []
        benchmarkValue = allBenchmarks.length > 0 
          ? allBenchmarks.reduce((sum, b) => sum + b.benchmark_value, 0) / allBenchmarks.length 
          : 0
        benchmarkLabel = 'Overall Average'
      }

      const difference = playerValue - benchmarkValue
      const percentageDiff = benchmarkValue > 0 ? (difference / benchmarkValue) * 100 : 0

      // Classificar performance
      let performanceLevel = 'average'
      if (percentageDiff > 15) performanceLevel = 'excellent'
      else if (percentageDiff > 5) performanceLevel = 'good'
      else if (percentageDiff < -10) performanceLevel = 'below'

      return {
        id: player.id,
        name: player.name,
        position: player.position,
        team: player.team_name,
        league: player.league_name,
        playerValue,
        benchmarkValue,
        difference,
        percentageDiff,
        performanceLevel,
        benchmarkLabel
      }
    })

    // Ordenar por diferença (melhor performance primeiro)
    analysisResults.sort((a, b) => b.difference - a.difference)

    setAnalysisData(analysisResults)
  }

  const generatePerformanceInsights = () => {
    if (analysisData.length === 0) return

    const insights = []

    // Top performer
    const topPerformer = analysisData[0]
    if (topPerformer.difference > 0) {
      insights.push({
        type: 'success',
        title: 'Top Performer',
        description: `${topPerformer.name} exceeds ${topPerformer.benchmarkLabel} by ${topPerformer.difference.toFixed(1)} points (${topPerformer.percentageDiff.toFixed(1)}%)`,
        player: topPerformer.name,
        value: topPerformer.difference
      })
    }

    // Players above benchmark
    const aboveBenchmark = analysisData.filter(p => p.difference > 0)
    insights.push({
      type: 'info',
      title: 'Above Benchmark',
      description: `${aboveBenchmark.length} out of ${analysisData.length} players perform above their respective benchmarks`,
      count: aboveBenchmark.length,
      total: analysisData.length
    })

    // Biggest improvement opportunity
    const worstPerformer = analysisData[analysisData.length - 1]
    if (worstPerformer.difference < -5) {
      insights.push({
        type: 'warning',
        title: 'Improvement Opportunity',
        description: `${worstPerformer.name} is ${Math.abs(worstPerformer.difference).toFixed(1)} points below ${worstPerformer.benchmarkLabel}`,
        player: worstPerformer.name,
        value: Math.abs(worstPerformer.difference)
      })
    }

    // Position analysis
    const positionGroups = {}
    analysisData.forEach(player => {
      if (!positionGroups[player.position]) {
        positionGroups[player.position] = []
      }
      positionGroups[player.position].push(player)
    })

    const bestPosition = Object.entries(positionGroups).reduce((best, [position, players]) => {
      const avgDiff = players.reduce((sum, p) => sum + p.difference, 0) / players.length
      return avgDiff > (best.avgDiff || -Infinity) ? { position, avgDiff, count: players.length } : best
    }, {})

    if (bestPosition.position) {
      insights.push({
        type: 'info',
        title: 'Best Position Group',
        description: `${bestPosition.position} players average +${bestPosition.avgDiff.toFixed(1)} points above benchmark`,
        position: bestPosition.position,
        value: bestPosition.avgDiff
      })
    }

    setPerformanceInsights(insights)
  }

  const getMetricDisplayName = (metric) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getPerformanceIcon = (level) => {
    switch (level) {
      case 'excellent': return <Award size={16} style={{ color: performanceColors.excellent }} />
      case 'good': return <TrendingUp size={16} style={{ color: performanceColors.good }} />
      case 'average': return <Target size={16} style={{ color: performanceColors.average }} />
      case 'below': return <AlertTriangle size={16} style={{ color: performanceColors.below }} />
      default: return <Info size={16} />
    }
  }

  const renderBenchmarkChart = () => {
    const chartData = analysisData.map(player => ({
      name: player.name.split(' ').slice(-1)[0], // Último nome para economizar espaço
      fullName: player.name,
      playerValue: player.playerValue,
      benchmarkValue: player.benchmarkValue,
      difference: player.difference,
      performanceLevel: player.performanceLevel
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'playerValue') return [`${value.toFixed(1)}%`, 'Player Value']
              if (name === 'benchmarkValue') return [`${value.toFixed(1)}%`, 'Benchmark']
              return [value, name]
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `${payload[0].payload.fullName}`
              }
              return label
            }}
          />
          <Legend />
          
          {/* Linha de referência para o benchmark médio */}
          <ReferenceLine 
            y={analysisData.length > 0 ? analysisData.reduce((sum, p) => sum + p.benchmarkValue, 0) / analysisData.length : 0} 
            stroke="#6b7280" 
            strokeDasharray="5 5"
            label="Avg Benchmark"
          />
          
          <Bar dataKey="benchmarkValue" name="Benchmark" fill="#6b7280" opacity={0.6} />
          <Bar dataKey="playerValue" name="Player Value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={performanceColors[entry.performanceLevel]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (!players.length || !benchmarks.length) {
    return (
      <div className="empty-state">
        <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>No benchmark data available</p>
      </div>
    )
  }

  return (
    <div className="benchmark-analysis">
      {/* Controls */}
      <div className="analysis-controls" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          <div className="filter-group">
            <label className="filter-label">Metric</label>
            <select 
              className="select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metrics.map(metric => (
                <option key={metric} value={metric}>
                  {getMetricDisplayName(metric)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Comparison Type</label>
            <select 
              className="select"
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
            >
              <option value="position">vs Position Average</option>
              <option value="league">vs League Average</option>
              <option value="overall">vs Overall Average</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Performance Legend</label>
            <div className="performance-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: performanceColors.excellent }}></div>
                <span>Excellent (+15%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: performanceColors.good }}></div>
                <span>Good (+5%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: performanceColors.average }}></div>
                <span>Average (±5%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: performanceColors.below }}></div>
                <span>Below (-10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="performance-insights" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Performance Insights</h3>
        <div className="insights-grid">
          {performanceInsights.map((insight, index) => (
            <div key={index} className={`insight-card insight-${insight.type}`}>
              <div className="insight-header">
                <h4>{insight.title}</h4>
                {insight.type === 'success' && <Award size={20} style={{ color: performanceColors.excellent }} />}
                {insight.type === 'warning' && <AlertTriangle size={20} style={{ color: performanceColors.below }} />}
                {insight.type === 'info' && <Info size={20} style={{ color: performanceColors.good }} />}
              </div>
              <p>{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            {getMetricDisplayName(selectedMetric)} - Benchmark Comparison
          </h2>
          <p className="card-description">
            Player performance vs {comparisonType} benchmarks
          </p>
        </div>
        
        {renderBenchmarkChart()}
      </div>

      {/* Detailed Analysis Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Detailed Analysis</h2>
        </div>
        
        <div className="table-wrapper">
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Position</th>
                <th>Team</th>
                <th>Player Value</th>
                <th>Benchmark</th>
                <th>Difference</th>
                <th>% Difference</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((player, index) => (
                <tr key={player.id} className={`performance-${player.performanceLevel}`}>
                  <td className="rank-cell">
                    <span className={`rank-badge rank-${index + 1}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="player-name">{player.name}</td>
                  <td>{player.position}</td>
                  <td>{player.team}</td>
                  <td className="value-cell">
                    <strong>{player.playerValue.toFixed(1)}%</strong>
                  </td>
                  <td className="benchmark-cell">
                    {player.benchmarkValue.toFixed(1)}%
                  </td>
                  <td className={`difference-cell ${player.difference >= 0 ? 'positive' : 'negative'}`}>
                    {player.difference >= 0 ? '+' : ''}{player.difference.toFixed(1)}
                  </td>
                  <td className={`percentage-cell ${player.percentageDiff >= 0 ? 'positive' : 'negative'}`}>
                    {player.percentageDiff >= 0 ? '+' : ''}{player.percentageDiff.toFixed(1)}%
                  </td>
                  <td className="performance-cell">
                    <div className="performance-indicator">
                      {getPerformanceIcon(player.performanceLevel)}
                      <span className={`performance-label performance-${player.performanceLevel}`}>
                        {player.performanceLevel.charAt(0).toUpperCase() + player.performanceLevel.slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Summary Statistics</h2>
        </div>
        
        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-value">
              {analysisData.filter(p => p.performanceLevel === 'excellent').length}
            </div>
            <div className="stat-label">Excellent Performers</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {analysisData.filter(p => p.difference > 0).length}
            </div>
            <div className="stat-label">Above Benchmark</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {analysisData.length > 0 ? (analysisData.reduce((sum, p) => sum + p.difference, 0) / analysisData.length).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">Average Difference</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {analysisData.length > 0 ? Math.max(...analysisData.map(p => p.difference)).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">Best Performance</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenchmarkAnalysis

