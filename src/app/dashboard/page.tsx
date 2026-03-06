'use client';

import { useState, useEffect, Suspense, createContext, useContext } from 'react';
import { DashboardStats } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { 
  EnergyAreaChart, 
  EnergyBarChart, 
  DistributionPieChart, 
  MonthlyBarChart,
  SingleAreaChart,
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

// Chart Data Type
type ChartDataType = 'produced' | 'consumed' | 'exported' | 'imported' | 'all';

// Chart View Type
type ChartViewType = 'area' | 'bar';

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [selectedChartType, setSelectedChartType] = useState<ChartDataType>('all');
  const [chartViewType, setChartViewType] = useState<ChartViewType>('area');

  const { theme: currentTheme, toggleTheme } = useContext(ThemeContext) ?? { theme: 'light' as Theme, toggleTheme: () => {} };

  useEffect(() => {
    // Sempre buscar dados de demonstração ao carregar
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async (tokens?: string | null) => {
    try {
      setLoading(true);
      // SEMPRE buscar dados de demonstração por padrão
      // O parâmetro tokens é ignorado para evitar erros de OAuth
      const url = '/api/energy';
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Sempre usar os dados retornados (demo ou real)
      if (data) {
        setStats(data);
      }
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

  // Get data based on time period
  const getTimePeriodData = () => {
    if (!stats) return { daily: [], weekly: [], monthly: [], yearly: [] };
    
    return {
      daily: stats.last30Days,
      weekly: stats.last7Days,
      monthly: stats.monthlyData,
      yearly: stats.yearlyData || stats.monthlyData,
    };
  };

  // Get number of items to show based on period
  const getSliceCount = (period: TimePeriod): number | undefined => {
    switch (period) {
      case 'daily': return 1; // Show only last data point
      case 'weekly': return 7; // Show last 7 days
      case 'monthly': return 30; // Show last 30 days
      case 'yearly': return 12; // Show last 12 months
      default: return undefined;
    }
  };

  const timePeriodData = getTimePeriodData();

  // Get period label
  const getPeriodLabel = (period: TimePeriod) => {
    const labels = {
      daily: 'Diário (último dado)',
      weekly: 'Semanal (7 dias)',
      monthly: 'Mensal (30 dias)',
      yearly: 'Anual (12 meses)',
    };
    return labels[period];
  };

  // Get chart type label
  const getChartTypeLabel = (type: ChartDataType) => {
    const labels = {
      produced: 'Produção',
      consumed: 'Consumo',
      exported: 'Vendido',
      imported: 'Comprado',
      all: 'Todos',
    };
    return labels[type];
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
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timePeriod === period
                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {period === 'daily' ? 'Dia' : period === 'weekly' ? 'Sem' : period === 'monthly' ? 'Mês' : 'Ano'}
                  </button>
                ))}
              </div>

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
                Tipo:
              </span>
              <button
                onClick={() => setChartViewType('area')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartViewType === 'area'
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Área
              </button>
              <button
                onClick={() => setChartViewType('bar')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartViewType === 'bar'
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Barras
              </button>
            </div>
          </div>
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
        {/* Period Label */}
        <div className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <CalendarIcon />
          <span className="font-medium">{getPeriodLabel(timePeriod)}</span>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Produzido Hoje"
            value={stats.today?.produced ?? 0}
            unit="kWh"
            icon={<SunIcon />}
            color="green"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Consumido Hoje"
            value={stats.today?.consumed ?? 0}
            unit="kWh"
            icon={<LightningIcon />}
            color="blue"
          />
          <StatCard
            title="Energia Vendida"
            value={stats.today?.exported ?? 0}
            unit="kWh"
            icon={<ArrowUpIcon />}
            color="yellow"
          />
          <StatCard
            title="Energia Comprada"
            value={stats.today?.imported ?? 0}
            unit="kWh"
            icon={<ArrowDownIcon />}
            color="red"
          />
        </div>

        {/* Gráficos Principais - Based on time period and chart type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolução da Energia */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {timePeriod === 'daily' ? 'Evolução da Energia (último dado)' 
                : timePeriod === 'weekly' ? 'Evolução Semanal (7 dias)'
                : timePeriod === 'monthly' ? 'Evolução Mensal (30 dias)'
                : 'Evolução Anual (12 meses)'}
            </h2>
            
            {chartViewType === 'bar' ? (
              selectedChartType === 'all' ? (
                <EvolutionBarChart data={timePeriodData[timePeriod] as any} sliceCount={getSliceCount(timePeriod)} barSize={timePeriod === 'daily' ? 25 : undefined} />
              ) : (
                <SingleBarChart 
                  data={timePeriodData[timePeriod] as any} 
                  dataKey={selectedChartType}
                  color={selectedChartType === 'produced' ? '#10B981' 
                    : selectedChartType === 'consumed' ? '#3B82F6' 
                    : selectedChartType === 'exported' ? '#F59E0B' 
                    : '#EF4444'}
                  sliceCount={getSliceCount(timePeriod)}
                  barSize={timePeriod === 'daily' ? 40 : undefined}
                />
              )
            ) : (
              selectedChartType === 'all' ? (
                <EnergyAreaChart data={timePeriodData[timePeriod] as any} />
              ) : (
                <SingleAreaChart 
                  data={timePeriodData[timePeriod] as any} 
                  dataKey={selectedChartType}
                  color={selectedChartType === 'produced' ? '#10B981' 
                    : selectedChartType === 'consumed' ? '#3B82F6' 
                    : selectedChartType === 'exported' ? '#F59E0B' 
                    : '#EF4444'}
                />
              )
            )}
          </div>

          {/* Compra e Venda */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {timePeriod === 'daily' ? 'Energia Comprada vs Vendida'
                : timePeriod === 'weekly' ? 'Comparativo Semanal (7 dias)'
                : timePeriod === 'monthly' ? 'Comparativo Mensal (30 dias)'
                : 'Comparativo Anual (12 meses)'}
            </h2>
            
            {selectedChartType === 'all' ? (
              <EnergyBarChart data={timePeriodData[timePeriod] as any} sliceCount={getSliceCount(timePeriod)} barSize={timePeriod === 'daily' ? 40 : undefined} />
            ) : (
              <SingleBarChart 
                data={timePeriodData[timePeriod] as any} 
                dataKey={selectedChartType}
                color={selectedChartType === 'produced' ? '#10B981' 
                  : selectedChartType === 'consumed' ? '#3B82F6' 
                  : selectedChartType === 'exported' ? '#F59E0B' 
                  : '#EF4444'}
                sliceCount={getSliceCount(timePeriod)}
                barSize={timePeriod === 'daily' ? 40 : undefined}
              />
            )}
          </div>
        </div>

        {/* Estatísticas Acumuladas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">Total Produzido</p>
            <p className="text-3xl font-bold">{stats.totalProduced.toFixed(0)}</p>
            <p className="text-green-200 text-sm">kWh histórico</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-yellow-100 text-sm mb-1">Total Vendido</p>
            <p className="text-3xl font-bold">{stats.totalExported.toFixed(0)}</p>
            <p className="text-yellow-200 text-sm">kWh histórico</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-red-100 text-sm mb-1">Total Comprado</p>
            <p className="text-3xl font-bold">{stats.totalImported.toFixed(0)}</p>
            <p className="text-red-200 text-sm">kWh histórico</p>
          </div>
          <div className={`bg-gradient-to-br rounded-2xl p-6 text-white shadow-lg ${
            stats.totalSavings >= 0 
              ? 'from-green-500 to-emerald-600' 
              : 'from-red-500 to-rose-600'
          }`}>
            <p className="text-white/80 text-sm mb-1">Economia Total</p>
            <p className="text-3xl font-bold">
              {stats.totalSavings >= 0 ? '+' : ''}{stats.totalSavings.toFixed(2)}€
            </p>
            <p className="text-white/80 text-sm">
              {stats.totalSavings >= 0 ? 'lucro' : 'gasto'}
            </p>
          </div>
        </div>

        {/* Análise Mensal / Período */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Análise por Período
            </h2>
            {timePeriod === 'yearly' ? (
              <MonthlyBarChart data={timePeriodData.yearly as any} />
            ) : timePeriod === 'monthly' ? (
              <MonthlyBarChart data={timePeriodData.monthly as any} />
            ) : (
              <MonthlyBarChart data={timePeriodData.daily as any} />
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Distribuição ({stats.monthlyData[stats.monthlyData.length - 1]?.month || 'Mês'})
            </h2>
            {stats.monthlyData.length > 0 && (
              <DistributionPieChart data={stats.monthlyData[stats.monthlyData.length - 1]} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        <p>Dados atualizados automaticamente • Made with ☀️</p>
      </footer>
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
