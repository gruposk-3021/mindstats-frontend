import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts'

const PlayerRadarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#64748b'
      }}>
        Dados não disponíveis
      </div>
    )
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid 
            stroke="#334155" 
            strokeWidth={1}
          />
          <PolarAngleAxis 
            dataKey="nucleus" 
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 11,
              fontWeight: 500
            }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ 
              fill: '#64748b', 
              fontSize: 10 
            }}
            tickCount={6}
          />
          <Radar
            name="Mental Performance"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ 
              fill: '#3b82f6', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 4
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PlayerRadarChart

