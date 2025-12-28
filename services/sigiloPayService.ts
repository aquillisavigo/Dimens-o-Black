
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
    const publicKey = import.meta.env.VITE_SIGILOPAY_PUBLIC_KEY;
    const secretKey = import.meta.env.VITE_SIGILOPAY_SECRET_KEY;

    if (!publicKey || !secretKey) {
        throw new Error('Chaves da SigiloPay não configuradas. Verifique o arquivo .env.local');
    }

    try {
        const response = await axios.post<SigiloPayPixResponse>(PROXY_PATH, data, {
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': publicKey,
                'x-secret-key': secretKey,
            },
        });

        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const apiError = error.response.data as any;
            throw new Error(apiError.message || 'Erro ao processar Pix na SigiloPay');
        }
        console.error('Erro na requisição Pix:', error);
        throw new Error('Erro de conexão. Certifique-se de que o servidor local foi reiniciado após a alteração das chaves.');
    }
};
