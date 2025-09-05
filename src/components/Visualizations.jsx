import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { BarChart3, TrendingUp, Filter, Eye } from 'lucide-react'
import BeeswarmChart from './BeeswarmChart'
import HeatmapChart from './HeatmapChart'

const Visualizations = () => {
  const [selectedMetric, setSelectedMetric] = useState('controlled_reception_rate')
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [visualizationData, setVisualizationData] = useState([])
  const [metrics, setMetrics] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedMetric) {
      loadVisualizationData()
    }
  }, [selectedMetric, selectedLeague, selectedPosition])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [metricsData, leaguesData] = await Promise.all([
        db.getIndividualMetricsDefinitions(),
        db.getUniqueLeagues()
      ])
      
      setMetrics(metricsData)
      setLeagues(leaguesData)
      
      if (metricsData.length > 0) {
        setSelectedMetric(metricsData[0].code)
      }
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar dados de visualização')
    } finally {
      setLoading(false)
    }
  }

  const loadVisualizationData = async () => {
    try {
      setError(null)
      const data = await db.getVisualizationData(selectedMetric, selectedPosition, selectedLeague)
      setVisualizationData(data)
    } catch (err) {
      console.error('Erro ao carregar dados de visualização:', err)
      setError('Erro ao carregar dados da visualização')
    }
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100
    }
    return value
  }

  const getSelectedMetricName = () => {
    const metric = metrics.find(m => m.code === selectedMetric)
    return metric ? metric.name : selectedMetric
  }

  const getPositionStats = () => {
    const stats = {}
    
    positions.forEach(position => {
      const positionData = visualizationData.filter(d => d.position === position)
      if (positionData.length > 0) {
        const values = positionData.map(d => d[selectedMetric]).filter(v => v != null)
        if (values.length > 0) {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length
          stats[position] = {
            average: formatValue(avg),
            count: values.length,
            min: formatValue(Math.min(...values)),
            max: formatValue(Math.max(...values))
          }
        }
      }
    })
    
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando visualizações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visualizations</h1>
        <p className="text-gray-400">Análise visual de métricas de performance mental</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Controles de Filtro */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Configurações de Visualização</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Métrica</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {metrics.map((metric) => (
                <option key={metric.code} value={metric.code}>
                  {metric.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liga</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as ligas</option>
              {leagues.map((league) => (
                <option key={`${league.name}-${league.country}`} value={league.name}>
                  {league.name} ({league.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Posição (Beeswarm)</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as posições</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visualizações */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Beeswarm Plot */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Beeswarm Plot</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Distribuição de {getSelectedMetricName()}
            {selectedPosition && ` para ${selectedPosition}`}
          </p>
          
          <div className="h-80">
            <BeeswarmChart 
              data={visualizationData}
              metric={selectedMetric}
              title={getSelectedMetricName()}
            />
          </div>
          
          {selectedPosition && visualizationData.length > 0 && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>{selectedPosition}:</strong> {visualizationData.length} jogador(es)
              </p>
            </div>
          )}
        </div>

        {/* Position Heatmap */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Position Heatmap</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Média de {getSelectedMetricName()} por posição
          </p>
          
          <div className="relative">
            <HeatmapChart 
              data={getPositionStats()}
              metric={selectedMetric}
              title={getSelectedMetricName()}
            />
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={20} className="text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Estatísticas por Posição</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-gray-300">Posição</th>
                <th className="text-right py-3 px-4 text-gray-300">Jogadores</th>
                <th className="text-right py-3 px-4 text-gray-300">Média</th>
                <th className="text-right py-3 px-4 text-gray-300">Mínimo</th>
                <th className="text-right py-3 px-4 text-gray-300">Máximo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(getPositionStats()).map(([position, stats]) => (
                <tr key={position} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-medium text-white">{position}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{stats.count}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-medium">
                    {stats.average}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">{stats.min}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{stats.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Object.keys(getPositionStats()).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              Nenhum dado disponível para a métrica selecionada
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Visualizations

