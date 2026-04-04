// ============================================
// components/StockChart.tsx
// Graphique de prix avec Recharts
// ============================================

'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { toOrbe, formatOrbe } from '@/lib/currency'

interface PricePoint {
  price: bigint
  recordedAt: Date
  volume: number
}

interface StockChartProps {
  prices: PricePoint[]
  height?: number
  showArea?: boolean
}

export function StockChart({ prices, height = 200, showArea = true }: StockChartProps) {
  const data = useMemo(() => {
    return prices.map(p => ({
      date: new Date(p.recordedAt).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: prices.length <= 24 ? '2-digit' : undefined,
        minute: prices.length <= 24 ? '2-digit' : undefined,
      }),
      price: toOrbe(p.price),
      volume: p.volume,
    }))
  }, [prices])
  
  if (prices.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-white/40 text-sm"
        style={{ height }}
      >
        Aucune donnée disponible
      </div>
    )
  }
  
  const minPrice = Math.min(...data.map(d => d.price))
  const maxPrice = Math.max(...data.map(d => d.price))
  const padding = (maxPrice - minPrice) * 0.1
  
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {showArea ? (
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]}
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `◎${value.toFixed(0)}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 15, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any, name: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                return isNaN(numValue) ? ['', ''] : [`◎ ${numValue.toFixed(2)}`, 'Prix'];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#7c3aed" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]}
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `◎${value.toFixed(0)}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 15, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any, name: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                return isNaN(numValue) ? ['', ''] : [`◎ ${numValue.toFixed(2)}`, 'Prix'];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#7c3aed" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#7c3aed' }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
