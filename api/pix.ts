import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Serverless Function para fazer proxy das requisições para a SigiloPay.
 * Isso resolve o problema de CORS e garante que as credenciais sejam enviadas
 * do lado do servidor (não expostas no cliente).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST é permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const publicKey = process.env.VITE_SIGILOPAY_PUBLIC_KEY?.trim();
    const secretKey = process.env.VITE_SIGILOPAY_SECRET_KEY?.trim();

    if (!publicKey || !secretKey) {
        console.error('SigiloPay keys not configured');
        return res.status(500).json({
            error: 'Chaves da SigiloPay não configuradas no servidor.',
            message: 'Configure VITE_SIGILOPAY_PUBLIC_KEY e VITE_SIGILOPAY_SECRET_KEY nas Environment Variables da Vercel.'
        });
    }

    // Gerar token de autenticação Basic
    const credentials = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

    // Tentar extrair o ID da empresa da chave pública
    let companyId = '';
    if (publicKey.includes('_')) {
        companyId = publicKey.split('_')[0];
    }

    // Preparar payload com todas as variações de credenciais
    const payload = {
        ...req.body,
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

    console.log('SigiloPay Request:', {
        publicKeyPrefix: publicKey.substring(0, 10) + '...',
        companyId: companyId || 'not extracted',
        identifier: req.body?.identifier
    });

    try {
        const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/qrcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
                'X-Public-Key': publicKey,
                'X-Secret-Key': secretKey,
                'Client-ID': publicKey,
                'Client-Secret': secretKey,
                'x-client-id': publicKey,
                'x-client-secret': secretKey,
                'ci': publicKey,
                'cs': secretKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('SigiloPay Response:', {
            status: response.status,
            dataStatus: data.status,
            hasError: !!data.error
        });

        // Se a API retornar erro, repassar com o mesmo status
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('SigiloPay Error:', error);
        return res.status(500).json({
            error: 'Erro ao conectar com SigiloPay',
            message: error.message
        });
    }
}
