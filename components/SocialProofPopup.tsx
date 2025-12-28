
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SocialProofPopup: React.FC = () => {
    const [queue, setQueue] = useState<any[]>([]);
    const [current, setCurrent] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const channel = supabase
            .channel('global-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: 'user_id=is.null'
            }, (payload) => {
                const newNotif = payload.new;
                if (newNotif.type === 'purchase') {
                    setQueue(prev => [...prev, newNotif]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (!isVisible && queue.length > 0) {
            const next = queue[0];
            setCurrent(next);
            setQueue(prev => prev.slice(1));
            setIsVisible(true);

            // Hide after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, queue]);

    if (!current || !isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-left-full duration-700">
            <div className="bg-surface-dark/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-primary animate-pulse">shopping_cart</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Nova Aquisição</p>
                    <p className="text-white text-[11px] font-medium leading-tight">
                        {current.message.replace('acabou de adquirir:', 'adquiriu')}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Agora mesmo
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SocialProofPopup;
