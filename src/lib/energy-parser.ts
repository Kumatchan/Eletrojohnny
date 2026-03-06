import { EnergyData, DailySummary, MonthlySummary, DashboardStats } from './types';

/**
 * Parser para extrair dados de energia dos e-mails
 * O formato pode variar dependendo da empresa, aqui está um formato genérico
 * 
 * Exemplos de padrões que podem ser encontrados nos e-mails:
 * - "Consumo: 15.2 kWh"
 * - "Energia comprada: 10.5 kWh"
 * - "Energia vendida: 5.3 kWh"
 * - "Produção: 20.1 kWh"
 * 
 * Formato japonês (kp-net@kp-net.com):
 * □ 消費電力量
 * 15.4 kWh
 * 
 * □ 買電電力量
 * 10.5 kWh
 * 
 * □ 売電電力量
 * 14.2 kWh
 * 
 * □ 全体の発電電力量
 * 19.7 kWh
 */

interface ParsedEmailData {
  date: string;
  consumed: number | null;
  imported: number | null;
  exported: number | null;
  produced: number | null;
}

// Padrões regex para diferentes formatos de e-mail
const patterns = {
  // Data no formato DD/MM/YYYY ou YYYY-MM-DD
  date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  
  // Consumo de energia
  consumed: /(?:consumo|gasto|utilizado)[:\s]*(\d+[.,]?\d*)\s*kWh?/i,
  
  // Energia comprada/importada da rede
  imported: /(?:compra|importado|adquirido|recebido)[:\s]*(\d+[.,]?\d*)\s*kWh?/i,
  
  // Energia vendida/exportada para a rede
  exported: /(?:venda|vendido|exportado|cedido)[:\s]*(\d+[.,]?\d*)\s*kWh?/i,
  
  // Energia produzida pelos painéis solares
  produced: /(?:produção|produzido|gerado)[:\s]*(\d+[.,]?\d*)\s*kWh?/i,
};

// Padrões regex para formato japonês (kp-net@kp-net.com)
const japanesePatterns = {
  // Data formats: 2026/03/07, 2026-03-07, 2026年03月07日
  date: /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})日?/,
  
  // 消費電力量 (Energy Consumption)
  consumption: /□\s*消費電力量\s*[\r\n]+\s*(\d+[.,]?\d*)\s*kWh/i,
  
  // 買電電力量 (Purchased Electricity)
  purchased: /□\s*買電電力量\s*[\r\n]+\s*(\d+[.,]?\d*)\s*kWh/i,
  
  // 売電電力量 (Sold Electricity)
  sold: /□\s*売電電力量\s*[\r\n]+\s*(\d+[.,]?\d*)\s*kWh/i,
  
  // 全体の発電電力量 (Total Power Generation)
  generation: /□\s*全体の発電電力量\s*[\r\n]+\s*(\d+[.,]?\d*)\s*kWh/i,
};

/**
 * Parseia e-mail no formato japonês (kp-net@kp-net.com)
 * 
 * Formato esperado:
 * □ 消費電力量
 * 15.4 kWh
 * 
 * □ 買電電力量
 * 10.5 kWh
 * 
 * □ 売電電力量
 * 14.2 kWh
 * 
 * □ 全体の発電電力量
 * 19.7 kWh
 */
