import { supabase } from '../supabaseClient';

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const analytics = {
    initialize: async () => {
        try {
            console.log('[Analytics] Initializing...');

            // Check if active
            const { data: activeData, error: activeError } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'gtm_active')
                .maybeSingle();

            if (activeError) {
                console.error('[Analytics] Error fetching status:', activeError);
                return;
            }

            console.log('[Analytics] Active Data:', activeData);
            const isActive = activeData?.value === 'true';

            if (!isActive) {
                console.log('[Analytics] GTM is disabled.');
                return;
            }

            // Get ID
            const { data: idData, error: idError } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'gtm_id')
                .maybeSingle();

            if (idError) {
                console.error('[Analytics] Error fetching ID:', idError);
                return;
            }

            const gtmId = idData?.value;
            console.log('[Analytics] Found GTM ID:', gtmId);

            if (gtmId && !document.getElementById('gtm-script')) {
                // Initialize dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });

                // Inject Script
                console.log('[Analytics] Injecting GTM Script...');
                const script = document.createElement('script');
                script.id = 'gtm-script';
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
                document.head.appendChild(script);
            } else {
                console.log('[Analytics] Script already exists or ID missing.');
            }
        } catch (err) {
            console.error('[Analytics] Critical error:', err);
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
