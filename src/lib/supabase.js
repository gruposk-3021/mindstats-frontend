import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// IMPORTANTE: Substitua pelas suas credenciais reais
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções utilitárias para o banco de dados
export const db = {
  // Buscar todos os jogadores com informações de time e liga
  async getPlayers(filters = {}) {
    try {
      let query = supabase
        .from('players')
        .select(`
          id,
          name,
          position,
          nationality,
          date_of_birth,
          player_team_seasons!inner (
            season,
            jersey_number,
            teams!inner (
              id,
              name,
              short_name,
              city,
              leagues!inner (
                id,
                name,
                country,
                season
              )
            )
          )
        `)
        .eq('is_active', true)
      
      // Aplicar filtros se fornecidos
      if (filters.league) {
        query = query.eq('player_team_seasons.teams.leagues.name', filters.league)
      }
      
      if (filters.position) {
        query = query.eq('position', filters.position)
      }
      
      if (filters.season) {
        query = query.eq('player_team_seasons.season', filters.season)
      } else {
        // Padrão para temporada atual
        query = query.eq('player_team_seasons.season', '2023/24')
      }
      
      const { data, error } = await query.order('name')
      
      if (error) {
        console.error('Erro ao buscar jogadores:', error)
        throw error
      }
      
      // Transformar os dados para um formato mais simples
      const players = data?.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        date_of_birth: player.date_of_birth,
        team_name: player.player_team_seasons[0]?.teams?.name || 'N/A',
        team_short_name: player.player_team_seasons[0]?.teams?.short_name || 'N/A',
        league_name: player.player_team_seasons[0]?.teams?.leagues?.name || 'N/A',
        league_country: player.player_team_seasons[0]?.teams?.leagues?.country || 'N/A',
        season: player.player_team_seasons[0]?.season || '2023/24',
        jersey_number: player.player_team_seasons[0]?.jersey_number || null
      })) || []
      
      return players
    } catch (error) {
      console.error('Erro na função getPlayers:', error)
      return []
    }
  },

  // Buscar jogadores com informações de time (versão simplificada)
  async getPlayersWithTeams() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          name,
          position,
          nationality,
          player_team_seasons!inner (
            season,
            teams!inner (
              name,
              leagues!inner (
                name,
                country
              )
            )
          )
        `)
        .eq('is_active', true)
        .eq('player_team_seasons.season', '2023/24')
        .order('name')
      
      if (error) throw error
      
      return data?.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        team_name: player.player_team_seasons[0]?.teams?.name || 'N/A',
        league_name: player.player_team_seasons[0]?.teams?.leagues?.name || 'N/A'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar jogadores com times:', error)
      return []
    }
  },

  // Buscar jogador específico por ID
  async getPlayerById(playerId) {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          name,
          position,
          nationality,
          date_of_birth,
          player_team_seasons!inner (
            season,
            jersey_number,
            teams!inner (
              name,
              short_name,
              leagues!inner (
                name,
                country
              )
            )
          )
        `)
        .eq('id', playerId)
        .eq('is_active', true)
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        name: data.name,
        position: data.position,
        nationality: data.nationality,
        date_of_birth: data.date_of_birth,
        team_name: data.player_team_seasons[0]?.teams?.name || 'N/A',
        league_name: data.player_team_seasons[0]?.teams?.leagues?.name || 'N/A'
      }
    } catch (error) {
      console.error('Erro ao buscar jogador:', error)
      return null
    }
  },

  // Buscar métricas de um jogador
  async getPlayerMetrics(playerId, season = '2023/24') {
    try {
      const { data, error } = await supabase
        .from('player_individual_metrics')
        .select(`
          value,
          percentile,
          individual_metrics_definitions!inner (
            code,
            name,
            description,
            unit
          )
        `)
        .eq('player_id', playerId)
        .eq('season', season)
      
      if (error) throw error
      
      return data?.map(metric => ({
        metric_code: metric.individual_metrics_definitions.code,
        metric_name: metric.individual_metrics_definitions.name,
        description: metric.individual_metrics_definitions.description,
        unit: metric.individual_metrics_definitions.unit,
        value: metric.value,
        percentile: metric.percentile
      })) || []
    } catch (error) {
      console.error('Erro ao buscar métricas do jogador:', error)
      return []
    }
  },

  // Buscar núcleos mentais de um jogador
  async getPlayerMentalNuclei(playerId, season = '2023/24') {
    try {
      const { data, error } = await supabase
        .from('player_mental_nuclei')
        .select(`
          value,
          percentile,
          mental_nuclei_definitions!inner (
            code,
            name,
            description
          )
        `)
        .eq('player_id', playerId)
        .eq('season', season)
      
      if (error) throw error
      
      return data?.map(nucleus => ({
        nucleus_code: nucleus.mental_nuclei_definitions.code,
        nucleus_name: nucleus.mental_nuclei_definitions.name,
        description: nucleus.mental_nuclei_definitions.description,
        value: nucleus.value,
        percentile: nucleus.percentile
      })) || []
    } catch (error) {
      console.error('Erro ao buscar núcleos mentais do jogador:', error)
      return []
    }
  },

  // Buscar ligas disponíveis
  async getLeagues() {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name, country, country_code, season')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar ligas:', error)
      return []
    }
  },

  // Buscar times disponíveis
  async getTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          short_name,
          city,
          leagues!inner (
            name,
            country
          )
        `)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      
      return data?.map(team => ({
        id: team.id,
        name: team.name,
        short_name: team.short_name,
        city: team.city,
        league_name: team.leagues.name,
        league_country: team.leagues.country
      })) || []
    } catch (error) {
      console.error('Erro ao buscar times:', error)
      return []
    }
  },

  // Buscar definições dos núcleos mentais
  async getMentalNucleiDefinitions() {
    try {
      const { data, error } = await supabase
        .from('mental_nuclei_definitions')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar definições dos núcleos mentais:', error)
      return []
    }
  },

  // Buscar definições das métricas individuais
  async getIndividualMetricsDefinitions() {
    try {
      const { data, error } = await supabase
        .from('individual_metrics_definitions')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar definições das métricas individuais:', error)
      return []
    }
  },

  // Buscar benchmarks por posição
  async getPositionBenchmarks(metric, season = '2023/24') {
    try {
      const { data, error } = await supabase
        .from('position_benchmarks')
        .select('*')
        .eq('metric_id', metric)
        .eq('season', season)
        .eq('metric_type', 'individual')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar benchmarks por posição:', error)
      return []
    }
  },

  // Buscar estatísticas do dashboard
  async getDashboardStats() {
    try {
      // Total de jogadores
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total de ligas únicas (sem duplicatas por temporada)
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('name, country')
        .eq('is_active', true)
      
      const uniqueLeagues = new Set(leaguesData?.map(l => `${l.name}-${l.country}`) || [])
      const leaguesCount = uniqueLeagues.size

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

  // Buscar top performers (simulado com base nas métricas)
  async getTopPerformers(limit = 10) {
    try {
      // Buscar jogadores com suas métricas médias
      const { data, error } = await supabase
        .from('player_individual_metrics')
        .select(`
          player_id,
          value,
          players!inner (
            name,
            position,
            player_team_seasons!inner (
              teams!inner (
                name,
                leagues!inner (
                  name
                )
              )
            )
          )
        `)
        .eq('season', '2023/24')
        .limit(limit * 10) // Buscar mais dados para calcular médias
      
      if (error) throw error
      
      // Agrupar por jogador e calcular média
      const playerStats = {}
      data?.forEach(metric => {
        const playerId = metric.player_id
        if (!playerStats[playerId]) {
          playerStats[playerId] = {
            id: playerId,
            name: metric.players.name,
            position: metric.players.position,
            team_name: metric.players.player_team_seasons[0]?.teams?.name || 'N/A',
            league_name: metric.players.player_team_seasons[0]?.teams?.leagues?.name || 'N/A',
            values: [],
            overall_mental_score: 0
          }
        }
        playerStats[playerId].values.push(metric.value)
      })
      
      // Calcular médias e ordenar
      const topPerformers = Object.values(playerStats)
        .map(player => ({
          ...player,
          overall_mental_score: player.values.reduce((sum, val) => sum + val, 0) / player.values.length
        }))
        .sort((a, b) => b.overall_mental_score - a.overall_mental_score)
        .slice(0, limit)
      
      return topPerformers
    } catch (error) {
      console.error('Erro ao buscar top performers:', error)
      return []
    }
  },

  // Buscar dados para visualizações
  async getVisualizationData(metric, position = null, league = null) {
    try {
      let query = supabase
        .from('player_individual_metrics')
        .select(`
          value,
          players!inner (
            name,
            position,
            player_team_seasons!inner (
              teams!inner (
                leagues!inner (
                  name
                )
              )
            )
          ),
          individual_metrics_definitions!inner (
            code
          )
        `)
        .eq('individual_metrics_definitions.code', metric)
        .eq('season', '2023/24')
      
      if (position) {
        query = query.eq('players.position', position)
      }
      
      if (league) {
        query = query.eq('players.player_team_seasons.teams.leagues.name', league)
      }
      
      const { data, error } = await query.order('value', { ascending: false })
      
      if (error) throw error
      
      return data?.map(item => ({
        name: item.players.name,
        position: item.players.position,
        league_name: item.players.player_team_seasons[0]?.teams?.leagues?.name || 'N/A',
        [metric]: item.value
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de visualização:', error)
      return []
    }
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

