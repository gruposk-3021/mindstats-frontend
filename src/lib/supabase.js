import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


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

// Funções utilitárias para o banco de dados
export const db = {
  // Buscar todos os jogadores (versão simplificada que funciona)
  async getPlayers(filters = {}) {
    try {
      console.log('Buscando jogadores com filtros:', filters)
      
      // Primeiro, buscar jogadores básicos
      let playersQuery = supabase
        .from('players')
        .select('id, name, position, nationality, date_of_birth')
        .eq('is_active', true)
      
      if (filters.position) {
        playersQuery = playersQuery.eq('position', filters.position)
      }
      
      const { data: playersData, error: playersError } = await playersQuery.order('name')
      
      if (playersError) {
        console.error('Erro ao buscar jogadores:', playersError)
        throw playersError
      }
      
      console.log('Jogadores encontrados:', playersData?.length || 0)
      
      if (!playersData || playersData.length === 0) {
        return []
      }
      
      // Para cada jogador, buscar informações de time e liga
      const playersWithTeams = await Promise.all(
        playersData.map(async (player) => {
          try {
            // Buscar temporada do jogador
            const { data: seasonData } = await supabase
              .from('player_team_seasons')
              .select(`
                season,
                jersey_number,
                team_id,
                league_id
              `)
              .eq('player_id', player.id)
              .eq('season', filters.season || '2023/24')
              .eq('is_active', true)
              .single()
            
            let teamName = 'N/A'
            let leagueName = 'N/A'
            
            if (seasonData) {
              // Buscar nome do time
              const { data: teamData } = await supabase
                .from('teams')
                .select('name, short_name')
                .eq('id', seasonData.team_id)
                .single()
              
              if (teamData) {
                teamName = teamData.name
              }
              
              // Buscar nome da liga
              const { data: leagueData } = await supabase
                .from('leagues')
                .select('name, country')
                .eq('id', seasonData.league_id)
                .single()
              
              if (leagueData) {
                leagueName = leagueData.name
              }
            }
            
            return {
              id: player.id,
              name: player.name,
              position: player.position,
              nationality: player.nationality,
              date_of_birth: player.date_of_birth,
              team_name: teamName,
              league_name: leagueName,
              season: seasonData?.season || filters.season || '2023/24',
              jersey_number: seasonData?.jersey_number || null
            }
          } catch (error) {
            console.error(`Erro ao buscar dados do jogador ${player.name}:`, error)
            return {
              id: player.id,
              name: player.name,
              position: player.position,
              nationality: player.nationality,
              date_of_birth: player.date_of_birth,
              team_name: 'N/A',
              league_name: 'N/A',
              season: filters.season || '2023/24',
              jersey_number: null
            }
          }
        })
      )
      
      // Aplicar filtros de liga se necessário
      let filteredPlayers = playersWithTeams
      
      if (filters.league) {
        filteredPlayers = playersWithTeams.filter(player => 
          player.league_name === filters.league
        )
      }
      
      console.log('Jogadores após filtros:', filteredPlayers.length)
      return filteredPlayers
      
    } catch (error) {
      console.error('Erro na função getPlayers:', error)
      return []
    }
  },

  // Buscar jogadores de forma mais simples (fallback)
  async getPlayersSimple() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position, nationality')
        .eq('is_active', true)
        .order('name')
        .limit(50)
      
      if (error) throw error
      
      return data?.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        team_name: 'N/A',
        league_name: 'N/A',
        season: '2023/24'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar jogadores simples:', error)
      return []
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
          metric_id
        `)
        .eq('player_id', playerId)
        .eq('season', season)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        return []
      }
      
      // Buscar definições das métricas
      const metricsWithDefinitions = await Promise.all(
        data.map(async (metric) => {
          const { data: definition } = await supabase
            .from('individual_metrics_definitions')
            .select('code, name, description, unit')
            .eq('id', metric.metric_id)
            .single()
          
          return {
            metric_code: definition?.code || 'unknown',
            metric_name: definition?.name || 'Unknown Metric',
            description: definition?.description || '',
            unit: definition?.unit || '%',
            value: metric.value,
            percentile: metric.percentile
          }
        })
      )
      
      return metricsWithDefinitions
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
          nucleus_id
        `)
        .eq('player_id', playerId)
        .eq('season', season)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        return []
      }
      
      // Buscar definições dos núcleos
      const nucleiWithDefinitions = await Promise.all(
        data.map(async (nucleus) => {
          const { data: definition } = await supabase
            .from('mental_nuclei_definitions')
            .select('code, name, description')
            .eq('id', nucleus.nucleus_id)
            .single()
          
          return {
            nucleus_code: definition?.code || 'unknown',
            nucleus_name: definition?.name || 'Unknown Nucleus',
            description: definition?.description || '',
            value: nucleus.value,
            percentile: nucleus.percentile
          }
        })
      )
      
      return nucleiWithDefinitions
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

  // Buscar ligas únicas (sem duplicatas por temporada)
  async getUniqueLeagues() {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('name, country')
        .eq('is_active', true)
      
      if (error) throw error
      
      // Remover duplicatas
      const uniqueLeagues = []
      const seen = new Set()
      
      data?.forEach(league => {
        const key = `${league.name}-${league.country}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueLeagues.push(league)
        }
      })
      
      return uniqueLeagues.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erro ao buscar ligas únicas:', error)
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

  // Buscar estatísticas do dashboard
  async getDashboardStats() {
    try {
      // Total de jogadores
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total de ligas únicas
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

  // Função de teste para verificar conectividade
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Erro de conexão:', error)
        return false
      }
      
      console.log('Conexão com Supabase OK')
      return true
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
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

