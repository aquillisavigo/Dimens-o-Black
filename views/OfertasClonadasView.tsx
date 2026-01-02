
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface OfertasClonadasViewProps {
    balance: number;
    onPurchase: (price: number, name: string, id: string) => void;
}

const OfertasClonadasView: React.FC<OfertasClonadasViewProps> = ({ balance, onPurchase }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category', 'clonagem')
            .eq('is_active', true);

        if (data) setProducts(data);
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="bg-gradient-to-r from-red-50 to-white dark:from-red-950/40 dark:to-black p-12 rounded-[2.5rem] border border-red-200 dark:border-red-500/20 shadow-2xl relative overflow-hidden text-center md:text-left transition-colors duration-300">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-5xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                            Mercado de <span className="text-primary text-glow">Clonagem</span>
                        </h2>
                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.4em] mt-3">Produtos Validados e Prontos para Escala</p>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-6 rounded-3xl backdrop-blur-md transition-colors duration-300">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-center">SEU BALANÇO</p>
                        <p className="text-3xl font-display font-bold text-green-600 dark:text-green-500">{balance.toFixed(2)} <span className="text-xs">DC</span></p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-[3rem] border-dashed transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-700 mb-6 block">shopping_basket</span>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Nenhuma oferta disponível no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(p => (
                        <div key={p.id} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-500 shadow-xl dark:shadow-none">
                            <div className="h-48 relative bg-gray-100 dark:bg-black overflow-hidden">
                                <img src={p.image_url || 'https://via.placeholder.com/400x200'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 dark:opacity-50 group-hover:opacity-100 dark:group-hover:opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-surface-dark via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-glow">HOT OFFER</div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="mb-6">
                                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
                                </div>

                                <div className="mt-auto space-y-6">
                                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-inner transition-colors duration-300">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preço Individual</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">{p.price}</span>
                                            <span className="text-primary font-bold text-xs uppercase">DC</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onPurchase(p.price, p.name, p.id)}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-glow active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                        Comprar Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OfertasClonadasView;
