'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DailySummary, MonthlySummary } from '@/lib/types';

// Cores para os gráficos
const COLORS = {
  produced: '#10B981',    // verde - produção
  consumed: '#3B82F6',    // azul - consumo
  imported: '#EF4444',    // vermelho - comprado
  exported: '#F59E0B',    // amarelo - vendido
  selfConsumption: '#8B5CF6', // roxo - consumo próprio
};

const COLORS_ARRAY = [COLORS.produced, COLORS.consumed, COLORS.imported, COLORS.exported];

/**
 * Gráfico de área para energia dos últimos 30 dias
 */
export function EnergyAreaChart({ data }: { data: DailySummary[] }) {
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.produced} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.produced} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.consumed} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.consumed} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${value} kWh`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} kWh`]}
          />
          <Area
            type="monotone"
            dataKey="produced"
            stroke={COLORS.produced}
            fillOpacity={1}
            fill="url(#colorProduced)"
            name="Produzida"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="consumed"
            stroke={COLORS.consumed}
            fillOpacity={1}
            fill="url(#colorConsumed)"
            name="Consumida"
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de barras para comparação diária
 */
export function EnergyBarChart({ data }: { data: DailySummary[] }) {
  const chartData = data.slice(-7).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${value} kWh`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} kWh`]}
          />
          <Bar dataKey="imported" name="Comprada" fill={COLORS.imported} radius={[4, 4, 0, 0]} />
          <Bar dataKey="exported" name="Vendida" fill={COLORS.exported} radius={[4, 4, 0, 0]} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de pizza para distribuição mensal
 */
export function DistributionPieChart({ data }: { data: MonthlySummary }) {
  const chartData = [
    { name: 'Consumo Próprio', value: data.totalProduced - data.totalExported },
    { name: 'Vendida', value: data.totalExported },
    { name: 'Comprada', value: data.totalImported },
  ].filter(d => d.value > 0);

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_ARRAY[index % COLORS_ARRAY.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} kWh`]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de barras mensal
 */
export function MonthlyBarChart({ data }: { data: MonthlySummary[] }) {
  const chartData = data.map(d => ({
    ...d,
    month: new Date(d.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis 
            dataKey="month"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${value} kWh`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} kWh`]}
          />
          <Bar dataKey="totalProduced" name="Produzida" fill={COLORS.produced} radius={[4, 4, 0, 0]} />
          <Bar dataKey="totalConsumed" name="Consumida" fill={COLORS.consumed} radius={[4, 4, 0, 0]} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
