import { NextResponse } from 'next/server';
import { createAuthenticatedClient, getUserInfo } from '@/lib/google-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokensParam = searchParams.get('tokens');

  if (!tokensParam) {
    return NextResponse.json({ error: 'Tokens não fornecidos' }, { status: 400 });
  }

  try {
    // Decodifica os tokens de base64 para objeto JSON
    let tokens;
    try {
      const decoded = Buffer.from(tokensParam, 'base64').toString('utf-8');
      tokens = JSON.parse(decoded);
    } catch (parseError) {
      console.error('Erro ao decodificar tokens:', parseError);
      return NextResponse.json({ error: 'Formato de token inválido' }, { status: 400 });
    }

    // Verifica se os tokens têm a estrutura necessária
    if (!tokens.access_token) {
      console.error('Token sem access_token:', tokens);
      return NextResponse.json({ error: 'Token inválido: missing access_token' }, { status: 400 });
    }

    // Verifica se o token expirou
    if (tokens.expiry_date) {
      const expiryTime = new Date(tokens.expiry_date).getTime();
      const now = Date.now();
      if (expiryTime < now) {
        console.error('Token expirado:', { expiry: expiryTime, now });
        return NextResponse.json({ 
          error: 'Token expirado', 
          details: `O token expirou em ${new Date(tokens.expiry_date).toLocaleString()}`,
          expired: true
        }, { status: 400 });
      }
    }

    const auth = createAuthenticatedClient(tokens);
    const userInfo = await getUserInfo(auth);

    if (!userInfo) {
      return NextResponse.json({ error: 'Não foi possível obter informações do usuário', details: 'O token pode estar expirado ou ser inválido. Faça login novamente.' }, { status: 400 });
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Erro ao obter user info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao obter informações do usuário', details: errorMessage }, { status: 400 });
  }
}
