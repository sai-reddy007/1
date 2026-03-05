'use client';

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function SeverityPie({ data }: { data: { name: string; value: number }[] }) {
  const colors = ['#ff4d6d', '#ff9e00', '#ffd60a', '#00f5d4'];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RiskTrend({ data }: { data: { day: string; risk: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="day" stroke="#8aa0c8" />
        <YAxis stroke="#8aa0c8" />
        <Tooltip />
        <Line type="monotone" dataKey="risk" stroke="#00f5d4" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AssetExposure({ data }: { data: { name: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#8aa0c8" />
        <YAxis stroke="#8aa0c8" />
        <Tooltip />
        <Bar dataKey="score" fill="#7c4dff" />
      </BarChart>
    </ResponsiveContainer>
  );
}
