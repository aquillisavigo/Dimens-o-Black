
import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../supabaseClient';

interface LoginViewProps {
  onLogin: () => void; // This will now be handled via Auth state change in App.tsx
  onToast: (m: string, t?: 'success' | 'error') => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onToast }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recover'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [document, setDocument] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      onToast(error.message, 'error');
    } else {
      onToast('Acesso autorizado. Bem-vindo à Dimensão.', 'success');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          document: document,
        },
      },
    });

    if (error) {
      onToast(error.message, 'error');
    } else {
      onToast('Conta criada com sucesso! Verifique seu e-mail para confirmar o acesso.', 'success');
      alert('IMPORTANTE: Verifique seu e-mail (inclusive caixa de spam) para confirmar o cadastro antes de fazer login.');
      setAuthMode('login');
    }
    setLoading(false);
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      onToast(error.message, 'error');
    } else {
      onToast('E-mail de recuperação enviado para a rede oculta.', 'success');
      setAuthMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-background-dark flex items-center justify-center p-4 py-10 relative overflow-y-auto">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
      <div className="max-w-md w-full relative z-10 animate-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <Logo size={240} className="mx-auto mb-8 drop-shadow-[0_0_25px_rgba(212,0,0,0.7)] animate-pulse" />
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
            {authMode === 'login' && <><span className="text-primary">Acesso</span> Dimensão</>}
            {authMode === 'signup' && <><span className="text-primary">Criar</span> Identidade</>}
            {authMode === 'recover' && <><span className="text-primary">Resgatar</span> Código</>}
          </h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">Painel de Controle Elite</p>
        </div>

        <div className="bg-surface-dark/50 backdrop-blur-xl border border-border-dark p-6 md:p-10 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">E-mail Credenciado</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Código Secreto</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <button type="button" onClick={() => setAuthMode('signup')} className="text-[10px] font-bold text-gray-500 hover:text-primary uppercase tracking-widest transition-colors">Criar Conta</button>
                <button type="button" onClick={() => setAuthMode('recover')} className="text-[10px] font-bold text-gray-500 hover:text-primary uppercase tracking-widest transition-colors">Esqueceu a senha?</button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validando...' : 'Validar Identidade'}
              </button>
            </form>
          )}

          {authMode === 'signup' && (
            <form onSubmit={async (e) => {
              await handleSignup(e);
              if (!loading) { // Wait for state? No, logic is inside handleSignup but it's async. 
                // Better to put the alert inside handleSignup actually.
                // But I need to change the div class anyway.
              }
            }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">E-mail de Cadastro</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">CPF do Operador</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Senha de Operador</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Acesso'}
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Já possuo acesso
              </button>
            </form>
          )}

          {authMode === 'recover' && (
            <form onSubmit={handleRecover} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl mb-4 text-center">
                <p className="text-[10px] text-primary font-bold uppercase leading-tight">Um código de recuperação será enviado para seu e-mail criptografado.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">E-mail Cadastrado</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-dark-2 border border-border-dark rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full text-[10px) font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
