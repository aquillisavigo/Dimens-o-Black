
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface MyDownloadsViewProps {
    userId?: string;
}

const MyDownloadsView: React.FC<MyDownloadsViewProps> = ({ userId }) => {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) fetchPurchases();
    }, [userId]);

    const fetchPurchases = async () => {
        const { data, error } = await supabase
            .from('purchases')
            .select(`
        *,
        products (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPurchases(data);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-950/40 dark:to-black p-12 rounded-[2.5rem] border border-indigo-200 dark:border-indigo-500/20 shadow-2xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-5xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                            Minhas <span className="text-indigo-500 dark:text-indigo-400 text-glow">Aquisições</span>
                        </h2>
                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.4em] mt-3">Repositório Privado de Ativos</p>
                    </div>
                    {purchases.length > 0 && (
                        <button
                            onClick={async () => {
                                if (confirm('Tem certeza? Isso apagará seu histórico de downloads pessoal.')) {
                                    setLoading(true);
                                    await supabase.from('purchases').delete().eq('user_id', userId);
                                    setPurchases([]);
                                    setLoading(false);
                                }
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-red-500/20 transition-all"
                        >
                            Limpar Histórico
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-[3rem] border-dashed transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-700 mb-6 block">cloud_off</span>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Você ainda não possui arquivos para download.</p>
                    <button
                        onClick={() => window.location.hash = '#ofertas-clonadas'}
                        className="mt-8 text-indigo-500 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-widest hover:text-indigo-700 dark:hover:text-white transition-colors"
                    >
                        Explorar Marketplace →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchases.map(p => (
                        <div key={p.id} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 p-8 rounded-[2.5rem] flex flex-col group hover:border-indigo-500/30 transition-all shadow-sm dark:shadow-none duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">folder_zip</span>
                                </div>
                                <div className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    Comprado em {new Date(p.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{p.products.name}</h3>
                            <p className="text-gray-600 dark:text-gray-600 text-xs mb-8 line-clamp-2">{p.products.description}</p>

                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                                <a
                                    href={p.products.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-black font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Baixar Arquivo .RAR
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDownloadsView;
