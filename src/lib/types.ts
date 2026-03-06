// Tipos para dados de energia solar

export interface EnergyData {
  date: string; // formato YYYY-MM-DD
  consumed: number; // energia consumida (kWh)
  imported: number; // energia comprada da rede (kWh)
  exported: number; // energia vendida para a rede (kWh)
  produced: number; // energia produzida pelos painéis (kWh)
  selfConsumption: number; // consumo próprio (kWh)
}

export interface DailySummary {
  date: string;
  consumed: number;
  imported: number;
  exported: number;
  produced: number;
  savings: number; // economia em euros
}

export interface MonthlySummary {
  month: string; // formato YYYY-MM
  totalConsumed: number;
  totalImported: number;
  totalExported: number;
  totalProduced: number;
  totalSavings: number;
  days: number;
}

export interface DashboardStats {
  today: EnergyData | null;
  last7Days: DailySummary[];
  last30Days: DailySummary[];
  monthlyData: MonthlySummary[];
  yearlyData: MonthlySummary[];
  totalProduced: number;
  totalExported: number;
  totalImported: number;
  totalSavings: number;
}

// Configuração do Gmail
export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}
