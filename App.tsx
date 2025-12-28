
import React, { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ActiveTab } from './types';
import { supabase } from './supabaseClient';

// Views
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ProfileView from './views/ProfileView';
import OfertasClonadasView from './views/OfertasClonadasView';
import BlackMoneyView from './views/BlackMoneyView';
import PlansView from './views/PlansView';
import KLRemotasView from './views/KLRemotasView';
import AdminView from './views/AdminView';
import MyDownloadsView from './views/MyDownloadsView';
import TemasView from './views/TemasView';
import SolicitarClonagemView from './views/SolicitarClonagemView';
import SocialProofPopup from './components/SocialProofPopup';

// Sistema de Notificação (Toast)
const Toast: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-center gap-3 ${type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-primary/90 border-red-400 text-white'
    }`}>
    <span className="material-symbols-outlined">{type === 'success' ? 'check_circle' : 'error'}</span>
    <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
  </div>
);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tema local (fallback enquanto carrega perfil)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navegação baseada em Hash
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const hash = window.location.hash.replace('#', '') as ActiveTab;
    const validTabs: ActiveTab[] = ['dashboard', 'black-money', 'temas', 'clonagem', 'planos', 'forum', 'networking', 'ofertas-clonadas', 'profile', 'kl-remotas', 'admin', 'downloads'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Monitora Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);

        // Realtime Profile Updates (Balance, Notifications, etc)
        const channel = supabase
          .channel(`profile-${session.user.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          }, (payload) => {
            console.log('Profile updated realtime:', payload.new);
            setProfile((prev: any) => ({ ...prev, ...payload.new }));

            // Show toast if balance increased
            if (payload.old && payload.new.balance > payload.old.balance) {
              const diff = payload.new.balance - payload.old.balance;
              showToast(`Recebido: ${diff.toFixed(2)} Dark Coins!`, 'success');
            }
          })
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setTheme(data.theme as 'dark' | 'light');
    }
  };

  // Sincroniza Tema com DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sincroniza Hash da URL
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Escuta mudanças no botão voltar do navegador
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (session) {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: nextTheme })
        .eq('id', session.user.id);

      if (error) showToast('Erro ao salvar preferência de tema.', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard');
  };

  const handlePurchase = async (price: number, name: string, productId?: string) => {
    if (profile && profile.balance >= price) {
      const newBalance = profile.balance - price;

      // 1. Atualiza Saldo
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', session.user.id);

      if (balanceError) {
        showToast('Erro ao processar pagamento.', 'error');
        return false;
      }

      // 2. Se for um produto do banco, registra a compra
      if (productId) {
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert([{
            user_id: session.user.id,
            product_id: productId,
            price_paid: price
          }]);

        if (purchaseError) {
          showToast('Pagamento ok, mas erro ao liberar arquivo. Contate o suporte.', 'error');
          return false;
        }
      }

      setProfile({ ...profile, balance: newBalance });
      showToast(`${name} adquirido com sucesso!`, 'success');

      // 3. Sistema de Notificações
      // Notificação Pessoal
      supabase.from('notifications').insert([{
        user_id: session.user.id,
        title: 'Compra Realizada',
        message: `Você adquiriu ${name} com sucesso!`,
        type: 'success'
      }]).then();

      // Notificação Global (Social Proof)
      supabase.from('notifications').insert([{
        user_id: null, // Global
        title: 'Nova Aquisição',
        message: `${profile.full_name || 'Alguém'} acabou de adquirir: ${name}`,
        type: 'purchase',
        metadata: { product_name: name, buyer_name: profile.full_name }
      }]).then();

      if (productId) setActiveTab('downloads');
      return true;
    } else {
      showToast('Saldo insuficiente em Dark Coins.', 'error');
      return false;
    }
  };

  const handleRecharge = async (amount: number) => {
    if (profile) {
      const newBalance = profile.balance + amount;

      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', session.user.id);

      if (error) {
        showToast('Erro ao recarregar saldo.', 'error');
      } else {
        setProfile({ ...profile, balance: newBalance });
        showToast(`${amount} Dark Coins adicionados com sucesso!`, 'success');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginView onLogin={() => { }} onToast={showToast} />;
  }

  const renderContent = () => {
    const balance = profile?.balance || 0;

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTabChange={setActiveTab} />;
      case 'profile':
        return <ProfileView profile={profile} onUpdate={() => fetchProfile(session?.user?.id)} />;
      case 'temas':
        return <TemasView balance={balance} onPurchase={handlePurchase} />;
      case 'clonagem':
        return <SolicitarClonagemView balance={balance} onPurchase={handlePurchase} />;
      case 'ofertas-clonadas':
        return <OfertasClonadasView balance={balance} onPurchase={handlePurchase} />;
      case 'black-money':
        return (
          <BlackMoneyView
            balance={balance}
            onRecharge={handleRecharge}
            userEmail={session?.user?.email}
            userName={profile?.full_name}
            userDocument={profile?.document}
          />
        );
      case 'planos':
        return (
          <PlansView
            userEmail={session?.user?.email}
            userName={profile?.full_name}
            userDocument={profile?.document}
          />
        );
      case 'kl-remotas':
        return <KLRemotasView balance={balance} onPurchase={handlePurchase} />;
      case 'admin':
        return <AdminView />;
      case 'downloads':
        return <MyDownloadsView userId={session?.user?.id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 animate-in fade-in duration-500">
            <span className="material-symbols-outlined text-6xl text-gray-700">construction</span>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase">Módulo em Desenvolvimento</h2>
            <p className="text-gray-500 max-w-xs">Nossos engenheiros estão codificando esta funcionalidade. Volte em breve.</p>
            <button onClick={() => setActiveTab('dashboard')} className="bg-primary px-8 py-3 rounded-xl font-bold text-white uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all">Voltar ao Painel</button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <SpeedInsights />
      <SocialProofPopup />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        profile={profile}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isDarkMode={theme === 'dark'}
          onToggleTheme={toggleTheme}
          onProfileClick={() => setActiveTab('profile')}
          userName={profile?.full_name || 'Operador'}
          userId={session.user.id.substring(0, 8).toUpperCase()}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-4 scroll-smooth bg-background-light dark:bg-background-dark relative transition-colors duration-300">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            {renderContent()}

            <footer className="mt-12 pt-6 border-t border-border-light dark:border-border-dark text-center pb-4 opacity-50">
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] m-0">Dimensão Black Dashboard • High Performance Marketing Infrastructure</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
