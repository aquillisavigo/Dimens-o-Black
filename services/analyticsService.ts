import { supabase } from '../supabaseClient';

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const analytics = {
    initialize: async () => {
        try {
            // Check if active
            const { data: activeData } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'gtm_active')
                .maybeSingle();

            const isActive = activeData?.value === 'true';

            if (!isActive) return;

            // Get ID
            const { data: idData } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'gtm_id')
                .maybeSingle();

            const gtmId = idData?.value;

            if (gtmId && !document.getElementById('gtm-script')) {
                // Initialize dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });

                // Inject Script
                const script = document.createElement('script');
                script.id = 'gtm-script';
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
                document.head.appendChild(script);
            }
        } catch (err) {
            console.error('Error initializing analytics:', err);
        }
    },

    trackEvent: (eventName: string, params: any = {}) => {
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: eventName,
                ...params
            });
        }
    }
};
