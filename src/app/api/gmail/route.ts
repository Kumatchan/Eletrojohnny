import { NextResponse } from 'next/server';
import { createAuthenticatedClient, getEmails, extractEmailBody, getUserInfo } from '@/lib/google-auth';
import { parseJapaneseEnergyEmail } from '@/lib/energy-parser';

/**
 * API endpoint para buscar e-mails de energia do Gmail
 * 
 * Filtra e-mails do remetente kp-net@kp-net.com
 * e extrai os dados de energia
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');

    if (!tokensParam) {
      return NextResponse.json({ 
        error: 'Tokens não fornecidos',
        demo: true 
      }, { status: 401 });
    }

    // Decodifica os tokens
    let tokens;
    try {
      const decoded = Buffer.from(tokensParam, 'base64').toString('utf-8');
      tokens = JSON.parse(decoded);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Formato de token inválido',
        demo: true 
      }, { status: 400 });
    }

    // Verifica se os tokens têm a estrutura necessária
    if (!tokens.access_token) {
      return NextResponse.json({ 
        error: 'Token inválido',
        demo: true 
      }, { status: 400 });
    }

    // Verifica se o token expirou
    if (tokens.expiry_date) {
      const expiryTime = new Date(tokens.expiry_date).getTime();
      const now = Date.now();
      if (expiryTime < now) {
        return NextResponse.json({ 
          error: 'Token expirado',
          expired: true,
          demo: true 
        }, { status: 400 });
      }
    }

    // Cria cliente autenticado
    const auth = createAuthenticatedClient(tokens);
    
    // Obtém informações do usuário
    const userInfo = await getUserInfo(auth);
    
    // Busca e-mails do remetente kp-net@kp-net.com
    // O filtro 'from:' filtra pelo remetente
    const emails = await getEmails(auth, 'from:kp-net@kp-net.com', 50);

    if (emails.length === 0) {
      return NextResponse.json({
        user: userInfo,
        emails: [],
        energyData: [],
        message: 'Nenhum e-mail encontrado da compania de energia',
      });
    }

    // Processa cada e-mail para extrair dados de energia
    const energyData = [];
    
    for (const email of emails) {
      const body = extractEmailBody(email.payload);
      const parsed = parseJapaneseEnergyEmail(body);
      
      if (parsed.date && (parsed.produced || parsed.consumed || parsed.imported || parsed.exported)) {
        energyData.push({
          id: email.id,
          date: parsed.date,
          consumed: parsed.consumed,
          imported: parsed.imported,
          exported: parsed.exported,
          produced: parsed.produced,
          snippet: email.snippet,
        });
      }
    }

    // Ordena por data (mais recente primeiro)
    energyData.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      user: userInfo,
      emails: emails.length,
      energyData,
      message: `Encontrados ${energyData.length} registros de energia`,
    });

  } catch (error) {
    console.error('Erro ao buscar e-mails:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({
      error: 'Falha ao buscar dados',
      details: errorMessage,
      demo: true
    }, { status: 500 });
  }
}
