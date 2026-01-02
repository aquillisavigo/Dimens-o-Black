
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ChartData, StatData } from '../types';

interface AffiliateDashboardProps {
    onToast?: (message: string, type: 'success' | 'error') => void;
    profile: any;
}

interface PurchaseHistory {
    date: string;
    user_email?: string; // We might not have this depending on privacy, usually masked
    user_name?: string;
    amount: number;
    commission: number;
    status: 'pending' | 'confirmed' | 'refunded';
}

const AffiliateDashboardView: React.FC<AffiliateDashboardProps> = ({ onToast, profile }) => {
    const [history, setHistory] = useState<PurchaseHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingConvert, setLoadingConvert] = useState(false);

    // Goals Stats
    const [confirmedSalesCount, setConfirmedSalesCount] = useState(0);

    useEffect(() => {
        fetchAffiliateData();
    }, [profile?.id]);

    const fetchAffiliateData = async () => {
        if (!profile?.id) return;
        setLoading(true);

        // 1. Fetch Purchases/History
        // Note: We need a way to get "indicated user". 
        // Usually we join purchases with profiles (User who bought).
        const { data, error } = await supabase
            .from('purchases')
            .select(`
        created_at,
        price_paid,
        affiliate_commission,
        status,
        profiles!purchases_user_id_fkey(full_name) 
      `)
            .eq('referrer_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching affiliate history:', error);
            if (onToast) onToast('Erro ao carregar histórico.', 'error');
        } else if (data) {
            const formattedHistory: PurchaseHistory[] = data.map((item: any) => ({
                date: new Date(item.created_at).toLocaleDateString('pt-BR'),
                user_name: item.profiles?.full_name || 'Usuário Anônimo',
                amount: Number(item.price_paid),
                commission: Number(item.affiliate_commission),
                status: item.status || 'pending'
            }));
            setHistory(formattedHistory);

            // Calculate Confirmed Sales for Goals
            const confirmedCount = formattedHistory.filter(h => h.status === 'confirmed').length;
            setConfirmedSalesCount(confirmedCount);
        }

        setLoading(false);
    };

    const copyLink = () => {
        const link = `${window.location.origin}/?ref=${profile?.affiliate_code}`;
        navigator.clipboard.writeText(link);
        if (onToast) onToast('Link copiado com sucesso!', 'success');
    };

    const shareLink = () => {
        const link = `${window.location.origin}/?ref=${profile?.affiliate_code}`;
        if (navigator.share) {
            navigator.share({
                title: 'Dimensão Black - Convite',
                text: 'Acesse o painel exclusivo Dimensão Black.',
                url: link
            });
        } else {
            copyLink();
        }
    };

    const handleConvertBalance = async (amount: number) => {
        // Just a shortcut to use all balance for now or redirect
        // "Usar saldo para comprar conteúdos" -> Logic could be: Convert to Dark Coins (Main Balance)
        if (amount <= 0) return;

        setLoadingConvert(true);
        const { data, error } = await supabase.rpc('convert_affiliate_balance', { amount });

        if (error) {
            console.error(error);
            if (onToast) onToast('Erro ao converter saldo.', 'error');
        } else if (data === true) {
            if (onToast) onToast('Saldo convertido em Dark Coins com sucesso!', 'success');
            // Profile updates via realtime subscription in App.tsx hopefully, but we might need manual refresh?
            // Actually App.tsx handles profile refresh on realtime.
        } else {
            if (onToast) onToast('Saldo insuficiente.', 'error');
        }
        setLoadingConvert(false);
    };

    // Render Helpers
    const renderGoal = (target: number, reward: number, icon: string, label: string) => {
        const progress = Math.min((confirmedSalesCount / target) * 100, 100);
        const isCompleted = confirmedSalesCount >= target;

        return (
            <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${isCompleted
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-surface-dark-2 border-border-dark'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-symbols-outlined">{isCompleted ? 'check' : icon}</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
                            <p className="text-lg font-bold text-white">R$ {reward},00</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                            {confirmedSalesCount}/{target}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {isCompleted && <div className="mt-2 text-[10px] text-green-500 font-bold uppercase tracking-widest text-center animate-pulse">Meta Concluída • Recompensa Paga</div>}
            </div>
        );
    };

    const totalEarnings = history.filter(h => h.status === 'confirmed').reduce((acc, curr) => acc + curr.commission, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Painel de <span className="text-primary">Afiliado</span></h2>
                    <p className="text-gray-500 text-sm mt-1">Gerencie suas indicações e comissões.</p>
                </div>
                <div className="bg-primary/20 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Comissão Padrão: 30%
                </div>
            </div>

            {/* Section 1: Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Saldo Disponível */}
                <div className="bg-surface-dark-2 border border-border-dark p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-green-500">account_balance_wallet</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo de Comissões</p>
                    <h3 className="text-3xl font-bold text-white mb-4">R$ {Number(profile?.affiliate_balance || 0).toFixed(2)}</h3>
                    <p className="text-[10px] text-gray-500">Disponível para uso imediato em compras.</p>
                </div>

                {/* Indicações Confirmadas */}
                <div className="bg-surface-dark-2 border border-border-dark p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-blue-500">group_add</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendas Confirmadas</p>
                    <h3 className="text-3xl font-bold text-white mb-4">{confirmedSalesCount}</h3>
                    <p className="text-[10px] text-gray-500">Apenas compras pagas contam.</p>
                </div>

                {/* Total Ganho */}
                <div className="bg-surface-dark-2 border border-border-dark p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-yellow-500">payments</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Ganho</p>
                    <h3 className="text-3xl font-bold text-white mb-4">R$ {Number(profile?.affiliate_total_earnings || totalEarnings).toFixed(2)}</h3>
                    <p className="text-[10px] text-gray-500">Histórico vitalício.</p>
                </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-500 text-xl">info</span>
                <p className="text-xs text-yellow-500/90 leading-relaxed">
                    <strong className="uppercase font-bold block mb-1">Regra de Comissionamento</strong>
                    Você só ganha comissão quando seus indicados realizam <strong>compras confirmadas</strong>. Cadastros gratuitos não geram saldo. As metas são baseadas em quantidade de compras pagas.
                </p>
            </div>

            {/* Section 2: Link de Indicação */}
            <div className="bg-surface-dark-2 border border-border-dark p-8 rounded-3xl">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">link</span> Seu Link Exclusivo
                </h3>

                <div className="flex flex-col md:flex-row gap-4 items-center bg-black/30 p-2 rounded-2xl border border-border-dark">
                    <div className="flex-1 px-4 py-2 w-full overflow-hidden">
                        <span className="text-gray-400 text-sm font-mono truncate block">
                            {window.location.origin}/?ref={profile?.affiliate_code || '...'}
                        </span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={copyLink} className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-base">content_copy</span> Copiar
                        </button>
                        <button onClick={shareLink} className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-base">share</span>
                        </button>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest mt-4">
                    ⚠️ Importante: o ganho só ocorre após a compra paga pelo indicado.
                </p>
            </div>

            {/* Section 3: Metas */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">flag</span> Metas & Recompensas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderGoal(1, 20, 'military_tech', 'Primeira Venda')}
                    {renderGoal(5, 75, 'star', 'Vendedor Elite')}
                    {renderGoal(10, 200, 'diamond', 'Mestre Afiliado')}
                </div>
            </div>

            {/* Section 5: Uso do Saldo (Moved up for UX, or keep down) -> Prompt said Section 5 */}

            {/* Section 4: Histórico */}
            <div className="bg-surface-dark-2 border border-border-dark rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-border-dark flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span> Histórico de Comissões
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Carregando histórico...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">sentiment_dissatisfied</span>
                            <p className="text-gray-500 text-sm">Nenhuma comissão registrada ainda.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-dark text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Indicado</th>
                                    <th className="p-4">Valor Compra</th>
                                    <th className="p-4">Comissão</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border-dark/50 hover:bg-white/5 transition-colors text-sm text-gray-300">
                                        <td className="p-4">{item.date}</td>
                                        <td className="p-4 font-bold text-white">{item.user_name}</td>
                                        <td className="p-4">R$ {item.amount.toFixed(2)}</td>
                                        <td className="p-4 text-green-400 font-bold">+ R$ {item.commission.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${item.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                    item.status === 'refunded' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                {item.status === 'confirmed' ? 'Confirmada' : item.status === 'refunded' ? 'Estornada' : 'Pendente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Section 5: Uso do Saldo */}
            <div className="bg-gradient-to-br from-surface-dark-2 to-black border border-border-dark p-8 rounded-3xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span> Usar Saldo
                        </h3>
                        <p className="text-gray-500 text-sm max-w-lg">
                            Você pode utilizar seu saldo de afiliado para adquirir produtos e conteúdos dentro da plataforma. O saldo será convertido para <strong>Dark Coins</strong>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Disponível</p>
                            <p className="text-xl font-bold text-white">R$ {Number(profile?.affiliate_balance || 0).toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => handleConvertBalance(Number(profile?.affiliate_balance || 0))}
                            disabled={loadingConvert || Number(profile?.affiliate_balance || 0) <= 0}
                            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-glow"
                        >
                            {loadingConvert ? 'Processando...' : 'Converter p/ Coins'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AffiliateDashboardView;
