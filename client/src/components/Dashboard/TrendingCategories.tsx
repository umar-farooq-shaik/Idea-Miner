import React from 'react';
import { Card } from '../common/Card';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface TrendingCategoriesProps {
  categories: { name: string; count: number }[];
}

export const TrendingCategories: React.FC<TrendingCategoriesProps> = ({ categories }) => {
  const chartData = (categories.length > 0 ? categories : [
    { name: 'APIs & Developer Tools', count: 6 },
    { name: 'Remote Project Management', count: 5 },
    { name: 'E-commerce Logistics', count: 4 },
    { name: 'Small Business Invoicing', count: 3 },
    { name: 'AI Coding Tools', count: 2 },
  ]).map(c => ({
    name: c.name.length > 20 ? c.name.slice(0, 18) + '...' : c.name,
    fullName: c.name,
    count: c.count
  }));

  const colors = ['#C25E2E', '#5F6F52', '#B85A32', '#78716C', '#4A5B3D'];

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-copper" /> Trending Problem Categories
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Clusters with highest verified complaint volume
          </p>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis type="number" allowDecimals={false} stroke="#A8A29E" fontSize={11} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#57534E" 
              fontSize={11} 
              width={110} 
              tickLine={false} 
            />
            <Tooltip
              formatter={(value: any) => [`${value} recorded complaints`, 'Volume']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              contentStyle={{
                backgroundColor: '#1C1917',
                border: '1px solid #44403C',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-soft font-mono">
        <span>Updated dynamically from search clusters</span>
        <span className="text-copper font-semibold">Highest friction first</span>
      </div>
    </Card>
  );
};
