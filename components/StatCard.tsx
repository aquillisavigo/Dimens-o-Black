
import React from 'react';
import { StatData } from '../types';

const StatCard: React.FC<StatData> = ({ title, value, change, subtext, icon, color, isPositive }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-primary/10 text-primary',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm hover:border-primary/50 hover:scale-[1.02] hover:shadow-glow transition-all duration-300 group relative overflow-hidden cursor-default">
      {/* Animated background glow element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary rounded-full filter blur-[40px] opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500 ease-out"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {color === 'red' ? 'Estatística Crítica' : title}
          </h3>
          <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${colorMap[color]}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white truncate transition-colors group-hover:text-primary dark:group-hover:text-white">
            {value}
          </span>
          <div className="flex items-center mt-2 flex-wrap gap-2">
            {change && (
              <span className={`text-xs font-bold ${isPositive ? 'text-green-600 dark:text-green-500 bg-green-500/10' : 'text-red-600 dark:text-red-500 bg-red-500/10'} px-2 py-0.5 rounded-full flex items-center`}>
                <span className="material-symbols-outlined text-sm mr-1">{isPositive ? 'trending_up' : 'trending_down'}</span> 
                {change}
              </span>
            )}
            {subtext && <span className="text-xs text-gray-500 whitespace-nowrap">{subtext}</span>}
          </div>
        </div>
        {title === 'Clonagens Restantes' && (
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 mt-4 overflow-hidden">
            <div 
              className="bg-primary h-1 rounded-full shadow-glow transition-all duration-1000 ease-out" 
              style={{ width: '90%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
