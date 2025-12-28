
import React from 'react';
import Logo from '../components/Logo';
import StatCard from '../components/StatCard';
import { ActiveTab } from '../types';
import { supabase } from '../supabaseClient';

interface DashboardViewProps {
    onTabChange: (t: ActiveTab) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onTabChange }) => {
    const [topProducts, setTopProducts] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchStats = async () => {
            const { data } = await (supabase.rpc as any)('get_top_selling_products', { limit_count: 4 });
            if (data) setTopProducts(data);
        };

        fetchStats();
    }, []);

    const getRankInfo = (index: number) => {
        const ranks = [
            { title: "🥇 Campeão de Vendas", color: "yellow", icon: "trophy" },
            { title: "🥈 2º Lugar", color: "gray", icon: "leaderboard" },
            { title: "🥉 3º Lugar", color: "orange", icon: "workspace_premium" },
            { title: "4º Lugar", color: "blue", icon: "thumb_up" }
        ];
        return ranks[index] || { title: `${index + 1}º Lugar`, color: "purple", icon: "star" };
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between group shadow-2xl transition-all">
                <div className="relative z-10 max-w-xl w-full">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                            <span className="material-symbols-outlined text-primary text-2xl md:text-4xl">bolt</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter leading-none">A Dimensão está <span className="text-primary text-glow">Ativa</span></h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg leading-relaxed mb-6 md:mb-10">Tenha as telas mais poderosas do universo e as estratégias de marketing que levam seu negócio para outro nível</p>
                    <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-5 w-full">
                        <button onClick={() => onTabChange('ofertas-clonadas')} className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all">Explorar Ofertas</button>
                        <button onClick={() => onTabChange('black-money')} className="w-full md:w-auto bg-white dark:bg-surface-dark-2 border border-border-light dark:border-border-dark text-gray-900 dark:text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-[0.2em] active:scale-95 transition-all">Minha Carteira</button>
                        <button onClick={() => window.open('https://chat.whatsapp.com/EJsKlT4ymCrJXAwdwCoCnB', '_blank')} className="w-full md:w-auto bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-black px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,211,102,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <span>Grupo VIP</span>
                        </button>
                    </div>
                </div>
                <div className="hidden lg:block absolute -right-40 top-1/2 -translate-y-1/2 opacity-5 dark:opacity-10 transition-all duration-1000 group-hover:rotate-6">
                    <Logo size={800} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                {[0, 1, 2, 3].map(i => {
                    const product = topProducts[i];
                    const info = getRankInfo(i);
                    return (
                        <StatCard
                            key={i}
                            title={info.title}
                            value={product ? product.product_name : "Disponível"}
                            icon={info.icon}
                            color={info.color as any}
                            change={product ? `${product.sales_count} Vendas` : "Aguardando Vendas"}
                            isPositive={!!product}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardView;
