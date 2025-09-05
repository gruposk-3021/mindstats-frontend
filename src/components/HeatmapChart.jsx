import React from 'react'

const HeatmapChart = ({ data, metricName }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#64748b'
      }}>
        Nenhum dado disponível para heatmap
      </div>
    )
  }

  // Encontrar valores min e max para normalização
  const values = data.map(d => d.value).filter(v => v > 0)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue

  // Função para obter cor baseada no valor
  const getColor = (value) => {
    if (value === 0) return '#1e293b' // Cor para sem dados
    
    const normalized = range > 0 ? (value - minValue) / range : 0.5
    
    // Gradiente de azul (baixo) para verde (alto)
    if (normalized < 0.5) {
      const intensity = normalized * 2
      return `rgb(${Math.round(59 * (1 - intensity) + 16 * intensity)}, ${Math.round(130 * (1 - intensity) + 185 * intensity)}, ${Math.round(246 * (1 - intensity) + 129 * intensity)})`
    } else {
      const intensity = (normalized - 0.5) * 2
      return `rgb(${Math.round(16 * (1 - intensity) + 34 * intensity)}, ${Math.round(185 * (1 - intensity) + 197 * intensity)}, ${Math.round(129 * (1 - intensity) + 94 * intensity)})`
    }
  }

  // Organizar posições em uma grade
  const positionGrid = [
    ['', 'ST', ''],
    ['LW', 'AM', 'RW'],
    ['', 'CM', ''],
    ['', 'DM', ''],
    ['LB', 'CB', 'RB'],
    ['', 'GK', '']
  ]

  return (
    <div style={{ height: '400px', width: '100%', padding: '1rem' }}>
      {/* Grid do campo */}
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(6, 1fr)',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        height: '300px',
        marginBottom: '1rem'
      }}>
        {positionGrid.flat().map((position, index) => {
          if (!position) {
            return <div key={index} />
          }
          
          const positionData = data.find(d => d.position === position)
          const value = positionData?.value || 0
          const count = positionData?.count || 0
          
          return (
            <div
              key={index}
              style={{
                background: getColor(value),
                border: '1px solid rgba(51, 65, 85, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
              }}
              title={`${position}: ${value.toFixed(1)}% (${count} jogadores)`}
            >
              <div>{position}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {value.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                ({count})
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            {metricName} por Posição:
          </span>
        </div>
        
        {/* Barra de gradiente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {minValue.toFixed(1)}%
          </span>
          <div style={{
            width: '200px',
            height: '20px',
            background: `linear-gradient(to right, 
              rgb(59, 130, 246), 
              rgb(16, 185, 129), 
              rgb(34, 197, 94))`,
            borderRadius: '4px',
            border: '1px solid rgba(51, 65, 85, 0.3)'
          }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {maxValue.toFixed(1)}%
          </span>
        </div>
        
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#64748b', 
          marginTop: '0.5rem' 
        }}>
          Números entre parênteses indicam quantidade de jogadores por posição
        </div>
      </div>
    </div>
  )
}

export default HeatmapChart

