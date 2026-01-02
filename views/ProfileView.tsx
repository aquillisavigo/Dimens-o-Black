
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ProfileViewProps {
    profile: any;
    onUpdate?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [document, setDocument] = useState(profile?.document || '');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setDocument(profile.document || '');
        }
    }, [profile]);

    if (!profile) return null;

    const handleUpdate = async () => {
        setLoading(true);
        setMessage(null);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                document: document,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);

        if (error) {
            setMessage({ text: 'Erro ao atualizar: ' + error.message, type: 'error' });
        } else {
            setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
            if (onUpdate) onUpdate();
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto pb-10">
            {/* Header / Avatar Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-black border border-indigo-200 dark:border-indigo-500/20 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-full border-[6px] border-primary p-2 transition-transform duration-500 group-hover:scale-105">
                            <div className="h-full w-full rounded-full bg-gray-200 dark:bg-surface-dark-2 flex items-center justify-center overflow-hidden">
                                <span className="material-symbols-outlined text-7xl text-gray-500 dark:text-gray-700">person</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg border border-white/20">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{profile.full_name || 'Operador'}</h2>
                            <div className="bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 text-[9px] uppercase font-bold text-green-600 dark:text-green-500 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Ativo na Rede
                            </div>
                        </div>
                        <p className="text-primary font-bold text-xs uppercase tracking-[0.5em] mt-3 mb-8">Nível Elite Master Black</p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-indigo-50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-white/5 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                                <span className="opacity-50 mr-2 text-gray-500 dark:text-gray-400">BALANÇO:</span> {profile.balance.toFixed(2)} DC
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-surface-dark/50 backdrop-blur-md border border-gray-100 dark:border-white/5 p-10 rounded-[2.5rem] shadow-xl transition-colors duration-300">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">edit_square</span>
                            Dados Cadastrais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Nome do Operador</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nome completo"
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Documento Identificador (CPF)</label>
                                <input
                                    type="text"
                                    value={document}
                                    onChange={(e) => setDocument(e.target.value)}
                                    placeholder="000.000.000-00"
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`mt-8 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'} text-[10px] font-bold uppercase text-center`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="mt-10 w-full bg-black dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Sincronizando...' : 'Atualizar Credenciais'}
                        </button>
                    </div>
                </div>

                {/* Info Cards Side */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 p-8 rounded-[2rem] shadow-lg transition-colors duration-300">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100 dark:border-white/5">Segurança</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Status</span>
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-tighter italic">Criptografado</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Validação</span>
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter italic">Verificada</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-transparent border border-primary/20 p-8 rounded-[2rem] shadow-lg text-center transition-colors">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">shield</span>
                        <h4 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2 transition-colors">Proteção de Dados</h4>
                        <p className="text-[9px] text-gray-500 uppercase leading-relaxed">Suas informações são processadas apenas em servidores de segurança máxima.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
