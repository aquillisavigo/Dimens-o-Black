import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
    onMenuClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onMenuClick }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16">
                {/* Home / Dashboard */}
                <button
                    onClick={() => onTabChange('dashboard')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                >
                    <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${activeTab === 'dashboard' ? '-translate-y-1' : ''
                        }`}>grid_view</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
                </button>

                {/* Ferramentas (Atalho para Clonagem ou Mais Usado) */}
                <button
                    onClick={() => onTabChange('ofertas-clonadas')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'ofertas-clonadas' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                >
                    <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${activeTab === 'ofertas-clonadas' ? '-translate-y-1' : ''
                        }`}>local_fire_department</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ofertas</span>
                </button>

                {/* Botão Carteira / Black Money (Padronizado) */}
                <button
                    onClick={() => onTabChange('black-money')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'black-money' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                >
                    <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${activeTab === 'black-money' ? '-translate-y-1' : ''
                        }`}>account_balance_wallet</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Carteira</span>
                </button>

                {/* KL Remotas (Substituindo Arquivos) */}
                <button
                    onClick={() => onTabChange('kl-remotas')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'kl-remotas' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                >
                    <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${activeTab === 'kl-remotas' ? '-translate-y-1' : ''
                        }`}>settings_remote</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">KL Info</span>
                </button>

                {/* Menu (Abre Sidebar) */}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
