
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartData } from '../types';

interface Props {
  data: ChartData[];
}

const PerformanceChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase">Estatísticas</h2>
        <select className="bg-gray-50 dark:bg-surface-dark-2 border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none transition-all">
          <option>Últimos 30 dias</option>
          <option>Últimos 7 dias</option>
        </select>
      </div>
      
      <div className="h-64 w-full bg-gray-50 dark:bg-surface-dark-2 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 10 }} 
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: '#000', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 2 ? '#D40000' : '#374151'} 
                  className="transition-all duration-300 hover:fill-primary"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1 uppercase font-bold tracking-widest">
        <span>Início do Mês</span>
        <span>Atual</span>
      </div>
    </div>
  );
};

export default PerformanceChart;
