
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface SolicitarClonagemViewProps {
    balance: number;
    onPurchase: (price: number, name: string) => Promise<boolean>;
}

const SolicitarClonagemView: React.FC<SolicitarClonagemViewProps> = ({ balance, onPurchase }) => {
    const [loading, setLoading] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [originalLink, setOriginalLink] = useState('');
    const [observations, setObservations] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [success, setSuccess] = useState(false);

    const CLONING_PRICE = 250.00;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (balance < CLONING_PRICE) {
            alert('Saldo insuficiente em Dark Coins.');
            return;
        }

        if (!contactInfo) {
            alert('Por favor, informe seus dados de contato.');
            return;
        }

        setLoading(true);

        try {
            // 1. Processar pagamento via callback do App.tsx
            const purchased = await onPurchase(CLONING_PRICE, `Clonagem: ${projectName}`);

            if (purchased) {
                // 2. Salvar pedido no banco
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) throw new Error('Usuário não autenticado');

                const { error } = await supabase
                    .from('cloning_requests')
                    .insert([{
                        user_id: user.id,
                        project_name: projectName,
                        original_link: originalLink,
                        observations: observations,
                        contact_info: contactInfo,
                        price_paid: CLONING_PRICE,
                        status: 'pending'
                    }]);

                if (error) throw error;

                setSuccess(true);
                setProjectName('');
                setOriginalLink('');
                setObservations('');
                setContactInfo('');
            }
        } catch (error: any) {
            alert('Erro ao processar solicitação: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-4 uppercase">Solicitação Enviada!</h2>
                <p className="text-gray-400 max-w-md mb-10">Seu pedido de clonagem foi recebido. Nossa equipe entrará em contato pelos dados informados em até 24 horas.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="bg-primary px-10 py-4 rounded-xl font-bold text-white uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all"
                >
                    Nova Solicitação
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-4xl">code</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Clonagem <span className="text-primary text-glow">Personalizada</span></h1>
                        <p className="text-gray-500 text-sm uppercase font-bold tracking-widest mt-1">Transforme qualquer site em seu projeto privado</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 px-8 py-5 rounded-[2rem] flex items-center gap-4 shadow-xl transition-colors duration-300">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Saldo Disponível</p>
                        <p className="text-2xl font-display font-bold text-green-600 dark:text-green-500">{balance.toFixed(2)} <span className="text-xs uppercase">DC</span></p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-500">payments</span>
                    </div>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/80 dark:bg-surface-dark/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                    <div className="text-center mb-12">
                        <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">terminal</span>
                        </div>
                        <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Solicitar Clonagem</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.3em]">Envie os detalhes técnicos do projeto alvo</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2">
                                    <span className="material-symbols-outlined text-sm">label</span> Nome do Projeto *
                                </label>
                                <input
                                    type="text" required value={projectName} onChange={e => setProjectName(e.target.value)}
                                    placeholder="Ex. Landing Page Vendas, E-commerce, etc."
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2">
                                    <span className="material-symbols-outlined text-sm">link</span> Link Original *
                                </label>
                                <input
                                    type="url" required value={originalLink} onChange={e => setOriginalLink(e.target.value)}
                                    placeholder="https://exemplo.com"
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2">
                                <span className="material-symbols-outlined text-sm">chat_bubble</span> Meio de Contato (WhatsApp/Telegram) *
                            </label>
                            <input
                                type="text" required value={contactInfo} onChange={e => setContactInfo(e.target.value)}
                                placeholder="@seuhandle ou +55 (11) 99999-9999"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2">
                                <span className="material-symbols-outlined text-sm">edit_note</span> Observações Adicionais
                            </label>
                            <textarea
                                rows={4} value={observations} onChange={e => setObservations(e.target.value)}
                                placeholder="Detalhes específicos, modificações desejadas, funcionalidades extras, etc."
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700 resize-none"
                            />
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-indigo-950/30 dark:to-black/50 border border-indigo-200 dark:border-indigo-500/20 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center gap-4 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-display font-bold text-gray-900 dark:text-white">250.00</span>
                                <span className="text-primary font-display font-bold text-xl uppercase tracking-tighter">Dark Coins</span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">schedule</span> Prazo: de 1 a 7 dias
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">verified</span> Clonagem completa e personalizada
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-6 rounded-[2rem] text-sm uppercase tracking-[0.4em] shadow-glow active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-symbols-outlined">payments</span>
                            )}
                            {loading ? 'Processando Solicitação...' : `Pagar 250.00 DC e Enviar`}
                        </button>
                    </form>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: 'bolt', title: 'Entrega Rápida', desc: 'Clonagem entregue em 1 a 7 dias', color: 'text-primary' },
                    { icon: 'palette', title: 'Personalização', desc: 'Adaptado às suas necessidades específicas', color: 'text-green-600 dark:text-green-500' },
                    { icon: 'shield_lock', title: 'Segurança', desc: 'Pagamento seguro com Dark Coins', color: 'text-blue-600 dark:text-blue-500' },
                    { icon: 'support_agent', title: 'Suporte', desc: 'Suporte completo durante todo o processo', color: 'text-purple-600 dark:text-purple-500' },
                ].map((feat, i) => (
                    <div key={i} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 p-8 rounded-[2rem] text-center group hover:bg-gray-50 dark:hover:bg-surface-dark-2 transition-all shadow-sm dark:shadow-none duration-300">
                        <div className={`w-12 h-12 ${feat.color} bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-bold text-xs uppercase tracking-widest mb-2">{feat.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-medium leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-10">
                <button
                    onClick={() => window.location.hash = '#dashboard'}
                    className="flex items-center gap-2 text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-[0.3em] transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar ao Dashboard
                </button>
            </div>
        </div>
    );
};

export default SolicitarClonagemView;
