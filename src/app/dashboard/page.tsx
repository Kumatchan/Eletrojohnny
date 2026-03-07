'use client';

import { useState, useEffect, Suspense, createContext, useContext } from 'react';
import { DashboardStats, DailySummary, MonthlySummary } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { 
  EnergyBarChart, 
  DistributionPieChart, 
  MonthlyBarChart,
  SingleBarChart,
  EvolutionBarChart
} from '@/components/charts/EnergyCharts';

// Theme Context
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

// Ícones SVG
const SunIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Theme Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Time Period Types
type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Selection Types for each period
type DaySelection = { date: string; };
type WeekSelection = { startDate: string; };
type MonthSelection = { month: string; }; // YYYY-MM
type YearSelection = { year: number; };

// Combined selection type
type PeriodSelection = DaySelection | WeekSelection | MonthSelection | YearSelection;

// Chart Data Type
type ChartDataType = 'produced' | 'consumed' | 'exported' | 'imported' | 'all';

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [selectedChartType, setSelectedChartType] = useState<ChartDataType>('all');
  
  // Selection states for each period
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { theme: currentTheme, toggleTheme } = useContext(ThemeContext) ?? { theme: 'light' as Theme, toggleTheme: () => {} };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokens = params.get('tokens');
    
    fetchEnergyData(tokens);
  }, []);

  const fetchEnergyData = async (tokens?: string | null) => {
    try {
      setLoading(true);
      const url = tokens 
        ? `/api/energy?tokens=${encodeURIComponent(tokens)}`
        : '/api/energy';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.needsAuth) {
        setNeedsAuth(true);
        return;
      }
      
      setStats(data);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    window.location.href = '/api/auth?redirect=/dashboard';
  };

  // Get data based on time period and selected date/month/year
  const getTimePeriodData = () => {
    if (!stats) return { daily: [], weekly: [], monthly: [], yearly: [] };
    
    // Daily: filter by selected date
    const dailyData = stats.last30Days.filter(d => d.date === selectedDate);
    
    // Weekly: get 7 days starting from selected date
    const weekStart = new Date(selectedDate);
    const weeklyData: DailySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() - i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = stats.last30Days.find(d => d.date === dateStr);
      if (dayData) weeklyData.push(dayData);
    }
    
    // Monthly: filter by selected month (YYYY-MM)
    const monthlyData = stats.monthlyData.filter(m => m.month === selectedMonth);
    
    // Yearly: filter by selected year
    const yearlyData = stats.yearlyData.filter(m => m.month.startsWith(`${selectedYear}-`));
    
    // Ensure we have 12 months for yearly view (pad with empty data if needed)
    const paddedYearlyData: MonthlySummary[] = [];
    for (let i = 1; i <= 12; i++) {
      const monthStr = `${selectedYear}-${i.toString().padStart(2, '0')}`;
      const existing = yearlyData.find(m => m.month === monthStr);
      if (existing) {
        paddedYearlyData.push(existing);
      } else {
        paddedYearlyData.push({
          month: monthStr,
          totalConsumed: 0,
          totalImported: 0,
          totalExported: 0,
          totalProduced: 0,
          totalSavings: 0,
          days: 0
        });
      }
    }
    
    return {
      daily: dailyData.length > 0 ? [dailyData[0]] : [],
      weekly: weeklyData,
      monthly: monthlyData.length > 0 ? [monthlyData[0]] : [],
      yearly: paddedYearlyData,
    };
  };

  // Get number of items to show based on period
  const getSliceCount = (period: TimePeriod): number | undefined => {
    switch (period) {
      case 'daily': return 1; // Show only selected day
      case 'weekly': return 7; // Show 7 days from selected date
      case 'monthly': return 1; // Show selected month
      case 'yearly': return 12; // Show all 12 months
      default: return undefined;
    }
  };

  const timePeriodData = getTimePeriodData();

  // Get period label
  const getPeriodLabel = (period: TimePeriod) => {
    const dateLabel = new Date(selectedDate).toLocaleDateString('pt-BR');
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'long' });
    
    const labels = {
      daily: `Diário (${dateLabel})`,
      weekly: `Semanal (7 dias a partir de ${dateLabel})`,
      monthly: `Mensal (${monthName} de ${year})`,
      yearly: `Anual (${selectedYear})`,
    };
    return labels[period];
  };

  // Get chart type label
  const getChartTypeLabel = (type: ChartDataType) => {
    const labels = {
      produced: 'Produzido',
      consumed: 'Consumido',
      exported: 'Vendido',
      imported: 'Comprado',
      all: 'Todos',
    };
    return labels[type];
  };

  // Get "último dado" (last data) from the selected period
  const getLastData = () => {
    const data = timePeriodData[timePeriod];
    if (!data || data.length === 0) return null;
    return data[0]; // Most recent data (data is sorted descending)
  };

  const lastData = getLastData();

  // Calculate yesterday's data for comparison
  const getYesterdayData = () => {
    if (!stats) return null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return stats.last30Days.find(d => d.date === yesterdayStr) || null;
  };

  const yesterdayData = getYesterdayData();

  // Calculate trend comparing today vs yesterday
  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: today > 0 ? 100 : 0, isPositive: today > 0 };
    const change = ((today - yesterday) / yesterday) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  // Get today's values
  const todayProduced = stats?.today?.produced ?? 0;
  const todayConsumed = stats?.today?.consumed ?? 0;
  const todayExported = stats?.today?.exported ?? 0;
  const todayImported = stats?.today?.imported ?? 0;

  // Get yesterday's values
  const yesterdayProduced = yesterdayData?.produced ?? 0;
  const yesterdayConsumed = yesterdayData?.consumed ?? 0;
  const yesterdayExported = yesterdayData?.exported ?? 0;
  const yesterdayImported = yesterdayData?.imported ?? 0;

  // Calculate trends
  const producedTrend = calculateTrend(todayProduced, yesterdayProduced);
  const consumedTrend = calculateTrend(todayConsumed, yesterdayConsumed);
  const exportedTrend = calculateTrend(todayExported, yesterdayExported);
  const importedTrend = calculateTrend(todayImported, yesterdayImported);
  
  // Get the label for last data based on period type
  const getLastDataLabel = () => {
    if (!lastData) return '';
    if (timePeriod === 'yearly' || timePeriod === 'monthly') {
      return (lastData as any).month || selectedYear.toString();
    }
    return (lastData as any).date || selectedDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Erro ao carregar dados'}</p>
          <button
            onClick={() => fetchEnergyData()}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <SunIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                  Painel Solar
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitoramento de Energia
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Time Period Selector */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-0 cursor-pointer focus:ring-2 focus:ring-yellow-400"
              >
                <option value="daily">Dia</option>
                <option value="weekly">Semana</option>
                <option value="monthly">Mês</option>
                <option value="yearly">Ano</option>
              </select>

              {/* Date/Month/Year Selector based on period */}
              {timePeriod === 'daily' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-0 cursor-pointer focus:ring-2 focus:ring-yellow-400"
                />
              )}
              {timePeriod === 'weekly' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-0 cursor-pointer focus:ring-2 focus:ring-yellow-400"
                />
              )}
              {timePeriod === 'monthly' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-0 cursor-pointer focus:ring-2 focus:ring-yellow-400"
                />
              )}
              {timePeriod === 'yearly' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-0 cursor-pointer focus:ring-2 focus:ring-yellow-400"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Alternar tema"
              >
                {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>

              {/* Gmail Login Button */}
              <button
                onClick={handleAuth}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login Gmail
              </button>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ChartIcon />
                Visualizar:
              </span>
              {(['all', 'produced', 'consumed', 'exported', 'imported'] as ChartDataType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedChartType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedChartType === type
                      ? type === 'all' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                      : type === 'produced' ? 'bg-green-600 text-white'
                      : type === 'consumed' ? 'bg-blue-600 text-white'
                      : type === 'exported' ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {getChartTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Último Dado - shows just the label above charts */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Último Dado ({getLastDataLabel()})
          </h3>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Produzido Hoje"
            value={todayProduced}
            unit="kWh"
            icon={<SunIcon />}
            color="green"
            trend={producedTrend}
            previousValue={yesterdayProduced}
          />
          <StatCard
            title="Consumido Hoje"
            value={todayConsumed}
            unit="kWh"
            icon={<LightningIcon />}
            color="blue"
            trend={consumedTrend}
            previousValue={yesterdayConsumed}
          />
          <StatCard
            title="Energia Vendida"
            value={todayExported}
            unit="kWh"
            icon={<ArrowUpIcon />}
            color="yellow"
            trend={exportedTrend}
            previousValue={yesterdayExported}
          />
          <StatCard
            title="Energia Comprada"
            value={todayImported}
            unit="kWh"
            icon={<ArrowDownIcon />}
            color="red"
            trend={importedTrend}
            previousValue={yesterdayImported}
          />
        </div>

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ThemeProvider>
  );
}
