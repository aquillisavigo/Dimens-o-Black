
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const WhatsAppPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [link, setLink] = useState('https://chat.whatsapp.com/EJsKlT4ymCrJXAwdwCoCnB'); // Fallback default
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Fetch dynamic link
        const fetchLink = async () => {
            const { data } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'whatsapp_group_link')
                .single();
            if (data?.value) setLink(data.value);
        };

        fetchLink();

        // Timer for 2 seconds
        const timer = setTimeout(() => {
            const closed = sessionStorage.getItem('wa_popup_closed');
            if (!closed) {
                setIsVisible(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setHasInteracted(true);
        sessionStorage.setItem('wa_popup_closed', 'true');
    };

    const handleJoin = () => {
        window.open(link, '_blank');
        handleClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            {/* Modal Container - Circular Style */}
            <div className="relative w-[340px] h-[340px] bg-surface-dark-2 md:bg-black/90 border-2 border-primary/30 rounded-full overflow-hidden p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-50 duration-500 ease-out transition-all animate-pulse-shadow-red">

                {/* Background Logo - Zoomed to remove borders */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://www.upload.ee/image/18931113/logo_do_site_e_nossa_logo_png.png')`,
                        backgroundSize: '135%',
                        opacity: 0.5
                    }}
                ></div>

                {/* Dark Overlay to make text readable */}
                <div className="absolute inset-0 bg-black/60 z-0"></div>

                {/* Glowing Border Animation */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-shadow-red pointer-events-none"></div>

                {/* Close Button - Top Center (Circular Safe Area) */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 left-1/2 -translate-x-1/2 text-white/60 hover:text-white hover:bg-white/10 transition-all p-2 rounded-full z-50 active:scale-90"
                    title="Fechar"
                >
                    <span className="material-symbols-outlined text-xl font-bold drop-shadow-md">close</span>
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3 mt-2 w-full">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider leading-none drop-shadow-md">
                        Grupo VIP <br /><span className="text-primary text-glow text-3xl md:text-4xl">Exclusivo</span>
                    </h3>

                    <p className="text-gray-200 text-xs md:text-sm leading-relaxed max-w-[240px] font-bold my-2 drop-shadow-sm">
                        Receba <strong className="text-white text-glow">ofertas insanas</strong> e networking de alto nível no nosso grupo secreto.
                    </p>

                    <button
                        onClick={handleJoin}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-10 rounded-full uppercase tracking-[0.2em] text-xs shadow-glow transition-all active:scale-95 hover:scale-105 border border-white/10"
                    >
                        Entrar Agora
                    </button>

                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.3em] animate-pulse mt-2 bg-black/40 px-3 py-1 rounded-full border border-red-500/20">
                        🔒 Vagas Limitadas
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppPopup;
