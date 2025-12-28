
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

// Determinar o endpoint correto baseado no ambiente
const isDev = import.meta.env.DEV;

// Em desenvolvimento: usa o proxy do Vite
// Em produção: usa a Serverless Function da Vercel
const API_ENDPOINT = isDev
    ? '/sigilopay-api/api/v1/gateway/pix/qrcode'  // Proxy local do Vite
    : '/api/pix';  // Serverless Function da Vercel

export const generatePix = async (data: SigiloPayPixRequest): Promise<SigiloPayPixResponse> => {
    // Em produção, a autenticação é feita na Serverless Function
    // Em desenvolvimento, enviamos as credenciais diretamente

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    let payload: any = { ...data };

    // Apenas em desenvolvimento precisamos enviar as credenciais do cliente
    if (isDev) {
        const publicKey = import.meta.env.VITE_SIGILOPAY_PUBLIC_KEY?.trim();
        const secretKey = import.meta.env.VITE_SIGILOPAY_SECRET_KEY?.trim();

        if (!publicKey || !secretKey) {
            throw new Error('Chaves da SigiloPay não configuradas. Verifique o arquivo .env.local');
        }

        // Debug: Log key prefix to verify loaded values
        console.log('DEV Mode - Sending Pix Request with keys:', {
            public: publicKey.substring(0, 10) + '...',
            secret: secretKey.substring(0, 4) + '...'
        });

        // Generate Basic Auth token
        const credentials = btoa(`${publicKey}:${secretKey}`);

        // Extrair company ID da chave pública
        let companyId = '';
        if (publicKey.includes('_')) {
            companyId = publicKey.split('_')[0];
        }

        // Adicionar headers de autenticação
        headers['Authorization'] = `Basic ${credentials}`;
        headers['X-Public-Key'] = publicKey;
        headers['X-Secret-Key'] = secretKey;
        headers['Client-ID'] = publicKey;
        headers['Client-Secret'] = secretKey;
        headers['x-client-id'] = publicKey;
        headers['x-client-secret'] = secretKey;
        headers['ci'] = publicKey;
        headers['cs'] = secretKey;

        // Adicionar credenciais ao payload
        payload = {
            ...payload,
            client_id: publicKey,
            client_secret: secretKey,
            public_key: publicKey,
            secret_key: secretKey,
            request_token: secretKey,
            company: companyId || undefined,
            company_id: companyId || undefined,
            account_id: companyId || undefined,
            ci: publicKey,
            cs: secretKey
        };
    } else {
        console.log('PROD Mode - Using Serverless Function at /api/pix');
    }

    try {
        const response = await axios.post<SigiloPayPixResponse>(API_ENDPOINT, payload, { headers });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const apiError = error.response.data as any;
            const status = error.response.status;

            if (status === 400 && apiError.error === 'Company not found') {
                throw new Error(`Erro de Autenticação (Company not found): As chaves informadas não foram reconhecidas. Verifique as variáveis de ambiente na Vercel.`);
            }

            throw new Error(`Erro SigiloPay (${status}): ${apiError.message || apiError.error || JSON.stringify(apiError)}`);
        }

        console.error('Erro na requisição Pix:', error);
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
};
