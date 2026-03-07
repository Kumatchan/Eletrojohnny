'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  previousValue?: number; // kWh from previous day
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
};

export function StatCard({ title, value, unit, icon, trend, previousValue, color = 'blue' }: StatCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={`p-6 rounded-2xl border ${colors.border} ${colors.bg} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${colors.text}`}>
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-500">
                {unit}
              </span>
            )}
          </div>
          {trend && (
            <div className="mt-2">
              <div className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(2)}%
              </div>
              {previousValue !== undefined && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ontem: {previousValue.toFixed(2)} kWh
                </div>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
