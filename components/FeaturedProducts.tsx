
import React, { useState } from 'react';
import { Product } from '../types';

interface Props {
  products: Product[];
}

const FeaturedProducts: React.FC<Props> = ({ products }) => {
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = (id: string) => {
    setCloningId(id);
    // Simulate API call
    setTimeout(() => {
      setCloningId(null);
    }, 2000);
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase">Ofertas em Destaque</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Produtos validados escalando agora no mercado.</p>
        </div>
        <button className="text-sm text-primary font-bold hover:text-white hover:underline transition-all">Ver todas</button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => {
          const isCloning = cloningId === product.id;
          return (
            <div key={product.id} className="bg-gray-50 dark:bg-surface-dark-2 rounded-xl overflow-hidden border border-border-light dark:border-border-dark hover:border-primary/50 transition-all group flex flex-col">
              <div className="h-44 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                <img 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={product.image}
                />
                {product.isHot && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10">HOT</div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-2">{product.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{product.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-5 border-t border-border-light dark:border-border-dark pt-4">
                  
                  {/* Tooltip CPA Médio */}
                  <div className="flex flex-col relative group/tooltip">
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">CPA Médio</span>
                      <span className="material-symbols-outlined text-[12px] text-gray-600">info</span>
                    </div>
                    {/* Tooltip Content */}
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black text-[10px] leading-tight text-gray-200 rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 shadow-xl border border-border-dark z-20 translate-y-2 group-hover/tooltip:translate-y-0">
                      Custo por Aquisição sugerido. Representa quanto você deve gastar em anúncios para cada venda realizada para manter o ROI positivo.
                      <div className="absolute top-full left-4 border-8 border-transparent border-t-black"></div>
                    </div>
                    <span className="text-green-500 font-bold text-sm">{product.cpa}</span>
                  </div>

                  {/* Tooltip Views */}
                  <div className="flex flex-col relative group/tooltip-views">
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Views</span>
                      <span className="material-symbols-outlined text-[12px] text-gray-600">visibility</span>
                    </div>
                    {/* Tooltip Content */}
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black text-[10px] leading-tight text-gray-200 rounded-lg opacity-0 group-hover/tooltip-views:opacity-100 pointer-events-none transition-all duration-300 shadow-xl border border-border-dark z-20 translate-y-2 group-hover/tooltip-views:translate-y-0">
                      Total de visualizações únicas na página de vendas desta oferta nas últimas 24 horas dentro da nossa rede.
                      <div className="absolute top-full left-4 border-8 border-transparent border-t-black"></div>
                    </div>
                    <span className="text-white font-bold text-sm">{product.views}</span>
                  </div>

                </div>
                <button 
                  disabled={isCloning}
                  onClick={() => handleClone(product.id)}
                  className={`mt-auto w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 ${
                    isCloning 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-80' 
                      : 'bg-primary hover:bg-primary-hover text-white shadow-red-900/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isCloning ? 'animate-spin' : ''}`}>
                    {isCloning ? 'sync' : 'content_copy'}
                  </span>
                  {isCloning ? 'Clonando...' : 'Clonar Agora'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;
