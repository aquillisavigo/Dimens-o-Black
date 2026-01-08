
import React from 'react';
import { ActiveTab } from '../types';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout?: () => void;
  profile?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange, onLogout, profile }) => {
  const menuItems: { id: ActiveTab; label: string; icon: string; category: string }[] = [
    { id: 'dashboard', label: 'Início', icon: 'dashboard', category: 'PAINEL' },
    { id: 'profile', label: 'Meu Perfil', icon: 'person', category: 'PAINEL' },
    { id: 'downloads', label: 'Downloads', icon: 'cloud_download', category: 'PAINEL' },
    { id: 'black-money', label: 'Dark Coins', icon: 'payments', category: 'FINANCEIRO' },
    { id: 'affiliates', label: 'Afiliados', icon: 'campaign', category: 'FINANCEIRO' },
    { id: 'ofertas-clonadas', label: 'Ofertas Clonadas', icon: 'local_fire_department', category: 'FERRAMENTAS' },
    { id: 'clonagem', label: 'Solicitar Clonagem', icon: 'content_copy', category: 'FERRAMENTAS' },
    { id: 'cassinos', label: 'Cassinos & Jogos', icon: 'casino', category: 'FERRAMENTAS' },
    { id: 'kl-remotas', label: 'KL Remotas', icon: 'settings_remote', category: 'FERRAMENTAS' },
    { id: 'planos', label: 'Nossos Planos', icon: 'military_tech', category: 'ASSINATURA' },
    { id: 'admin', label: 'Painel Admin', icon: 'admin_panel_settings', category: 'GESTAO' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0a0a0a] border-r border-border-light dark:border-border-dark 
        flex flex-col transition-all duration-300 z-40 md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center px-8 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo size={42} className="drop-shadow-[0_0_8px_rgba(212,0,0,0.5)]" />
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Dimensão <span className="text-primary">Black</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {['PAINEL', 'FERRAMENTAS', 'FINANCEIRO', 'ASSINATURA', 'GESTAO'].map(category => {
            const items = menuItems.filter(item => {
              if (item.id === 'admin' && !profile?.is_admin) return false;
              if (item.id === 'affiliates' && !profile) return false;
              return item.category === category;
            });
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">{category}</p>
                <div className="space-y-1">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative ${activeTab === item.id
                        ? 'bg-primary/5 text-primary border border-primary/20'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark-2 hover:text-gray-900 dark:hover:text-white border border-transparent'
                        }`}
                    >
                      <span className={`material-symbols-outlined mr-3 text-xl ${activeTab === item.id ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span>
                        {item.label}
                      </span>
                      {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></div>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-black/20 flex flex-col gap-4">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 dark:text-red-500 hover:bg-red-500/10 rounded-xl transition-all gap-3"
            >
              <span className="material-symbols-outlined">logout</span>
              Sair da Conta
            </button>
          )}
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest text-center">Dimensão Black v2.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
