import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { Filter, User, TrendingUp, BarChart3, Radar } from 'lucide-react'
import PlayerRadarChart from './PlayerRadarChart'
import PlayerMetricsChart from './PlayerMetricsChart'

const PlayerAnalysis = () => {
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [playerMetrics, setPlayerMetrics] = useState([])
  const [playerNuclei, setPlayerNuclei] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPlayer, setLoadingPlayer] = useState(false)
  const [error, setError] = useState(null)
  
  // Filtros
  const [filters, setFilters] = useState({
    league: '',
    position: '',
    season: '2023/24'
  })

  const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recarregar jogadores quando filtros mudarem
  useEffect(() => {
    if (!loading) {
      loadPlayers()
    }
  }, [filters])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar ligas e jogadores em paralelo
      const [leaguesData, playersData] = await Promise.all([
        db.getUniqueLeagues(),
        db.getPlayers(filters)
      ])
      
      setLeagues(leaguesData)
      setPlayers(playersData)
      
      console.log('Dados carregados:', { leagues: leaguesData.length, players: playersData.length })
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const loadPlayers = async () => {
    try {
      setError(null)
      const playersData = await db.getPlayers(filters)
      setPlayers(playersData)
      
      // Limpar seleção se o jogador atual não estiver na nova lista
      if (selectedPlayer && !playersData.find(p => p.id === selectedPlayer.id)) {
        setSelectedPlayer(null)
        setPlayerMetrics([])
        setPlayerNuclei([])
      }
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err)
      setError('Erro ao carregar jogadores.')
    }
  }

  const handlePlayerSelect = async (player) => {
    if (selectedPlayer?.id === player.id) {
      // Se o mesmo jogador for clicado, deselecionar
      setSelectedPlayer(null)
      setPlayerMetrics([])
      setPlayerNuclei([])
      return
    }

    try {
      setLoadingPlayer(true)
      setSelectedPlayer(player)
      
      console.log('Carregando dados do jogador:', player.name)
      
      // Carregar métricas e núcleos mentais do jogador
      const [metricsData, nucleiData] = await Promise.all([
        db.getPlayerMetrics(player.id, filters.season),
        db.getPlayerMentalNuclei(player.id, filters.season)
      ])
      
      console.log('Métricas carregadas:', metricsData.length)
      console.log('Núcleos carregados:', nucleiData.length)
      
      setPlayerMetrics(metricsData)
      setPlayerNuclei(nucleiData)
      
    } catch (err) {
      console.error('Erro ao carregar dados do jogador:', err)
      setError(`Erro ao carregar dados de ${player.name}`)
    } finally {
      setLoadingPlayer(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100 // Arredondar para 2 casas decimais
    }
    return value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando análise de jogadores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Player Analysis</h1>
        <p className="text-gray-400">Análise detalhada de performance mental dos jogadores</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liga</label>
            <select
              value={filters.league}
              onChange={(e) => handleFilterChange('league', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Posição</label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Temporada</label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2023/24">2023/24</option>
              <option value="2022/23">2022/23</option>
              <option value="2021/22">2021/22</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Jogadores */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Jogadores ({players.length})
            </h2>
          </div>
          
          {players.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum jogador encontrado com os filtros selecionados</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedPlayer?.id === player.id
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg'
                      : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{player.name}</h3>
                      <p className="text-sm text-gray-400">
                        {player.position} • {player.team_name} • {player.league_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {formatValue(Math.random() * 100)} {/* Placeholder para score geral */}
                      </div>
                      <p className="text-xs text-gray-500">Score Geral</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Análise Detalhada */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Análise Detalhada</h2>
          </div>
          
          {!selectedPlayer ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Selecione um jogador da lista para ver sua análise detalhada
              </p>
            </div>
          ) : loadingPlayer ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando dados de {selectedPlayer.name}...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações do Jogador */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-2">{selectedPlayer.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Posição:</span>
                    <span className="text-white ml-2">{selectedPlayer.position}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nacionalidade:</span>
                    <span className="text-white ml-2">{selectedPlayer.nationality}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white ml-2">{selectedPlayer.team_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Liga:</span>
                    <span className="text-white ml-2">{selectedPlayer.league_name}</span>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              {playerMetrics.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Radar size={18} />
                      Radar de Métricas Individuais
                    </h4>
                    <PlayerRadarChart 
                      data={playerMetrics.map(metric => ({
                        metric: metric.metric_name,
                        value: formatValue(metric.value),
                        percentile: formatValue(metric.percentile)
                      }))}
                    />
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={18} />
                      Métricas Detalhadas
                    </h4>
                    <PlayerMetricsChart 
                      data={playerMetrics.map(metric => ({
                        name: metric.metric_name,
                        value: formatValue(metric.value),
                        percentile: formatValue(metric.percentile)
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* Núcleos Mentais */}
              {playerNuclei.length > 0 && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Núcleos Mentais</h4>
                  <div className="space-y-3">
                    {playerNuclei.map((nucleus, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-600/50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-white">{nucleus.nucleus_name}</h5>
                          <p className="text-sm text-gray-400">{nucleus.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {formatValue(nucleus.value)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatValue(nucleus.percentile)}º percentil
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {playerMetrics.length === 0 && playerNuclei.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Nenhum dado de performance encontrado para {selectedPlayer.name} na temporada {filters.season}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerAnalysis

