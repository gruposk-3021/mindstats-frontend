import React, { useEffect, useRef } from 'react'

const HeatmapChart = ({ data, metric, title }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return

    const positions = [
      { id: 'GK', x: 50, y: 90, label: 'GK' },
      { id: 'LB', x: 15, y: 70, label: 'LB' },
      { id: 'CB', x: 35, y: 70, label: 'CB' },
      { id: 'CB2', x: 65, y: 70, label: 'CB' },
      { id: 'RB', x: 85, y: 70, label: 'RB' },
      { id: 'DM', x: 50, y: 50, label: 'DM' },
      { id: 'CM', x: 30, y: 35, label: 'CM' },
      { id: 'CM2', x: 70, y: 35, label: 'CM' },
      { id: 'AM', x: 50, y: 25, label: 'AM' },
      { id: 'LW', x: 20, y: 15, label: 'LW' },
      { id: 'ST', x: 50, y: 10, label: 'ST' },
      { id: 'RW', x: 80, y: 15, label: 'RW' }
    ]

    const container = chartRef.current
    if (!container) return

    // Limpar conteúdo anterior
    container.innerHTML = ''

    // Criar SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '400')
    svg.setAttribute('viewBox', '0 0 400 400')
    svg.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    svg.style.borderRadius = '8px'

    // Criar campo de futebol estilizado
    const field = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    field.setAttribute('x', '20')
    field.setAttribute('y', '20')
    field.setAttribute('width', '360')
    field.setAttribute('height', '360')
    field.setAttribute('fill', 'none')
    field.setAttribute('stroke', '#475569')
    field.setAttribute('stroke-width', '2')
    field.setAttribute('stroke-dasharray', '5,5')
    field.setAttribute('rx', '10')
    svg.appendChild(field)

    // Linha do meio
    const midLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    midLine.setAttribute('x1', '20')
    midLine.setAttribute('y1', '200')
    midLine.setAttribute('x2', '380')
    midLine.setAttribute('y2', '200')
    midLine.setAttribute('stroke', '#475569')
    midLine.setAttribute('stroke-width', '1')
    midLine.setAttribute('stroke-dasharray', '3,3')
    svg.appendChild(midLine)

    // Círculo central
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    centerCircle.setAttribute('cx', '200')
    centerCircle.setAttribute('cy', '200')
    centerCircle.setAttribute('r', '30')
    centerCircle.setAttribute('fill', 'none')
    centerCircle.setAttribute('stroke', '#475569')
    centerCircle.setAttribute('stroke-width', '1')
    svg.appendChild(centerCircle)

    // Calcular valores min/max para normalização
    const values = Object.values(data).map(d => d.average).filter(v => v != null)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue

    // Função para obter cor baseada no valor
    const getColor = (value) => {
      if (range === 0) return '#3b82f6'
      
      const normalized = (value - minValue) / range
      
      if (normalized < 0.33) {
        // Vermelho para azul
        const r = Math.round(239 - (239 - 59) * (normalized / 0.33))
        const g = Math.round(68 + (130 - 68) * (normalized / 0.33))
        const b = Math.round(68 + (246 - 68) * (normalized / 0.33))
        return `rgb(${r}, ${g}, ${b})`
      } else if (normalized < 0.66) {
        // Azul para verde
        const localNorm = (normalized - 0.33) / 0.33
        const r = Math.round(59 - (59 - 16) * localNorm)
        const g = Math.round(130 + (185 - 130) * localNorm)
        const b = Math.round(246 - (246 - 129) * localNorm)
        return `rgb(${r}, ${g}, ${b})`
      } else {
        // Verde para verde claro
        const localNorm = (normalized - 0.66) / 0.34
        const r = Math.round(16 + (34 - 16) * localNorm)
        const g = Math.round(185 + (197 - 185) * localNorm)
        const b = Math.round(129 + (94 - 129) * localNorm)
        return `rgb(${r}, ${g}, ${b})`
      }
    }

    // Renderizar posições
    positions.forEach(position => {
      const positionData = data[position.label] || data[position.id]
      
      if (positionData && positionData.average != null) {
        const x = (position.x / 100) * 360 + 20
        const y = (position.y / 100) * 360 + 20
        const value = positionData.average
        const color = getColor(value)
        
        // Criar grupo para a posição
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        group.style.cursor = 'pointer'
        
        // Círculo de fundo
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        bgCircle.setAttribute('cx', x)
        bgCircle.setAttribute('cy', y)
        bgCircle.setAttribute('r', '25')
        bgCircle.setAttribute('fill', color)
        bgCircle.setAttribute('opacity', '0.8')
        bgCircle.setAttribute('stroke', '#ffffff')
        bgCircle.setAttribute('stroke-width', '2')
        group.appendChild(bgCircle)
        
        // Texto da posição
        const posText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        posText.setAttribute('x', x)
        posText.setAttribute('y', y - 2)
        posText.setAttribute('text-anchor', 'middle')
        posText.setAttribute('dominant-baseline', 'middle')
        posText.setAttribute('fill', '#ffffff')
        posText.setAttribute('font-size', '10')
        posText.setAttribute('font-weight', 'bold')
        posText.textContent = position.label
        group.appendChild(posText)
        
        // Valor
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        valueText.setAttribute('x', x)
        valueText.setAttribute('y', y + 8)
        valueText.setAttribute('text-anchor', 'middle')
        valueText.setAttribute('dominant-baseline', 'middle')
        valueText.setAttribute('fill', '#ffffff')
        valueText.setAttribute('font-size', '8')
        valueText.textContent = `${Math.round(value * 100) / 100}%`
        group.appendChild(valueText)
        
        // Número de jogadores (pequeno)
        if (positionData.count) {
          const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          countText.setAttribute('x', x + 20)
          countText.setAttribute('y', y - 20)
          countText.setAttribute('text-anchor', 'middle')
          countText.setAttribute('dominant-baseline', 'middle')
          countText.setAttribute('fill', '#94a3b8')
          countText.setAttribute('font-size', '6')
          countText.textContent = `(${positionData.count})`
          group.appendChild(countText)
        }
        
        // Efeito hover
        group.addEventListener('mouseenter', () => {
          bgCircle.setAttribute('r', '28')
          bgCircle.setAttribute('opacity', '1')
          
          // Criar tooltip
          const tooltip = document.createElement('div')
          tooltip.style.position = 'absolute'
          tooltip.style.background = 'rgba(0, 0, 0, 0.9)'
          tooltip.style.color = 'white'
          tooltip.style.padding = '8px 12px'
          tooltip.style.borderRadius = '6px'
          tooltip.style.fontSize = '12px'
          tooltip.style.pointerEvents = 'none'
          tooltip.style.zIndex = '1000'
          tooltip.style.whiteSpace = 'nowrap'
          tooltip.innerHTML = `
            <div><strong>${position.label}</strong></div>
            <div>Média: ${Math.round(value * 100) / 100}%</div>
            <div>Jogadores: ${positionData.count || 0}</div>
            ${positionData.min ? `<div>Min: ${Math.round(positionData.min * 100) / 100}%</div>` : ''}
            ${positionData.max ? `<div>Max: ${Math.round(positionData.max * 100) / 100}%</div>` : ''}
          `
          
          document.body.appendChild(tooltip)
          
          const updateTooltipPosition = (e) => {
            tooltip.style.left = (e.clientX + 10) + 'px'
            tooltip.style.top = (e.clientY - 10) + 'px'
          }
          
          group.addEventListener('mousemove', updateTooltipPosition)
          group.tooltipElement = tooltip
          group.updateTooltipPosition = updateTooltipPosition
        })
        
        group.addEventListener('mouseleave', () => {
          bgCircle.setAttribute('r', '25')
          bgCircle.setAttribute('opacity', '0.8')
          
          if (group.tooltipElement) {
            document.body.removeChild(group.tooltipElement)
            group.removeEventListener('mousemove', group.updateTooltipPosition)
            delete group.tooltipElement
            delete group.updateTooltipPosition
          }
        })
        
        svg.appendChild(group)
      }
    })

    // Adicionar legenda
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    
    // Título da legenda
    const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    legendTitle.setAttribute('x', '30')
    legendTitle.setAttribute('y', '45')
    legendTitle.setAttribute('fill', '#e2e8f0')
    legendTitle.setAttribute('font-size', '12')
    legendTitle.setAttribute('font-weight', 'bold')
    legendTitle.textContent = `${title} por Posição`
    legendGroup.appendChild(legendTitle)
    
    // Gradiente da legenda
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', 'legendGradient')
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '100%')
    gradient.setAttribute('y2', '0%')
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', '#ef4444')
    
    const stop2 = document.createElementNS('http://www.w3.o/2000/svg', 'stop')
    stop2.setAttribute('offset', '50%')
    stop2.setAttribute('stop-color', '#3b82f6')
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop3.setAttribute('offset', '100%')
    stop3.setAttribute('stop-color', '#10b981')
    
    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    gradient.appendChild(stop3)
    defs.appendChild(gradient)
    svg.appendChild(defs)
    
    // Barra da legenda
    const legendBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    legendBar.setAttribute('x', '30')
    legendBar.setAttribute('y', '55')
    legendBar.setAttribute('width', '120')
    legendBar.setAttribute('height', '8')
    legendBar.setAttribute('fill', 'url(#legendGradient)')
    legendBar.setAttribute('rx', '4')
    legendGroup.appendChild(legendBar)
    
    // Labels da legenda
    const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    minLabel.setAttribute('x', '30')
    minLabel.setAttribute('y', '75')
    minLabel.setAttribute('fill', '#94a3b8')
    minLabel.setAttribute('font-size', '10')
    minLabel.textContent = `${Math.round(minValue * 100) / 100}%`
    legendGroup.appendChild(minLabel)
    
    const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    maxLabel.setAttribute('x', '150')
    maxLabel.setAttribute('y', '75')
    maxLabel.setAttribute('fill', '#94a3b8')
    maxLabel.setAttribute('font-size', '10')
    maxLabel.setAttribute('text-anchor', 'end')
    maxLabel.textContent = `${Math.round(maxValue * 100) / 100}%`
    legendGroup.appendChild(maxLabel)
    
    svg.appendChild(legendGroup)
    container.appendChild(svg)

    // Cleanup function
    return () => {
      // Remover tooltips que possam ter ficado
      document.querySelectorAll('[data-tooltip-temp]').forEach(el => {
        el.remove()
      })
    }
  }, [data, metric, title])

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>Nenhum dado disponível para visualização</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div 
        ref={chartRef} 
        className="w-full flex justify-center"
        style={{ minHeight: '400px' }}
      />
      
      {/* Informações adicionais */}
      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>Passe o mouse sobre as posições para ver detalhes</p>
        <p className="mt-1">
          Números entre parênteses indicam quantidade de jogadores por posição
        </p>
      </div>
    </div>
  )
}

export default HeatmapChart

