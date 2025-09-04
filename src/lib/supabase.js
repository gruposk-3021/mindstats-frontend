import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// IMPORTANTE: Substitua pelas suas credenciais reais
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções utilitárias para o banco de dados
export const db = {
  // Buscar todos os jogadores com filtros
  async getPlayers(filters = {}) {
    let query = supabase
      .from('player_complete_profile')
      .select('*')
    
    if (filters.league) {
      query = query.eq('league_name', filters.league)
    }
    
    if (filters.position) {
      query = query.eq('position', filters.position)
    }
    
    if (filters.season) {
      query = query.eq('season', filters.season)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) throw error
    return data || []
  },

  // Buscar jogador específico
  async getPlayer(playerId) {
    const { data, error } = await supabase
      .from('player_complete_profile')
      .select('*')
      .eq('id', playerId)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar top performers
  async getTopPerformers(limit = 10) {
    const { data, error } = await supabase
      .from('top_performers')
      .select('*')
      .order('overall_mental_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Buscar ligas disponíveis
  async getLeagues() {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Buscar definições dos núcleos mentais
  async getMentalNucleiDefinitions() {
    const { data, error } = await supabase
      .from('mental_nuclei_definitions')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Buscar definições das métricas individuais
  async getIndividualMetricsDefinitions() {
    const { data, error } = await supabase
      .from('individual_metrics_definitions')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Buscar benchmarks por posição
  async getPositionBenchmarks(position, league = null, season = '2023/24') {
    let query = supabase
      .from('position_benchmarks')
      .select('*')
      .eq('position', position)
      .eq('season', season)
    
    if (league) {
      query = query.eq('league_id', league)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  // Buscar estatísticas do dashboard
  async getDashboardStats() {
    try {
      // Total de jogadores
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total de ligas
      const { count: leaguesCount } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total de times
      const { count: teamsCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Métricas processadas
      const { count: metricsCount } = await supabase
        .from('player_individual_metrics')
        .select('*', { count: 'exact', head: true })

      return {
        players: playersCount || 0,
        leagues: leaguesCount || 0,
        teams: teamsCount || 0,
        metrics: metricsCount || 0
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        players: 0,
        leagues: 0,
        teams: 0,
        metrics: 0
      }
    }
  },

  // Buscar dados para visualizações
  async getVisualizationData(metric, position = null, league = null) {
    let query = supabase
      .from('player_complete_profile')
      .select(`name, position, league_name, ${metric}`)
      .not(metric, 'is', null)
    
    if (position) {
      query = query.eq('position', position)
    }
    
    if (league) {
      query = query.eq('league_name', league)
    }
    
    const { data, error } = await query.order(metric, { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Constantes úteis
export const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

export const MENTAL_NUCLEI = [
  'adaptation_learning',
  'attention_perception', 
  'collective_integration',
  'decision_judgment',
  'energy_management',
  'initiative_risk',
  'resilience_recovery',
  'self_regulation_discipline'
]

export const INDIVIDUAL_METRICS = [
  'controlled_reception_rate',
  'under_pressure_control',
  'decision_latency',
  'choice_accuracy',
  'threat_added',
  'dribble_success',
  'recovery_speed',
  'error_bounce_back',
  'press_synchrony',
  'fouls_per_90'
]

// Funções necessárias para o Report Builder
export const db = {
  // ... funções existentes ...
  
  // Novas funções necessárias:
  getPlayerById: async (playerId) => { /* implementar */ },
  getPlayersWithTeams: async () => { /* implementar */ },
  getPlayerMetrics: async (playerId, season) => { /* implementar */ },
  getPlayerMentalNuclei: async (playerId, season) => { /* implementar */ },
  getPositionBenchmarks: async (metric, season) => { /* implementar */ }
}
