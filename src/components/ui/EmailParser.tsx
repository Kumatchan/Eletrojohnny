"use client";

import { useState } from 'react';
import { EnergyData } from '@/lib/types';

interface EmailParserProps {
  onDataExtracted: (data: EnergyData) => void;
  existingData?: EnergyData | null;
}

export function EmailParser({ onDataExtracted, existingData }: EmailParserProps) {
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnergyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseEmail = async () => {
    if (!emailContent.trim()) {
      setError('Por favor, cole o conteúdo do e-mail de energia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/energy/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: emailContent }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        onDataExtracted(data.data);
        
        // Save to localStorage
        const savedData = JSON.parse(localStorage.getItem('energyData') || '[]');
        savedData.push(data.data);
        localStorage.setItem('energyData', JSON.stringify(savedData));
      } else {
        setError(data.error || 'Não foi possível extrair dados do e-mail');
      }
    } catch (err) {
      setError('Erro ao processar e-mail');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setEmailContent('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        📧 Extrair Dados do E-mail
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Cole o conteúdo do e-mail da sua compania de energia (como o e-mail mensal da KPIC ouOutra) para extrairautomaticamente os dados de consumo.
      </p>

      <textarea
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        placeholder={`Exemplo de conteúdo:\n\n消費電力量: 350kWh\n買電電力量: 200kWh\n売電電力量: 150kWh\n全体の発電電力量: 280kWh\n\nData: 2024年1月分`}
        className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
      />

      {error && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
          ✅ Dados extraídos com sucesso!
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={parseEmail}
          disabled={loading || !emailContent.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Processando...' : 'Extrair Dados'}
        </button>
        
        {result && (
          <button
            onClick={clearData}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Dados Extraídos:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">Consumo:</div>
            <div className="font-medium text-gray-800 dark:text-white">{result.consumed} kWh</div>
            <div className="text-gray-600 dark:text-gray-400">Comprado:</div>
            <div className="font-medium text-gray-800 dark:text-white">{result.imported} kWh</div>
            <div className="text-gray-600 dark:text-gray-400">Vendido:</div>
            <div className="font-medium text-gray-800 dark:text-white">{result.exported} kWh</div>
            <div className="text-gray-600 dark:text-gray-400">Gerado:</div>
            <div className="font-medium text-gray-800 dark:text-white">{result.produced} kWh</div>
            <div className="text-gray-600 dark:text-gray-400">Data:</div>
            <div className="font-medium text-gray-800 dark:text-white">{result.date}</div>
          </div>
        </div>
      )}
    </div>
  );
}
