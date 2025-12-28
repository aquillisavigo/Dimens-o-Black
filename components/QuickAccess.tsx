
import React from 'react';

const QuickAccess: React.FC = () => {
  const items = [
    { title: 'Scripts VSL', icon: 'description', color: 'blue' },
    { title: 'Criativos', icon: 'smart_display', color: 'purple' },
    { title: 'Integrações', icon: 'webhook', color: 'green' },
    { title: 'Academy', icon: 'school', color: 'orange' },
  ];

  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white uppercase mb-4">Recursos Disponíveis</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <a 
            key={idx}
            href="#" 
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-surface-dark-2 border border-transparent hover:border-primary/50 hover:bg-white dark:hover:bg-black transition-all duration-300 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,0,0,0.5)] ${colorStyles[item.color]}`}>
              <span className="material-symbols-outlined group-hover:text-primary transition-colors duration-300">{item.icon}</span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 text-center uppercase tracking-wide group-hover:text-white transition-colors duration-300">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
