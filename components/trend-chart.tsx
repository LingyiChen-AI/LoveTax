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
          <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
          <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 10, fill: '#1F2937', fontWeight: 700 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#1F2937', fontWeight: 700 }} />
          <Tooltip contentStyle={{ border: '2px solid #1F2937', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
          <Line type="monotone" dataKey="meRemaining" name={meLabel} stroke="#DC2626" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="partnerRemaining" name={partnerLabel} stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
