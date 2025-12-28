
import React, { useState } from 'react';
import { generatePix, SigiloPayPixResponse } from '../services/sigiloPayService';

interface BlackMoneyViewProps {
    balance: number;
    onRecharge: (amt: number) => void;
    userEmail?: string;
    userName?: string;
    userDocument?: string;
}

const BlackMoneyView: React.FC<BlackMoneyViewProps> = ({
    balance,
    onRecharge,
    userEmail = 'operador@dimensao.black',
    userName = 'Operador Dimensão',
    userDocument = ''
}) => {
    const [amount, setAmount] = useState<number>(100);
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<SigiloPayPixResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const GENERIC_PHONE = '11999999999';

    const handleGeneratePix = async () => {
        if (!userDocument) {
            setError('CPF não encontrado no seu perfil. Por favor, atualize seu cadastro.');
            return;
        }

        setLoading(true);
        setError(null);
        setPixData(null);

        try {
            const identifier = `db-${Date.now()}`;

            const response = await generatePix({
                identifier,
                amount,
                client: {
                    name: userName,
                    email: userEmail,
                    phone: GENERIC_PHONE,
                    document: userDocument.replace(/\D/g, '')
                },
                products: [
                    {
                        id: 'dark-coins-recharge',
                        name: `Recarga de ${amount} Dark Coins`,
                        price: amount,
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
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-br from-indigo-950/80 to-black p-12 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.4em] mb-4">Economia Oculta</p>
                        <h2 className="text-7xl font-display font-bold text-white mb-10 tracking-tighter">
                            {balance.toFixed(2)} <span className="text-indigo-500 text-glow">Dark Coins</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg text-left">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Cotação Atual</p>
                                <p className="text-xl font-display font-bold text-white">1 DC = R$ 1,00</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Segurança</p>
                                <p className="text-lg font-display font-bold text-white uppercase">Dados Criptografados</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-8 flex items-center justify-between text-glow">
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Solicitar Recarga
                            </span>
                            <span className="bg-white/5 px-3 py-1 rounded-lg text-[9px] text-gray-400">
                                Saldo: <span className="text-white">{balance.toFixed(2)} DC</span>
                            </span>
                        </h3>

                        {!pixData ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Valor da Recarga</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">R$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 text-lg text-white font-display font-bold focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {[50, 100, 500].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`flex-1 py-3 rounded-lg text-[10px] font-bold border transition-all ${amount === val ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                        >
                                            R$ {val}
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                                        <p className="text-[10px] text-red-400 font-bold uppercase text-center leading-relaxed">{error}</p>
                                        {error.includes('CPF') && (
                                            <button
                                                onClick={() => window.location.hash = '#profile'}
                                                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[9px] font-bold py-2 rounded-lg uppercase tracking-widest transition-all"
                                            >
                                                Configurar CPF Agora
                                            </button>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleGeneratePix}
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : 'Gerar QR Code Pix'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.pix.code)}`}
                                        alt="QR Code Pix"
                                        className="w-56 h-56 shadow-lg rounded-lg"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-tighter italic">Escaneie para pagar agora</p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 relative group">
                                    <p className="text-[8px] text-gray-500 font-bold uppercase mb-2 tracking-widest text-center">Pix Copia e Cola</p>
                                    <p className="text-[10px] text-gray-300 truncate font-mono pr-10">{pixData.pix.code}</p>
                                    <button
                                        onClick={() => copyToClipboard(pixData.pix.code)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary hover:scale-110 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-sm text-white">content_copy</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setPixData(null)}
                                    className="w-full text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Cancelar e Voltar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlackMoneyView;
