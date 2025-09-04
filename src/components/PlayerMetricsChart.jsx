import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const PlayerMetricsChart = ({ data }) => {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '6px',
          padding: '0.75rem',
          color: '#ffffff'
        }}>
          <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
            {label}
          </p>
          <p style={{ color: '#3b82f6' }}>
            Value: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155"
            strokeWidth={1}
          />
          <XAxis 
            dataKey="metric" 
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 10 
            }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 11 
            }}
            label={{ 
              value: 'Score (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#94a3b8' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PlayerMetricsChart

