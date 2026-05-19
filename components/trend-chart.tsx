'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface TrendChartProps {
  data: { date: string; meRemaining: number; partnerRemaining: number }[];
  meLabel: string;
  partnerLabel: string;
}

export function TrendChart({ data, meLabel, partnerLabel }: TrendChartProps) {
  return (
    <div className="neo p-3 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#E5E5EA" />
          <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 500 }} stroke="#E5E5EA" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 500 }} stroke="#E5E5EA" />
          <Tooltip contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 500 }} />
          <Line type="monotone" dataKey="meRemaining"      name={meLabel}      stroke="#34C759" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="partnerRemaining" name={partnerLabel} stroke="#007AFF" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
