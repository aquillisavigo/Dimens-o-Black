
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
            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-surface-dark-2 md:bg-surface-dark border border-border-dark rounded-[2rem] animate-pulse-shadow-red overflow-hidden p-8 flex flex-col items-center text-center animate-in zoom-in-50 duration-500 ease-out">

                {/* Background Logo */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://www.upload.ee/image/18931113/logo_do_site_e_nossa_logo_png.png')`,
                        backgroundSize: '160%',
                        opacity: 0.2
                    }}
                ></div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-20"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Content - Removed Logo, added relative z-10 for layering */}
                <h3 className="relative z-10 text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wide leading-tight mb-4 mt-4">
                    Grupo VIP <span className="text-primary text-glow">Exclusivo</span>
                </h3>

                <p className="relative z-10 text-gray-300 text-sm md:text-base mb-8 leading-relaxed font-medium max-w-xs mx-auto">
                    Venha participar do nosso grupo <span className="text-primary font-bold text-glow">VIP</span> no WhatsApp! Receba <strong className="text-white">ofertas insanas</strong>, novidades e <strong className="text-white">networking de alto nível</strong>.
                </p>

                <button
                    onClick={handleJoin}
                    className="relative z-10 w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs shadow-glow transition-all active:scale-95 group overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Participar Agora
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <p className="relative z-10 mt-6 text-[10px] text-red-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                    🔒 Acesso Restrito e Limitado
                </p>
            </div>
        </div>
    );
};

export default WhatsAppPopup;
