
import React, { useState } from 'react';
import { generatePix, SigiloPayPixResponse } from '../services/sigiloPayService';

interface PlansViewProps {
    userEmail?: string;
    userName?: string;
    userDocument?: string;
}

const PlansView: React.FC<PlansViewProps> = ({ userEmail = '', userName = '', userDocument = '' }) => {
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<SigiloPayPixResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const GENERIC_PHONE = '11999999999';

    const plans = [
        { id: 'starter', name: 'STARTER', price: 97, color: 'border-yellow-500', glow: 'shadow-yellow-500/20', desc: 'Para quem está começando a validar.' },
        { id: 'pro-black', name: 'PRO BLACK', price: 197, color: 'border-primary', glow: 'shadow-red-500/20', desc: 'Acesso às ferramentas avançadas.' },
        { id: 'master-elite', name: 'MASTER ELITE', price: 1500, color: 'border-indigo-500', glow: 'shadow-indigo-500/20', desc: 'Mentoria e suporte VIP direto.' }
    ];

    const handleSubscribe = async (plan: any) => {
        if (!userDocument) {
            setError('CPF não encontrado no seu perfil. Por favor, atualize seu cadastro ou faça login novamente.');
            return;
        }

        setLoading(true);
        setError(null);
        setPixData(null);
        setSelectedPlan(plan);

        try {
            const identifier = `plan-${plan.id}-${Date.now()}`;

            const response = await generatePix({
                identifier,
                amount: plan.price,
                client: {
                    name: userName || 'Operador Dimensão',
                    email: userEmail || 'operador@dimensao.black',
                    phone: GENERIC_PHONE,
                    document: userDocument.replace(/\D/g, '')
                },
                products: [
                    {
                        id: plan.id,
                        name: `Assinatura Plano ${plan.name}`,
                        price: plan.price,
                        quantity: 1
                    }
                ]
            });

            if (response.status === 'OK') {
                setPixData(response);
            } else {
                setError(response.errorDescription || 'Falha ao gerar Pix.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro inesperado ao conectar com SigiloPay.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código Pix copiado!');
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter leading-none">
                    Inicie sua Jornada de <span className="text-primary text-glow">Escala</span>
                </h2>
                <p className="text-gray-500 text-lg font-medium">Planos sob medida para cada estágio do seu negócio dropshipping.</p>
            </div>

            {!pixData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map(p => (
                        <div key={p.name} className={`bg-white dark:bg-surface-dark border-2 ${p.color} p-10 rounded-[2.5rem] flex flex-col text-center shadow-2xl relative overflow-hidden group transition-all hover:translate-y-[-8px] duration-300`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>

                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-6 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {p.name}
                            </h3>

                            <div className="mb-2">
                                <span className="text-2xl font-display font-bold text-gray-400 dark:text-white/50 align-top mr-1">R$</span>
                                <span className="text-7xl font-display font-bold text-gray-900 dark:text-white tracking-tighter">{p.price}</span>
                            </div>

                            <p className="text-gray-500 text-[10px] uppercase font-bold mb-10 tracking-widest">{p.desc}</p>

                            <div className="mt-auto">
                                {error && selectedPlan?.id === p.id && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-[9px] text-primary font-bold uppercase">{error}</p>
                                        {error.includes('CPF') && (
                                            <button
                                                onClick={() => window.location.hash = '#profile'}
                                                className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[8px] font-bold py-2 rounded-lg uppercase tracking-widest transition-all"
                                            >
                                                Configurar CPF no Perfil
                                            </button>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSubscribe(p)}
                                    disabled={loading && selectedPlan?.id === p.id}
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-5 rounded-2xl uppercase text-xs tracking-widest shadow-lg hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-glow"
                                >
                                    {loading && selectedPlan?.id === p.id ? (
                                        <div className="w-4 h-4 border-2 border-white dark:border-black group-hover:border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : 'Assinar Agora'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-md mx-auto animate-in zoom-in-95 duration-500">
                    <div className={`bg-white dark:bg-surface-dark border-2 ${selectedPlan.color} p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden transition-colors duration-300`}>
                        <h3 className="text-gray-900 dark:text-white font-bold uppercase text-xs tracking-widest mb-8 text-glow">
                            Finalizar Assinatura: {selectedPlan.name}
                        </h3>

                        <div className="bg-gray-100 dark:bg-white p-6 rounded-3xl shadow-2xl mb-8 flex flex-col items-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.pix.code)}`}
                                alt="QR Code"
                                className="w-64 h-64 rounded-xl"
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-[0.2em] italic">Aguardando Pagamento...</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-8 relative">
                            <p className="text-[8px] text-gray-500 font-bold uppercase mb-2 tracking-[0.3em]">Pix Copia e Cola</p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-300 truncate pr-12 font-mono">{pixData.pix.code}</p>
                            <button
                                onClick={() => copyToClipboard(pixData.pix.code)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary p-2.5 rounded-xl hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-sm text-white">content_copy</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setPixData(null)}
                            className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar e Escolher Outro Plano
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansView;
