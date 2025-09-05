import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Check } from 'lucide-react'
import { db, POSITIONS } from '../lib/supabase'

const PlayerSelector = ({ onPlayerSelect, selectedPlayers, maxPlayers = 6 }) => {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [filters, setFilters] = useState({
    search: '',
    league: '',
    team: '',
    position: '',
    season: '2023/24'
  })
  
  const [leagues, setLeagues] = useState([])
  const [teams, setTeams] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [players, filters])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Carregar jogadores
      const playersData = await db.getPlayersWithTeams()
      setPlayers(playersData)
      
      // Carregar ligas
      const leaguesData = await db.getLeagues()
      setLeagues(leaguesData)
      
      // Carregar times
      const teamsData = await db.getTeams()
      setTeams(teamsData)
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados dos jogadores')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...players]

    // Filtro de busca por nome
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por liga
    if (filters.league) {
      filtered = filtered.filter(player => 
        player.league_name === filters.league
      )
    }

    // Filtro por time
    if (filters.team) {
      filtered = filtered.filter(player => 
        player.team_name === filters.team
      )
    }

    // Filtro por posição
    if (filters.position) {
      filtered = filtered.filter(player => 
        player.position === filters.position
      )
    }

    // Ordenar por nome
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    setFilteredPlayers(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset team filter when league changes
      ...(key === 'league' && { team: '' })
    }))
  }

  const getAvailableTeams = () => {
    if (!filters.league) return teams
    
    return teams.filter(team => {
      const league = leagues.find(l => l.name === filters.league)
      return league && team.league_id === league.id
    })
  }

  const isPlayerSelected = (playerId) => {
    return selectedPlayers.includes(playerId)
  }

  const canSelectMore = () => {
    return selectedPlayers.length < maxPlayers
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    )
  }

  return (
    <div className="player-selector">
      {/* Filters */}
      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        {/* Search */}
        <div className="filter-group">
          <label className="filter-label">Search Player</label>
          <div className="input-with-icon">
            <Search size={16} className="input-icon" />
            <input 
              type="text"
              className="input"
              placeholder="Type player name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* League Filter */}
        <div className="filter-group">
          <label className="filter-label">League</label>
          <select 
            className="select"
            value={filters.league}
            onChange={(e) => handleFilterChange('league', e.target.value)}
          >
            <option value="">All Leagues</option>
            {leagues.map(league => (
              <option key={league.id} value={league.name}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div className="filter-group">
          <label className="filter-label">Team</label>
          <select 
            className="select"
            value={filters.team}
            onChange={(e) => handleFilterChange('team', e.target.value)}
            disabled={!filters.league}
          >
            <option value="">All Teams</option>
            {getAvailableTeams().map(team => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position Filter */}
        <div className="filter-group">
          <label className="filter-label">Position</label>
          <select 
            className="select"
            value={filters.position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
          >
            <option value="">All Positions</option>
            {POSITIONS.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info" style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          {loading ? 'Loading...' : `${filteredPlayers.length} players found`}
        </span>
        
        {!canSelectMore() && (
          <span style={{ fontSize: '0.9rem', color: 'var(--color-warning)' }}>
            Maximum players selected ({maxPlayers})
          </span>
        )}
      </div>

      {/* Players List */}
      <div className="players-list">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading players...
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <Search size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No players found</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="players-grid">
            {filteredPlayers.map(player => {
              const isSelected = isPlayerSelected(player.id)
              const canSelect = canSelectMore() || isSelected
              
              return (
                <div 
                  key={player.id} 
                  className={`player-card ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                >
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-details">
                      <span className="position-badge">{player.position}</span>
                      <span>{player.team_name}</span>
                    </div>
                    <div className="player-meta">
                      <span>{player.league_name}</span>
                      <span>Age: {player.age}</span>
                    </div>
                  </div>
                  
                  <button 
                    className={`btn-icon ${isSelected ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => onPlayerSelect(player)}
                    disabled={!canSelect}
                  >
                    {isSelected ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="quick-filters" style={{ marginTop: '1.5rem' }}>
        <div className="quick-filters-header">
          <Filter size={16} style={{ marginRight: '0.5rem' }} />
          Quick Filters
        </div>
        
        <div className="quick-filters-buttons">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFilters({...filters, position: 'ST'})}
          >
            Strikers
          </button>
          
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFilters({...filters, position: 'CM'})}
          >
            Midfielders
          </button>
          
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFilters({...filters, position: 'CB'})}
          >
            Defenders
          </button>
          
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFilters({...filters, league: 'Premier League'})}
          >
            Premier League
          </button>
          
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFilters({
              search: '',
              league: '',
              team: '',
              position: '',
              season: '2023/24'
            })}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerSelector

 
