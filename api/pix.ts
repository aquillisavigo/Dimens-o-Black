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

    // Preparar payload conforme documentação oficial
    const payload = {
        identifier: req.body.identifier,
        amount: req.body.amount,
        client: req.body.client,
        products: req.body.products,
        metadata: req.body.metadata
    };

    console.log('SigiloPay Request:', {
        publicKeyPrefix: publicKey.substring(0, 10) + '...',
        identifier: req.body?.identifier,
        amount: req.body?.amount
    });

    try {
        // Endpoint correto conforme documentação: /pix/receive
        const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': publicKey,
                'x-secret-key': secretKey
            },
            body: JSON.stringify(payload)
        });

        // Ler resposta como texto primeiro
        const responseText = await response.text();

        console.log('SigiloPay Raw Response:', {
            status: response.status,
            contentType: response.headers.get('content-type'),
            bodyPreview: responseText.substring(0, 200)
        });

        // Tentar fazer parse do JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            // Resposta não é JSON válido
            console.error('SigiloPay returned non-JSON response:', responseText);
            return res.status(response.status || 500).json({
                error: 'Resposta inválida da SigiloPay',
                message: responseText || 'A API retornou uma resposta vazia ou inválida',
                rawResponse: responseText
            });
        }

        console.log('SigiloPay Parsed Response:', {
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
