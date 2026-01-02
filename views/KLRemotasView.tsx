
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface KLRemotasViewProps {
    balance: number;
    onPurchase: (p: number, n: string, id?: string) => void;
}

const KLRemotasView: React.FC<KLRemotasViewProps> = ({ balance, onPurchase }) => {
    const [dbProducts, setDbProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKLProducts();
    }, []);

    const fetchKLProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category', 'kl-remotas')
            .eq('is_active', true);

        if (data) setDbProducts(data);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="bg-primary/90 text-white py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-glow">
                <span className="material-symbols-outlined text-sm animate-pulse">bolt</span>
                <p className="text-[11px] font-bold uppercase tracking-widest text-center">Infraestrutura de Acesso Remoto de Alta Performance</p>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-2">SALDO DISPONÍVEL</p>
                <h2 className="text-5xl font-display font-bold text-green-600 dark:text-green-500 mb-1">{balance.toFixed(2)} <span className="text-xl uppercase">Dark Coins</span></h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : dbProducts.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-[3rem] border-dashed transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-700 mb-6 block">dns</span>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Nenhuma KL Remota disponível no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dbProducts.map((kl) => (
                        <div key={kl.id} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-500 shadow-xl dark:shadow-none">
                            <div className="h-44 relative bg-gray-100 dark:bg-black overflow-hidden">
                                <img src={kl.image_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=400&auto=format&fit=crop'} alt={kl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 dark:opacity-40 group-hover:opacity-100 dark:group-hover:opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-surface-dark via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                    <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Ativo</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 -mt-8 relative z-10">
                                <div className="bg-gray-50 dark:bg-surface-dark-2 border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-xl transition-colors duration-300">
                                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-2">{kl.name}</h3>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-500 leading-relaxed line-clamp-2">{kl.description}</p>
                                </div>

                                <div className="border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl flex items-center justify-between shadow-inner transition-colors duration-300">
                                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Investimento</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tighter">{kl.price}</span>
                                        <span className="text-indigo-500 dark:text-indigo-400 font-display text-xs font-bold uppercase">DC</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onPurchase(kl.price, kl.name, kl.id)}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-glow active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                    COMPRAR AGORA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KLRemotasView;
