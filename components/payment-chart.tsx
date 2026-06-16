'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ChartItem {
  month: string
  amount: number
  paid: boolean
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-AU')}`
}

export default function PaymentChart({ data }: { data: ChartItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Fira Code, monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Fira Code, monospace' }}
          axisLine={false}
          tickLine={false}
          width={65}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Amount']}
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'Fira Code, monospace',
            color: '#f8fafc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.paid ? '#10b981' : '#f59e0b'}
              opacity={entry.paid ? 1 : 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
