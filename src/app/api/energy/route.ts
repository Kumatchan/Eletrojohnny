import { NextResponse } from 'next/server';
import { createAuthenticatedClient, getEmails, extractEmailBody, getUserInfo } from '@/lib/google-auth';
import { parseJapaneseEnergyEmail, createDashboardStats, processEnergyData } from '@/lib/energy-parser';

/**
 * API endpoint para buscar dados de energia
 * 
 * Se o usuário estiver logado (tokens fornecidos), busca dados reais do Gmail
 * Caso contrário, retorna dados de demonstração
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');

    // Se não tem tokens, retorna dados de demonstração
    if (!tokensParam) {
      return NextResponse.json(getDemoData());
    }

    // Decodifica os tokens
    let tokens;
    try {
      const decoded = Buffer.from(tokensParam, 'base64').toString('utf-8');
      tokens = JSON.parse(decoded);
    } catch (parseError) {
      console.error('Erro ao decodificar tokens:', parseError);
      return NextResponse.json(getDemoData());
    }

    // Verifica se os tokens têm a estrutura necessária
    if (!tokens.access_token) {
      console.error('Token sem access_token');
      return NextResponse.json(getDemoData());
    }

    // Verifica se o token expirou
    if (tokens.expiry_date) {
      const expiryTime = new Date(tokens.expiry_date).getTime();
      const now = Date.now();
      if (expiryTime < now) {
        console.error('Token expirado');
        return NextResponse.json(getDemoData());
      }
    }

    try {
      // Cria cliente autenticado
      const auth = createAuthenticatedClient(tokens);
      
      // Obtém informações do usuário
      const userInfo = await getUserInfo(auth);
      console.log('Usuário logado:', userInfo?.email);
      
      // Busca e-mails do remetente kp-net@kp-net.com
      // O filtro 'from:' filtra pelo remetente
      const emails = await getEmails(auth, 'from:kp-net@kp-net.com', 100);

      console.log('E-mails encontrados:', emails.length);

      if (emails.length === 0) {
        // Retorna dados de demonstração se não encontrou e-mails
        return NextResponse.json({
          ...getDemoData(),
          user: userInfo,
          hasGmailData: false,
          message: 'Nenhum e-mail encontrado. Usando dados de demonstração.',
        });
      }

      // Processa cada e-mail para extrair dados de energia
      const rawEnergyData = [];
      
      for (const email of emails) {
        const body = extractEmailBody(email.payload);
        const parsed = parseJapaneseEnergyEmail(body);
        
        if (parsed.date && (parsed.produced || parsed.consumed || parsed.imported || parsed.exported)) {
          rawEnergyData.push({
            id: email.id,
            date: parsed.date,
            consumed: parsed.consumed,
            imported: parsed.imported,
            exported: parsed.exported,
            produced: parsed.produced,
          });
        }
      }

      console.log('Dados de energia extraídos:', rawEnergyData.length);

      // Se não conseguiu extrair dados, retorna demonstração
      if (rawEnergyData.length === 0) {
        return NextResponse.json({
          ...getDemoData(),
          user: userInfo,
          hasGmailData: false,
          message: 'Não foi possível extrair dados dos e-mails. Usando dados de demonstração.',
        });
      }

      // Processa os dados
      const processedData = processEnergyData(rawEnergyData);
      const stats = createDashboardStats(processedData);

      return NextResponse.json({
        ...stats,
        user: userInfo,
        hasGmailData: true,
        message: `Carregados ${rawEnergyData.length} registros do Gmail`,
      });

    } catch (authError) {
      console.error('Erro com autenticação:', authError);
      // Em caso de erro de autenticação, retorna dados de demonstração
      return NextResponse.json(getDemoData());
    }
      
  } catch (error) {
    console.error('Erro ao buscar dados de energia:', error);
    // Em caso de erro, retorna dados de demonstração
    return NextResponse.json(getDemoData());
  }
}

/**
 * Gera dados de demonstração para testes
 */
function getDemoData(): any {
  const today = new Date();
  const last30Days: any[] = [];
  
  // Gera dados dos últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simula dados realistas
    const produced = Math.round((15 + Math.random() * 20) * 10) / 10;
    const consumed = Math.round((12 + Math.random() * 8) * 10) / 10;
    const exported = Math.round(Math.max(0, produced - consumed * 0.5) * 10) / 10;
    const imported = Math.round(Math.max(0, consumed - (produced - exported)) * 10) / 10;
    
    last30Days.push({
      date: dateStr,
      consumed,
      imported,
      exported,
      produced,
      savings: Math.round((exported * 0.15 - imported * 0.25) * 100) / 100,
    });
  }
  
  // Gera dados mensais (últimos 12 meses)
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = date.toISOString().split('T')[0].substring(0, 7);
    
    // Simula dados realistas com sazonalidade (mais produção no verão)
    const month = date.getMonth();
    const seasonalFactor = month >= 4 && month <= 9 ? 1.3 : 0.7; // Mais sol de maio a setembro
    
    const totalProduced = Math.round((350 + Math.random() * 200) * seasonalFactor);
    const totalConsumed = Math.round(280 + Math.random() * 100);
    const totalExported = Math.round(Math.max(0, totalProduced - totalConsumed * 0.6));
    const totalImported = Math.round(Math.max(0, totalConsumed - (totalProduced - totalExported)));
    const totalSavings = Math.round((totalExported * 0.15 - totalImported * 0.25) * 100) / 100;
    
    monthlyData.push({
      month: monthStr,
      totalConsumed,
      totalImported,
      totalExported,
      totalProduced,
      totalSavings,
      days: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    });
  }
  
  const todayData = last30Days[last30Days.length - 1];
  
  // Gera dados anuais (últimos 5 anos)
  const yearlyData = [];
  for (let i = 4; i >= 0; i--) {
    const year = today.getFullYear() - i;
    const seasonalFactor = year >= 2024 ? 1.2 : 1.0; // Mais produção em sistemas mais novos
    
    const totalProduced = Math.round((4000 + Math.random() * 1500) * seasonalFactor);
    const totalConsumed = Math.round(3200 + Math.random() * 800);
    const totalExported = Math.round(Math.max(0, totalProduced - totalConsumed * 0.6));
    const totalImported = Math.round(Math.max(0, totalConsumed - (totalProduced - totalExported)));
    const totalSavings = Math.round((totalExported * 0.15 - totalImported * 0.25) * 100) / 100;
    
    yearlyData.push({
      month: `${year}-01`,
      totalConsumed,
      totalImported,
      totalExported,
      totalProduced,
      totalSavings,
      days: 365,
    });
  }
  
  return {
    today: {
      date: todayData.date,
      consumed: todayData.consumed,
      imported: todayData.imported,
      exported: todayData.exported,
      produced: todayData.produced,
      selfConsumption: todayData.produced - todayData.exported,
    },
    last7Days: last30Days.slice(-7),
    last30Days,
    monthlyData,
    yearlyData,
    totalProduced: monthlyData.reduce((sum, m) => sum + m.totalProduced, 0),
    totalExported: monthlyData.reduce((sum, m) => sum + m.totalExported, 0),
    totalImported: monthlyData.reduce((sum, m) => sum + m.totalImported, 0),
    totalSavings: monthlyData.reduce((sum, m) => sum + m.totalSavings, 0),
    hasGmailData: false,
    demo: true,
  };
}