export function parseJapaneseEnergyEmail(body: string): ParsedEmailData {
  const result: ParsedEmailData = {
    date: '',
    consumed: null,      // 消費電力量 (Energy Consumption)
    imported: null,      // 買電電力量 (Purchased Electricity) - bought from grid
    exported: null,      // 売電電力量 (Sold Electricity) - sold to grid
    produced: null,     // 全体の発電電力量 (Total Power Generation)
  };

  // Extract date - handles formats like 2026/03/07, 2026-03-07, 2026年03月07日
  const dateMatch = body.match(japanesePatterns.date);
  if (dateMatch) {
    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const day = parseInt(dateMatch[3]);
    result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Extract 消費電力量 (Energy Consumption)
  const consumptionMatch = body.match(japanesePatterns.consumption);
  if (consumptionMatch) {
    result.consumed = parseFloat(consumptionMatch[1].replace(',', '.'));
  }

  // Extract 買電電力量 (Purchased Electricity)
  const purchasedMatch = body.match(japanesePatterns.purchased);
  if (purchasedMatch) {
    result.imported = parseFloat(purchasedMatch[1].replace(',', '.'));
  }

  // Extract 売電電力量 (Sold Electricity)
  const soldMatch = body.match(japanesePatterns.sold);
  if (soldMatch) {
    result.exported = parseFloat(soldMatch[1].replace(',', '.'));
  }

  // Extract 全体の発電電力量 (Total Power Generation)
  const generationMatch = body.match(japanesePatterns.generation);
  if (generationMatch) {
    result.produced = parseFloat(generationMatch[1].replace(',', '.'));
  }

  return result;
}

/**
 * Parseia o corpo do e-mail e extrai os dados de energia
 */
export function parseEnergyEmail(body: string): ParsedEmailData {
  const result: ParsedEmailData = {
    date: '',
    consumed: null,
    imported: null,
    exported: null,
    produced: null,
  };

  // Extrai a data
  const dateMatch = body.match(patterns.date);
  if (dateMatch) {
    result.date = normalizeDate(dateMatch[0]);
  }

  // Extrai consumo
  const consumedMatch = body.match(patterns.consumed);
  if (consumedMatch) {
    result.consumed = parseFloat(consumedMatch[1].replace(',', '.'));
  }

  // Extrai energia comprada
  const importedMatch = body.match(patterns.imported);
  if (importedMatch) {
    result.imported = parseFloat(importedMatch[1].replace(',', '.'));
  }

  // Extrai energia vendida
  const exportedMatch = body.match(patterns.exported);
  if (exportedMatch) {
    result.exported = parseFloat(exportedMatch[1].replace(',', '.'));
  }

  // Extrai energia produzida
  const producedMatch = body.match(patterns.produced);
  if (producedMatch) {
    result.produced = parseFloat(producedMatch[1].replace(',', '.'));
  }

  return result;
}

/**
 * Normaliza a data para formato YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  // Tenta diferentes formatos
  const parts1 = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (parts1) {
    let day = parseInt(parts1[1]);
    let month = parseInt(parts1[2]);
    let year = parseInt(parts1[3]);
    
    if (year < 100) year += 2000;
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Calcula o consumo próprio (energia consumida diretamente dos painéis)
 */
export function calculateSelfConsumption(data: EnergyData): number {
  // Consumo próprio = produção - exportação
  // Se a exportação for maior que a produção, o consumo próprio é a produção
  // caso contrário, é a produção menos a exportação
  const selfConsumption = data.produced - data.exported;
  return Math.max(0, selfConsumption);
}

/**
 * Calcula a economia baseada na energia exportada e preços
 * Preço médio: 0.15€/kWh para venda, 0.25€/kWh para compra
 */
export function calculateSavings(imported: number, exported: number): number {
  const pricePerKwhImport = 0.25; // Preço de compra
  const pricePerKwhExport = 0.15; // Preço de venda
  
  const importCost = imported * pricePerKwhImport;
  const exportRevenue = exported * pricePerKwhExport;
  
  return exportRevenue - importCost;
}

/**
 * Processa dados brutos e cria dados completos de energia
 */
export function processEnergyData(rawData: ParsedEmailData[]): EnergyData[] {
  const processedData: EnergyData[] = [];
  
  for (const raw of rawData) {
    if (!raw.date) continue;
    
    const produced = raw.produced ?? 0;
    const exported = raw.exported ?? 0;
    const consumed = raw.consumed ?? 0;
    const imported = raw.imported ?? 0;
    
    const selfConsumption = Math.max(0, produced - exported);
    
    processedData.push({
      date: raw.date,
      consumed,
      imported,
      exported,
      produced,
      selfConsumption,
    });
  }
  
  // Ordena por data
  processedData.sort((a, b) => a.date.localeCompare(b.date));
  
  return processedData;
}

/**
 * Cria o resumo diário
 */
export function createDailySummary(data: EnergyData): DailySummary {
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
export function createMonthlySummary(data: EnergyData[]): MonthlySummary[] {
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
 * Cria estatísticas completas para o dashboard
 */
export function createDashboardStats(data: EnergyData[]): DashboardStats {
  if (data.length === 0) {
    return {
      today: null,
      last7Days: [],
      last30Days: [],
      monthlyData: [],
      yearlyData: [],
      totalProduced: 0,
      totalExported: 0,
      totalImported: 0,
      totalSavings: 0,
    };
  }
  
  const today = data[data.length - 1];
  const last7Days = data.slice(-7).map(createDailySummary);
  const last30Days = data.slice(-30).map(createDailySummary);
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
