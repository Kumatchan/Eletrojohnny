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

    const auth = createAuthenticatedClient(tokens);
    const userInfo = await getUserInfo(auth);

    if (!userInfo) {
      return NextResponse.json({ error: 'Não foi possível obter informações do usuário' }, { status: 400 });
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Erro ao obter user info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao obter informações do usuário', details: errorMessage }, { status: 400 });
  }
}
