import { NextResponse } from 'next/server';
import { DashboardStats } from '@/lib/types';

// Endpoint para buscar dados de energia
// SEMPRE retorna dados de demonstração para evitar erros de OAuth
export async function GET(request: Request) {
  try {
    // Sempre retorna dados de demonstração
    // O OAuth foi desabilitado para evitar erros de app não verificado
    return NextResponse.json(getDemoData());
    
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
