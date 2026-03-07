import { NextResponse } from 'next/server';
import { createAuthenticatedClient, getUserInfo } from '@/lib/google-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokensParam = searchParams.get('tokens');

  if (!tokensParam) {
    return NextResponse.json({ error: 'Tokens não fornecidos' }, { status: 400 });
  }

  try {
    const tokens = JSON.parse(Buffer.from(tokensParam, 'base64').toString('utf-8'));
    const auth = createAuthenticatedClient(tokens);
    const userInfo = await getUserInfo(auth);

    if (!userInfo) {
      return NextResponse.json({ error: 'Não foi possível obter informações do usuário' }, { status: 400 });
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Erro ao obter user info:', error);
    return NextResponse.json({ error: 'Falha ao obter informações do usuário' }, { status: 400 });
  }
}
