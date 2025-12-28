
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface NotificationCenterProps {
    userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`user-notifications-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    };

    const markAllAsRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAllAsRead();
                }}
                className={`relative p-2 rounded-xl transition-all duration-200 ${isOpen ? 'bg-primary/10 text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-background-dark animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Notificações</h3>
                            {unreadCount > 0 && (
                                <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} Novas
                                </span>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-4xl mb-2">notifications_off</span>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tudo limpo por aqui</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {n.type === 'success' ? 'check' : n.type === 'warning' ? 'priority_high' : 'info'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{n.title}</p>
                                                <p className="text-[10px] text-gray-500 leading-normal mt-0.5">{n.message}</p>
                                                <p className="text-[8px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-white/5 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors"
                            >
                                Fechar Painel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
