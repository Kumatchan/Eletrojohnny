'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Gera um ID único para o usuário (simples - em produção usar Auth)
function getUserId(): string {
  let userId = localStorage.getItem('solar_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('solar_user_id', userId);
  }
  return userId;
}

export default function ConfigurarPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [configured, setConfigured] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [imapUser, setImapUser] = useState('');
  const [imapPassword, setImapPassword] = useState('');
  const [energyCompanyEmail, setEnergyCompanyEmail] = useState('');

  useEffect(() => {
    // Verifica se já existe configuração
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(`/api/imap?userId=${userId}`);
      const data = await response.json();
      
      if (data.configured) {
        setConfigured(true);
        setEmail(data.email || '');
        setImapHost(data.imapHost || '');
        setImapPort(data.imapPort?.toString() || '993');
        setImapUser(data.imapUser || '');
        setEnergyCompanyEmail(data.energyCompanyEmail || '');
      }
    } catch (err) {
      console.error('Erro ao verificar configuração:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const userId = getUserId();
      
      const response = await fetch('/api/imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          imapHost,
          imapPort: parseInt(imapPort),
          imapUser,
          imapPassword,
          energyCompanyEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setConfigured(true);
        
        if (data.processed !== undefined && data.processed > 0) {
          setMessage({ 
            type: 'success', 
            text: `${data.message} (${data.processed} registros novos)` 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao conectar. Verifique as credenciais.' });
    } finally {
      setLoading(false);
    }
  };

  // Common IMAP settings for major providers
  const presetProviders = [
    { name: 'Gmail', host: 'imap.gmail.com', port: '993' },
    { name: 'Outlook', host: 'outlook.office365.com', port: '993' },
    { name: 'Yahoo', host: 'imap.mail.yahoo.com', port: '993' },
    { name: 'iCloud', host: 'imap.mail.me.com', port: '993' },
  ];

  const applyPreset = (host: string, port: string) => {
    setImapHost(host);
    setImapPort(port);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </Link>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {configured ? 'Conectar E-mail' : 'Configurar E-mail'}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Introdução */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              📧 Conexão IMAP
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Conecte sua caixa de e-mail para que o sistema possa monitorar e extrair 
              automaticamente os dados de energia dos e-mails da sua compania solar.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Como funciona:</strong> Você fornece as credenciais IMAP da sua caixa de e-mail. 
                O sistema conectará automaticamente, buscará os e-mails da compania de energia 
                e extrairá os dados para o dashboard.
              </p>
            </div>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`rounded-lg p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Formulário de configuração */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {configured ? '✏️ Atualizar Configuração' : '🔗 Credenciais IMAP'}
            </h3>

            {/* Presets de provedores */}
            {!configured && (
              <div className="mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  Selecione seu provedor:
                </p>
                <div className="flex flex-wrap gap-2">
                  {presetProviders.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => applyPreset(provider.host, provider.port)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail principal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Seu E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Host IMAP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Servidor IMAP (Host) *
                </label>
                <input
                  type="text"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  placeholder="imap.gmail.com"
                  required
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Porta IMAP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Porta IMAP *
                </label>
                <input
                  type="number"
                  value={imapPort}
                  onChange={(e) => setImapPort(e.target.value)}
                  placeholder="993"
                  required
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Usuário IMAP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Usuário IMAP *
                </label>
                <input
                  type="text"
                  value={imapUser}
                  onChange={(e) => setImapUser(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Senha IMAP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Senha / App Password *
                </label>
                <input
                  type="password"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!configured}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Para Gmail, use uma &quot;Senha de App&quot;. Configure em Segurança &gt; Verificação em 2 etapas &gt; Senhas de App.
                </p>
              </div>

              {/* E-mail da compania de energia */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail da Compania de Energia
                </label>
                <input
                  type="email"
                  value={energyCompanyEmail}
                  onChange={(e) => setEnergyCompanyEmail(e.target.value)}
                  placeholder="kp-net@kp-net.com (opcional)"
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  E-mail da compania que envia os dados de energia. Se vazio, todos os e-mails serão verificados.
                </p>
              </div>

              {/* Botão de submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Conectando...
                  </>
                ) : configured ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizar e Sincronizar
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Conectar E-mail
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Voltar ao Dashboard */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar ao Dashboard
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
