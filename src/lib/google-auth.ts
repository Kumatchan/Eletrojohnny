import { google, gmail_v1 } from 'googleapis';

/**
 * Configuração do OAuth2 do Google
 * Para usar, você precisa:
 * 1. Criar um projeto no Google Cloud Console
 * 2. Habilitar a Gmail API
 * 3. Criar credenciais OAuth2
 * 4. Definir as variáveis de ambiente
 */

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

interface OAuth2Client {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Cria o cliente OAuth2 configurado
 */
export function createOAuth2Client(config: OAuth2Client) {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
  
  return oauth2Client;
}

/**
 * Gera a URL de autorização
 */
export function getAuthUrl(oauth2Client: any): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Troca o código de autorização por tokens
 */
export async function getTokens(oauth2Client: any, code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Cria cliente autenticado com tokens
 */
export function createAuthenticatedClient(tokens: any) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials(tokens);
  
  // Renova tokens automaticamente
  oauth2Client.on('tokens', (tokens: any) => {
    if (tokens.access_token) {
      oauth2Client.setCredentials(tokens);
    }
  });
  
  return oauth2Client;
}

/**
 * Interface para mensagem do Gmail
 */
interface GmailMessage {
  id: string | null | undefined;
  snippet?: string;
  payload?: {
    parts?: Array<{
      mimeType?: string;
      body?: {
        data?: string;
      };
    }>;
    body?: {
      data?: string;
    };
  };
}

/**
 * Busca e-mails da caixa de entrada
 */
export async function getEmails(auth: any, query: string, maxResults: number = 10): Promise<GmailMessage[]> {
  const gmail = google.gmail({ version: 'v1', auth });
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });
  
  const messages = response.data.messages || [];
  
  const emails: GmailMessage[] = [];
  for (const message of messages) {
    if (!message.id) continue;
    
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });
    
    emails.push({
      id: message.id || '',
      snippet: email.data.snippet || '',
      payload: email.data.payload as GmailMessage['payload'],
    });
  }
  
  return emails;
}

/**
 * Extrai o corpo do e-mail
 */
export function extractEmailBody(payload: any): string {
  if (!payload) return '';
  
  // Verifica se é multipart
  const parts = payload.parts || [];
  
  // Procura a parte com o corpo do e-mail
  for (const part of parts) {
    if (part.mimeType === 'text/plain') {
      return Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.mimeType === 'text/html') {
      return Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
  }
  
  // Se não encontrar partes, tenta o corpo direto
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  return '';
}

/**
 * Verifica se o OAuth está configurado corretamente
 */
export function isOAuthConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Obtém informações do usuário autenticado
 */
export async function getUserInfo(auth: any): Promise<{ email: string; name?: string } | null> {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const response = await oauth2.userinfo.get();
    
    if (!response.data.email) {
      console.error('Email não encontrado na resposta:', response.data);
      return null;
    }
    
    return {
      email: response.data.email,
      name: response.data.name || undefined,
    };
  } catch (error: any) {
    console.error('Erro ao obter info do usuário:', error.message || error);
    // Log more details for debugging
    if (error.response?.data) {
      console.error('Google API error response:', error.response.data);
    }
    return null;
  }
}
