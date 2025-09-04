import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const BeeswarmChart = ({ data, metric, metricName }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#64748b'
      }}>
        Nenhum dado disponível para visualização
      </div>
    )
  }

  // Preparar dados para o scatter plot
  // Simular efeito beeswarm adicionando jitter no eixo Y
  const processedData = data.map((player, index) => {
    const value = player[metric] || 0
    // Adicionar jitter baseado no índice para simular beeswarm
    const jitter = (index % 20) - 10 // Varia de -10 a 10
    
    return {
      name: player.name,
      position: player.position,
      league: player.league_name,
      value: value,
      y: jitter, // Posição Y com jitter
      x: value   // Posição X é o valor da métrica
    }
  })

  // Cores por posição
  const positionColors = {
    'GK': '#ef4444',
    'CB': '#3b82f6',
    'LB': '#06b6d4',
    'RB': '#06b6d4',
    'DM': '#10b981',
    'CM': '#84cc16',
    'AM': '#f59e0b',
    'LW': '#f97316',
    'RW': '#f97316',
    'ST': '#ec4899'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '6px',
          padding: '0.75rem',
          color: '#ffffff'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            {data.name}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {data.position} • {data.league}
          </p>
          <p style={{ color: '#3b82f6', fontWeight: '500' }}>
            {metricName}: {data.value.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  // Agrupar dados por posição para múltiplas séries
  const positionGroups = {}
  processedData.forEach(player => {
    if (!positionGroups[player.position]) {
      positionGroups[player.position] = []
    }
    positionGroups[player.position].push(player)
  })

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155"
            strokeWidth={1}
          />
          <XAxis 
            type="number"
            dataKey="x"
            domain={[0, 100]}
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 11 
            }}
            label={{ 
              value: `${metricName} (%)`, 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fill: '#94a3b8' }
            }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            domain={[-15, 15]}
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {Object.entries(positionGroups).map(([position, players]) => (
            <Scatter
              key={position}
              name={position}
              data={players}
              fill={positionColors[position] || '#64748b'}
              opacity={0.7}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem', 
        marginTop: '1rem',
        justifyContent: 'center'
      }}>
        {Object.entries(positionGroups).map(([position, players]) => (
          <div key={position} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.75rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: positionColors[position] || '#64748b'
            }} />
            <span style={{ color: '#94a3b8' }}>
              {position} ({players.length})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeeswarmChart

