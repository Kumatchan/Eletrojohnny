import { NextResponse } from 'next/server';
import { parseEnergyEmail, processEnergyData, createDashboardStats } from '@/lib/energy-parser';
import { getEmails, extractEmailBody, createAuthenticatedClient, isOAuthConfigured } from '@/lib/google-auth';
import { EnergyData, DashboardStats } from '@/lib/types';

// Endpoint para buscar dados de energia
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    
    // Verifica se o OAuth está configurado
    if (!isOAuthConfigured()) {
      // Retorna dados de demonstração se OAuth não estiver configurado
      return NextResponse.json(getDemoData());
    }
    
    // Em produção, os tokens seriam armazenados de forma segura
    // Por enquanto, vamos verificar se temos tokens na sessão/cookie
    const tokensParam = searchParams.get('tokens');
    
    if (!tokensParam) {
      return NextResponse.json({
        needsAuth: true,
        message: 'Autenticação necessária',
        authUrl: `/api/auth?redirect=${encodeURIComponent('/dashboard')}`,
      });
    }
    
    let tokens;
    try {
      tokens = JSON.parse(Buffer.from(tokensParam, 'base64').toString());
    } catch {
      return NextResponse.json({
        needsAuth: true,
        message: 'Tokens inválidos',
      }, { status: 401 });
    }
    
    // Cria cliente autenticado
    const auth = createAuthenticatedClient(tokens);
    
    // Busca e-mails da empresa de energia
    // Ajuste a query conforme o formato dos e-mails da sua empresa
    const emails = await getEmails(
      auth, 
      'subject:(energia OR consumo OR painel solar OR fotovoltaico) OR from:(energia OR electricidade)',
      30
    );
    
    // Processa os e-mails
    const rawData = [];
    for (const email of emails) {
      const body = extractEmailBody(email.payload);
      const parsed = parseEnergyEmail(body);
      if (parsed.date) {
        rawData.push(parsed);
      }
    }
    
    // Processa dados
    const energyData = processEnergyData(rawData);
    const stats = createDashboardStats(energyData);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar dados de energia:', error);
    
    // Em caso de erro, retorna dados de demonstração
    return NextResponse.json(getDemoData());
  }
}

/**
 * Gera dados de demonstração para testes
 */
function getDemoData(): DashboardStats {
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
  
  // Gera dados mensais
  const monthlyData = [
    {
      month: '2025-10',
      totalConsumed: 320,
      totalImported: 85,
      totalExported: 180,
      totalProduced: 450,
      totalSavings: 12.50,
      days: 31,
    },
    {
      month: '2025-11',
      totalConsumed: 290,
      totalImported: 120,
      totalExported: 150,
      totalProduced: 380,
      totalSavings: -7.50,
      days: 30,
    },
    {
      month: '2025-12',
      totalConsumed: 350,
      totalImported: 180,
      totalExported: 100,
      totalProduced: 320,
      totalSavings: -22.00,
      days: 31,
    },
    {
      month: '2026-01',
      totalConsumed: 310,
      totalImported: 140,
      totalExported: 130,
      totalProduced: 340,
      totalSavings: -10.50,
      days: 31,
    },
    {
      month: '2026-02',
      totalConsumed: 280,
      totalImported: 100,
      totalExported: 160,
      totalProduced: 390,
      totalSavings: 2.00,
      days: 28,
    },
  ];
  
  const todayData = last30Days[last30Days.length - 1];
  
  // Gera dados anuais (por ano)
  const yearlyData = [
    {
      month: '2024-01',
      totalConsumed: 3500,
      totalImported: 1200,
      totalExported: 1800,
      totalProduced: 4200,
      totalSavings: 45.00,
      days: 365,
    },
    {
      month: '2025-01',
      totalConsumed: 3800,
      totalImported: 1400,
      totalExported: 2100,
      totalProduced: 4800,
      totalSavings: 62.50,
      days: 365,
    },
  ];
  
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
  };
}
