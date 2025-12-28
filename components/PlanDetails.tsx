
import React from 'react';

const PlanDetails: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full filter blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Detalhes do Plano</p>
            <h3 className="text-2xl font-display font-bold text-white">MASTER <span className="text-primary text-glow">BLACK</span></h3>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">verified</span>
        </div>
        
        <div className="space-y-4 my-6">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-400">Produtos Clonados</span>
              <span className="text-white">45/50</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(212,0,0,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: '90%' }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-400">Downloads Temas</span>
              <span className="text-white">Ilimitado</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-400">Suporte via Chat</span>
              <span className="text-white">Prioritário</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(212,0,0,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-400">Acesso a Relatórios Premium</span>
              <span className="text-white">Ativo</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>

        <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center group active:scale-95">
          <span className="material-symbols-outlined text-sm mr-2 transition-transform group-hover:rotate-45">settings</span>
          Gerenciar Assinatura
        </button>
      </div>
    </div>
  );
};

export default PlanDetails;
