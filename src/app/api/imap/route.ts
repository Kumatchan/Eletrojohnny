import { NextResponse } from 'next/server';
import imap from 'imap-simple';
import { db } from '@/db';
import { emailConfigs, energyRecords } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { parseJapaneseEnergyEmail, parseEnergyEmail } from '@/lib/energy-parser';

interface ImapConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

// Função para conectar ao IMAP
async function connectToImap(config: ImapConfig): Promise<imap.ImapSimple> {
  const connection = await imap.connect({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: true,
    authTimeout: 30000,
  });
  return connection;
}

// Função para buscar e processar e-mails da companhia de energia
async function fetchAndProcessEmails(
  config: ImapConfig,
  energyCompanyEmail: string,
  userId: string
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  try {
    const connection = await connectToImap(config);
    
    // Abre a caixa de entrada
    await connection.openBox('INBOX');
    
    // Busca e-mails do remetente da companhia de energia
    const searchCriteria = [
      'ALL',
      ['FROM', energyCompanyEmail]
    ];

    const fetchOptions = {
      bodies: ['TEXT'],
      struct: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    
    console.log(`Encontrados ${messages.length} e-mails da companhia de energia`);

    for (const message of messages) {
      try {
        // Obtém o corpo do e-mail
        const bodyPart = message.parts.find((part: any) => part.which === 'TEXT');
        const body = bodyPart?.body as string;
        
        if (!body) continue;

        // Tenta detectar o formato (japonês ou genérico)
        let parsed;
        if (body.includes('消費電力量') || body.includes('買電電力量') || body.includes('売電電力量')) {
          parsed = parseJapaneseEnergyEmail(body);
        } else {
          parsed = parseEnergyEmail(body);
        }

        // Se temos dados válidos, salva no banco
        if (parsed.date && (parsed.produced !== null || parsed.consumed !== null)) {
          // Verifica se já existe registro para essa data
          const existing = await db.select()
            .from(energyRecords)
            .where(and(
              eq(energyRecords.date, parsed.date),
              eq(energyRecords.userId, userId)
            ))
            .limit(1);

          if (existing.length === 0) {
            // Insere novo registro
            await db.insert(energyRecords).values({
              userId,
              date: parsed.date,
              produced: parsed.produced ?? 0,
              consumed: parsed.consumed ?? 0,
              exported: parsed.exported ?? 0,
              imported: parsed.imported ?? 0,
              savings: 0, // Calculado automaticamente
              emailSubject: message.attributes?.subject ?? null,
              emailDate: new Date(message.attributes?.date as string) ?? null,
            });
            processed++;
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        errors.push(`Erro ao processar e-mail: ${errorMsg}`);
        console.error('Erro ao processar e-mail:', err);
      }
    }

    // Desconecta
    connection.end();

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    errors.push(`Erro ao conectar ao IMAP: ${errorMsg}`);
    console.error('Erro ao conectar ao IMAP:', err);
  }

  return { processed, errors };
}

// POST - Salvar configuração e iniciar sincronização
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId,
      email,
      imapHost,
      imapPort,
      imapUser,
      imapPassword,
      energyCompanyEmail 
    } = body;

    // Valida campos obrigatórios
    if (!userId || !email || !imapHost || !imapPort || !imapUser || !imapPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Salva ou atualiza configuração no banco
    const existingConfig = await db.select()
      .from(emailConfigs)
      .where(eq(emailConfigs.userId, userId))
      .limit(1);

    if (existingConfig.length > 0) {
      // Atualiza configuração existente
      await db.update(emailConfigs)
        .set({
          email,
          imapHost,
          imapPort,
          imapUser,
          imapPassword,
          energyCompanyEmail: energyCompanyEmail || null,
          updatedAt: new Date(),
        })
        .where(eq(emailConfigs.userId, userId));
    } else {
      // Insere nova configuração
      await db.insert(emailConfigs).values({
        userId,
        email,
        imapHost,
        imapPort,
        imapUser,
        imapPassword,
        energyCompanyEmail: energyCompanyEmail || null,
      });
    }

    // Se tem e-mail da companhia, sincroniza
    if (energyCompanyEmail) {
      const result = await fetchAndProcessEmails(
        { host: imapHost, port: imapPort, user: imapUser, password: imapPassword },
        energyCompanyEmail,
        userId
      );

      return NextResponse.json({
        success: true,
        message: 'Configuração salva e e-mails sincronizados',
        processed: result.processed,
        errors: result.errors
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração salva. Adicione o e-mail da companhia de energia para sincronizar dados.'
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Erro na API IMAP:', err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

// GET - Buscar configuração do usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const config = await db.select()
      .from(emailConfigs)
      .where(eq(emailConfigs.userId, userId))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({ configured: false });
    }

    // Retorna configuração sem a senha
    return NextResponse.json({
      configured: true,
      email: config[0].email,
      imapHost: config[0].imapHost,
      imapPort: config[0].imapPort,
      imapUser: config[0].imapUser,
      energyCompanyEmail: config[0].energyCompanyEmail,
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Erro ao buscar configuração:', err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
