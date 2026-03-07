import { NextResponse } from 'next/server';
import { db } from '@/db';
import { energyRecords } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { EnergyData, DashboardStats, DailySummary, MonthlySummary } from '@/lib/types';

// Endpoint para buscar dados de energia
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // Tenta buscar do banco de dados
    const records = await db.select()
      .from(energyRecords)
      .where(eq(energyRecords.userId, userId))
      .orderBy(desc(energyRecords.date))
      .limit(365);

    if (records.length > 0) {
      // Converter registros do banco para formato do dashboard
      const energyData: EnergyData[] = records.map(r => ({
        date: r.date,
        consumed: r.consumed,
        imported: r.imported,
        exported: r.exported,
        produced: r.produced,
        selfConsumption: Math.max(0, r.produced - r.exported),
      }));

      // Ordenar por data
      energyData.sort((a, b) => a.date.localeCompare(b.date));

      // Criar stats do dashboard
      const stats = createDashboardStats(energyData);
      return NextResponse.json(stats);
    }

    // Se não há dados no banco, retorna dados de demonstração
    return NextResponse.json(getDemoData());
    
  } catch (error) {
    console.error('Erro ao buscar dados de energia:', error);
    // Em caso de erro, retorna dados de demonstração
    return NextResponse.json(getDemoData());
  }
}

/**
 * Cria estatísticas completas para o dashboard
 */
function createDashboardStats(data: EnergyData[]): DashboardStats {
  if (data.length === 0) {
    return getDemoData();
  }
  
  const today = data[data.length - 1];
  const last7Days = data.slice(-7).map(d => createDailySummary(d));
  const last30Days = data.slice(-30).map(d => createDailySummary(d));
  const monthlyData = createMonthlySummary(data);
  
  // Cria dados anuais (resumo por ano)
  const yearlyMap = new Map<string, EnergyData[]>();
  
  for (const item of data) {
    const year = item.date.substring(0, 4); // YYYY
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, []);
    }
    yearlyMap.get(year)!.push(item);
  }
  
  const yearlyData: MonthlySummary[] = [];
  
  for (const [year, items] of yearlyMap) {
    const summary: MonthlySummary = {
      month: `${year}-01`,
      totalConsumed: 0,
      totalImported: 0,
      totalExported: 0,
      totalProduced: 0,
      totalSavings: 0,
      days: items.length,
    };
    
    for (const item of items) {
      summary.totalConsumed += item.consumed;
      summary.totalImported += item.imported;
      summary.totalExported += item.exported;
      summary.totalProduced += item.produced;
      summary.totalSavings += calculateSavings(item.imported, item.exported);
    }
    
    yearlyData.push(summary);
  }
  
  let totalProduced = 0;
  let totalExported = 0;
  let totalImported = 0;
  let totalSavings = 0;
  
  for (const item of data) {
    totalProduced += item.produced;
    totalExported += item.exported;
    totalImported += item.imported;
    totalSavings += calculateSavings(item.imported, item.exported);
  }
  
  return {
    today,
    last7Days,
    last30Days,
    monthlyData,
    yearlyData,
    totalProduced,
    totalExported,
    totalImported,
    totalSavings,
  };
}

/**
 * Cria o resumo diário
 */
function createDailySummary(data: EnergyData): DailySummary {
  return {
    date: data.date,
    consumed: data.consumed,
    imported: data.imported,
    exported: data.exported,
    produced: data.produced,
    savings: calculateSavings(data.imported, data.exported),
  };
}

/**
 * Cria o resumo mensal
 */
function createMonthlySummary(data: EnergyData[]): MonthlySummary[] {
  const monthlyMap = new Map<string, EnergyData[]>();
  
  for (const item of data) {
    const month = item.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, []);
    }
    monthlyMap.get(month)!.push(item);
  }
  
  const summaries: MonthlySummary[] = [];
  
  for (const [month, items] of monthlyMap) {
    const summary: MonthlySummary = {
      month,
      totalConsumed: 0,
      totalImported: 0,
      totalExported: 0,
      totalProduced: 0,
      totalSavings: 0,
      days: items.length,
    };
    
    for (const item of items) {
      summary.totalConsumed += item.consumed;
      summary.totalImported += item.imported;
      summary.totalExported += item.exported;
      summary.totalProduced += item.produced;
      summary.totalSavings += calculateSavings(item.imported, item.exported);
    }
    
    summaries.push(summary);
  }
  
  return summaries.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calcula a economia baseada na energia exportada e preços
 */
function calculateSavings(imported: number, exported: number): number {
  const pricePerKwhImport = 0.25; // Preço de compra
  const pricePerKwhExport = 0.15; // Preço de venda
  
  const importCost = imported * pricePerKwhImport;
  const exportRevenue = exported * pricePerKwhExport;
  
  return Math.round((exportRevenue - importCost) * 100) / 100;
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
  };
}
