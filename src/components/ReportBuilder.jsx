import React, { useState, useEffect, useRef } from 'react'
import { db } from '../lib/supabase'
import { 
  Users, BarChart3, Settings, Download, FileText, 
  Plus, X, Check, Filter, TrendingUp, Target,
  ChevronRight, ChevronDown, Search, Star
} from 'lucide-react'

const ReportBuilder = () => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState(1)
  const [reportConfig, setReportConfig] = useState({
    title: 'Player Comparison Report',
    season: '2023/24',
    comparisonType: 'radar',
    includeMentalNuclei: true,
    includeBenchmarks: true
  })
  
  // Estados de dados
  const [players, setPlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [availableMetrics, setAvailableMetrics] = useState([])
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [mentalNuclei, setMentalNuclei] = useState([])
  const [selectedNuclei, setSelectedNuclei] = useState([])
  
  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPosition, setFilterPosition] = useState('')
  const [filterLeague, setFilterLeague] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  
  // Referências
  const chartRef = useRef(null)
  
  const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']
  const seasons = ['2023/24', '2022/23', '2021/22']
  const comparisonTypes = [
    { value: 'radar', label: 'Radar Chart', icon: TrendingUp },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'table', label: 'Table View', icon: FileText }
  ]

  const steps = [
    { id: 1, title: 'Configuration', icon: Settings, description: 'Set up report parameters' },
    { id: 2, title: 'Select Players', icon: Users, description: 'Choose players to compare' },
    { id: 3, title: 'Choose Metrics', icon: Target, description: 'Select performance metrics' },
    { id: 4, title: 'Generate Report', icon: BarChart3, description: 'View and export results' }
  ]

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recarregar jogadores quando filtros mudarem
  useEffect(() => {
    if (!loading) {
      loadPlayers()
    }
  }, [reportConfig.season, filterPosition, filterLeague])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [playersData, metricsData, nucleiData] = await Promise.all([
        db.getPlayers({ season: reportConfig.season }),
        db.getIndividualMetricsDefinitions(),
        db.getMentalNucleiDefinitions()
      ])
      
      setPlayers(playersData)
      setAvailableMetrics(metricsData)
      setMentalNuclei(nucleiData)
      
      // Selecionar métricas padrão
      if (metricsData.length > 0) {
        setSelectedMetrics(metricsData.slice(0, 6))
      }
      
      // Selecionar núcleos padrão
      if (nucleiData.length > 0) {
        setSelectedNuclei(nucleiData.slice(0, 4))
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Verifique a conexão.')
    } finally {
      setLoading(false)
    }
  }

  const loadPlayers = async () => {
    try {
      const filters = {
        season: reportConfig.season,
        position: filterPosition,
        league: filterLeague
      }
      const playersData = await db.getPlayers(filters)
      setPlayers(playersData)
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err)
    }
  }

  const handleConfigChange = (key, value) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePlayerToggle = (player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id)
      if (isSelected) {
        return prev.filter(p => p.id !== player.id)
      } else if (prev.length < 6) {
        return [...prev, player]
      }
      return prev
    })
  }

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => {
      const isSelected = prev.find(m => m.id === metric.id)
      if (isSelected) {
        return prev.filter(m => m.id !== metric.id)
      } else if (prev.length < 10) {
        return [...prev, metric]
      }
      return prev
    })
  }

  const handleNucleusToggle = (nucleus) => {
    setSelectedNuclei(prev => {
      const isSelected = prev.find(n => n.id === nucleus.id)
      if (isSelected) {
        return prev.filter(n => n.id !== nucleus.id)
      } else {
        return [...prev, nucleus]
      }
    })
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const canProceedToStep = (step) => {
    switch (step) {
      case 2: return true
      case 3: return selectedPlayers.length > 0
      case 4: return selectedPlayers.length > 0 && (selectedMetrics.length > 0 || selectedNuclei.length > 0)
      default: return true
    }
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100
    }
    return value
  }

  const clearAll = () => {
    setSelectedPlayers([])
    setSelectedMetrics(availableMetrics.slice(0, 6))
    setSelectedNuclei(mentalNuclei.slice(0, 4))
    setCurrentStep(1)
    setSearchTerm('')
    setFilterPosition('')
    setFilterLeague('')
  }

  const exportReport = async () => {
    setIsExporting(true)
    // Simular exportação
    setTimeout(() => {
      setIsExporting(false)
      alert('Relatório exportado com sucesso!')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando Report Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Report Builder</h1>
          <p className="text-gray-400">Crie relatórios comparativos interativos entre jogadores</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <X size={16} />
            Clear All
          </button>
          <button
            onClick={exportReport}
            disabled={!canProceedToStep(4) || isExporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const canAccess = canProceedToStep(step.id)
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canAccess && setCurrentStep(step.id)}
                  disabled={!canAccess}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : canAccess
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-slate-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-blue-700' : isCompleted ? 'bg-green-700' : 'bg-slate-600'
                  }`}>
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <ChevronRight size={20} className="text-gray-600 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        {/* Step 1: Configuration */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={24} className="text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Report Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Report Title</label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter report title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Season</label>
                <select
                  value={reportConfig.season}
                  onChange={(e) => handleConfigChange('season', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Comparison Type</label>
                <select
                  value={reportConfig.comparisonType}
                  onChange={(e) => handleConfigChange('comparisonType', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {comparisonTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Options</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeMentalNuclei}
                      onChange={(e) => handleConfigChange('includeMentalNuclei', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">Include Mental Nuclei</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeBenchmarks}
                      onChange={(e) => handleConfigChange('includeBenchmarks', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">Include Benchmarks</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                Next: Select Players
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Players */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={24} className="text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Select Players</h2>
                <span className="text-sm text-gray-400">({selectedPlayers.length}/6)</span>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-lg">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>

              <select
                value={filterLeague}
                onChange={(e) => setFilterLeague(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Leagues</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Bundesliga">Bundesliga</option>
                <option value="Serie A">Serie A</option>
                <option value="Ligue 1">Ligue 1</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Players */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Available Players</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredPlayers.map(player => {
                    const isSelected = selectedPlayers.find(p => p.id === player.id)
                    const canSelect = selectedPlayers.length < 6 || isSelected
                    
                    return (
                      <div
                        key={player.id}
                        onClick={() => canSelect && handlePlayerToggle(player)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
                            : canSelect
                            ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 hover:border-slate-500'
                            : 'bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-white">{player.name}</h4>
                            <p className="text-sm text-gray-400">
                              {player.position} • {player.team_name} • {player.league_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && <Check size={16} className="text-green-400" />}
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">
                                {formatValue(Math.random() * 100)}
                              </div>
                              <p className="text-xs text-gray-500">Overall</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Players */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Selected Players</h3>
                <div className="space-y-2">
                  {selectedPlayers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No players selected</p>
                      <p className="text-sm">Choose up to 6 players for comparison</p>
                    </div>
                  ) : (
                    selectedPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-white flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              {player.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {player.position} • {player.team_name}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePlayerToggle(player)}
                            className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                          >
                            <X size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={selectedPlayers.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                Next: Choose Metrics
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Metrics */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Target size={24} className="text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Choose Metrics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Individual Metrics</h3>
                  <span className="text-sm text-gray-400">({selectedMetrics.length}/10)</span>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableMetrics.map(metric => {
                    const isSelected = selectedMetrics.find(m => m.id === metric.id)
                    const canSelect = selectedMetrics.length < 10 || isSelected
                    
                    return (
                      <div
                        key={metric.id}
                        onClick={() => canSelect && handleMetricToggle(metric)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-green-600/20 border-green-500/50'
                            : canSelect
                            ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700'
                            : 'bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{metric.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{metric.description}</p>
                          </div>
                          {isSelected && <Check size={16} className="text-green-400 ml-2" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mental Nuclei */}
              {reportConfig.includeMentalNuclei && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Mental Nuclei</h3>
                    <span className="text-sm text-gray-400">({selectedNuclei.length})</span>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {mentalNuclei.map(nucleus => {
                      const isSelected = selectedNuclei.find(n => n.id === nucleus.id)
                      
                      return (
                        <div
                          key={nucleus.id}
                          onClick={() => handleNucleusToggle(nucleus)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500/50'
                              : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{nucleus.name}</h4>
                              <p className="text-sm text-gray-400 mt-1">{nucleus.description}</p>
                            </div>
                            {isSelected && <Check size={16} className="text-purple-400 ml-2" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                disabled={selectedMetrics.length === 0 && selectedNuclei.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                Generate Report
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generate Report */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Report Preview</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportReport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Download size={16} />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm text-gray-400">Players</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedPlayers.length}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-green-400" />
                  <span className="text-sm text-gray-400">Metrics</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedMetrics.length}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-purple-400" />
                  <span className="text-sm text-gray-400">Mental Nuclei</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedNuclei.length}</div>
              </div>
            </div>

            {/* Chart Preview */}
            <div ref={chartRef} className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Comparison Chart</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Chart will be generated here</p>
                  <p className="text-sm">Based on selected players and metrics</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Create New Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportBuilder

