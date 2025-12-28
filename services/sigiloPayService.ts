
import axios from 'axios';

// --- TYPES ---

export interface SigiloPayClient {
    name: string;
    email: string;
    phone: string;
    document: string;
}

export interface SigiloPayPixRequest {
    identifier: string;
    amount: number;
    client: SigiloPayClient;
    products?: any[];
    metadata?: any;
}

export interface SigiloPayPixResponse {
    transactionId: string;
    status: 'OK' | 'FAILED' | 'PENDING' | 'REJECTED' | 'CANCELED';
    pix: {
        code: string;
        base64?: string;
        image?: string;
    };
    errorDescription?: string;
}

// --- SERVICE ---

// Usando o Proxy interno do Vite (configurado no vite.config.ts)
// Isso resolve o erro de REDE (CORS) localmente de forma definitiva.
const PROXY_PATH = '/sigilopay-api/api/v1/gateway/pix/receive';

export const generatePix = async (data: SigiloPayPixRequest): Promise<SigiloPayPixResponse> => {
    const publicKey = import.meta.env.VITE_SIGILOPAY_PUBLIC_KEY?.trim();
    const secretKey = import.meta.env.VITE_SIGILOPAY_SECRET_KEY?.trim();

    if (!publicKey || !secretKey) {
        throw new Error('Chaves da SigiloPay não configuradas. Verifique o arquivo .env.local');
    }

    // Debug: Log key prefix to verify loaded values
    console.log('Sending Pix Request with keys:', {
        public: publicKey.substring(0, 10) + '...',
        secret: secretKey.substring(0, 4) + '...'
    });

    // Generate Basic Auth token
    const credentials = btoa(`${publicKey}:${secretKey}`);

    try {
        const response = await axios.post<SigiloPayPixResponse>(PROXY_PATH, data, {
            headers: {
                'Content-Type': 'application/json',
                // Basic Auth Standard
                'Authorization': `Basic ${credentials}`,

                // Keep explicit headers as fallback
                'X-Public-Key': publicKey,
                'X-Secret-Key': secretKey,
                'Client-ID': publicKey,
                'Client-Secret': secretKey,
                'x-client-id': publicKey,
                'x-client-secret': secretKey
            },
        });

        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const apiError = error.response.data as any;
            const status = error.response.status;

            if (status === 400 && apiError.error === 'Company not found') {
                throw new Error(`Erro de Autenticação (Company not found): As chaves informadas não foram reconhecidas. Verifique se copiou corretamente "VITE_SIGILOPAY_PUBLIC_KEY" e "VITE_SIGILOPAY_SECRET_KEY". (Public Key enviada iniciando com: ${publicKey.substring(0, 5)}...)`);
            }

            // Include status code and raw data for debugging
            throw new Error(`Erro SigiloPay (${status}): ${apiError.message || JSON.stringify(apiError) || 'Sem mensagem de erro'}`);
        }
        console.error('Erro na requisição Pix:', error);

        // Verifica se o erro é relacionado a chaves (frequentemente 401 ou 403, mas aqui pegamos erros genéricos de conexão/config)
        if (!publicKey || !secretKey) {
            throw new Error('Chaves da SigiloPay NÃO configuradas. No Vercel, vá em Settings > Environment Variables e configure VITE_SIGILOPAY_PUBLIC_KEY e VITE_SIGILOPAY_SECRET_KEY.');
        }

        throw new Error('Erro de conexão ou configuração. Verifique se as chaves da SigiloPay estão corretas no Vercel (Environment Variables).');
    }
};
