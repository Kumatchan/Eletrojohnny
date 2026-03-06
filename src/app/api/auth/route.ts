import { NextResponse } from 'next/server';
import { createOAuth2Client, getAuthUrl, getTokens } from '@/lib/google-auth';

// GET: Inicia o fluxo de autenticação
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  // Verifica se o OAuth está configurado
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({
      error: 'OAuth não configurado',
      message: 'Configure as variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET',
      setup: true,
    }, { status: 400 });
  }
  
  const oauth2Client = createOAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth',
  });
  
  // Se temos um código, trocamos por tokens
  if (code) {
    try {
      const tokens = await getTokens(oauth2Client, code);
      
      // Codifica os tokens para passar na URL
      const tokensEncoded = Buffer.from(JSON.stringify(tokens)).toString('base64');
      
      // Redireciona de volta para o app com os tokens
      return NextResponse.redirect(
        new URL(`${redirect}?tokens=${tokensEncoded}`, request.url)
      );
    } catch (error) {
      console.error('Erro ao obter tokens:', error);
      return NextResponse.json({
        error: 'Falha na autenticação',
        message: 'Não foi possível obter os tokens de acesso',
      }, { status: 400 });
    }
  }
  
  // Se não temos código, gera URL de autorização
  const authUrl = getAuthUrl(oauth2Client);
  
  // Redireciona para a página de autorização do Google
  return NextResponse.redirect(authUrl);
}
