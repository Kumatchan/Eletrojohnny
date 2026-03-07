'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConfigurarPage() {
  const [copied, setCopied] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const apiUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/email-forward`
    : '/api/email-forward';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveForwardingEmail = () => {
    if (forwardingEmail) {
      localStorage.setItem('forwardingEmail', forwardingEmail);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
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
              Configurar E-mail
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
              📧 Encaminhamento de E-mail
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Configure o encaminhamento automático dos e-mails da sua compania de energia solar 
              para receber os dados automaticamente no dashboard.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Como funciona:</strong> Você configura seu provedor de e-mail para encaminhar 
                automaticamente os e-mails da compania de energia para nosso sistema, que extrairá 
                os dados automaticamente.
              </p>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              🔗 Endereço do Webhook
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Use este endereço para configurar o encaminhamento:
            </p>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-mono text-sm border-0"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instruções por provedor */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              📝 Instruções por Provedor
            </h3>

            <div className="space-y-6">
              {/* Gmail */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Gmail / Google Workspace
                </h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-2">
                  <li>Acesse <strong>Configurações</strong> (ícone de engrenagem)</li>
                  <li>Va para <strong>Ver todas as configurações</strong></li>
                  <li>Role até <strong>Encaminhamento e POP/IMAP</strong></li>
                  <li>Clique em <strong>Adicionar um endereço de encaminhamento</strong></li>
                  <li>Digite o endereço: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{apiUrl}</code></li>
                  <li>Clique em <strong>Próxima</strong>, <strong>Continuar</strong> e <strong>Enviar</strong></li>
                  <li>Copie o código de verificação enviado para seu e-mail e insira</li>
                </ol>
              </div>

              {/* Outlook */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.577l-7.143 6.89c-.152.146-.337.22-.553.22-.23 0-.424-.087-.578-.26l-2.853-2.86-4.4 4.4v-1.516l6.238-6.238c.087-.087.152-.184.195-.293.044-.11.066-.223.066-.34V7.387c0-.23-.088-.424-.264-.577L9.193 1.04c-.16-.145-.345-.217-.554-.217-.23 0-.424.087-.578.26L.856 8.29C.71 8.436.624 8.624.624 8.847v10.66c0 .368.13.68.39.94l7.357 7.357c.26.26.573.39.94.39h.39l7.357-7.357c.26-.26.39-.572.39-.94V8.847c0-.152-.044-.293-.13-.424l-6.193-6.193"/>
                  </svg>
                  Outlook / Office 365
                </h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-2">
                  <li>Acesse <strong>Configurações</strong> {'>'} <strong>Email</strong> {'>'} <strong>Regras</strong></li>
                </ol>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 ml-2">
                  No Outlook, use <strong>Regras de Mensagem</strong> para automaticamente 
                  reencaminhar e-mails da compania de energia para o endereço acima.
                </p>
              </div>

              {/* Yahoo */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#410093" d="M23.9 7.2c-.2-1.4-.9-2.7-2-3.6-.6-.5-1.4-.8-2.3-.9V1.4l-2.4 1.5c-.2-.1-.5-.2-.8-.2-1 0-1.9.5-2.4 1.3l-3.4-2.1-.5.9c-.6 1.1-.5 2.5.3 3.5.7.9 1.8 1.4 3 1.4.4 0 .8-.1 1.2-.2l.4 2.4c-.7.3-1.4.4-2.2.4-2.4 0-4.4-1.7-4.8-4l-2.7 1.6c.5 2.6 2.7 4.6 5.3 5 .7.1 1.4.1 2.1 0l.5 2.9c-.7.2-1.4.3-2.1.3-3.3 0-6-2.4-6.5-5.6l-2.6 1.6C.2 16.1 1 20 4.4 22.3l23.4-14.4c-.5-.7-.8-1.5-.9-2.4v-.3z"/>
                  </svg>
                  Yahoo Mail
                </h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-2">
                  <li>Acesse <strong>Configurações</strong> (ícone ⚙️)</li>
                  <li>Va para <strong>Filters</strong> (Filtros)</li>
                </ol>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 ml-2">
                  Crie um filtro que envie automaticamente e-mails da compania de energia 
                  para o endereço de encaminhamento.
                </p>
              </div>

              {/* iCloud */}
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#3693F3" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path fill="#3693F3" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                  </svg>
                  iCloud Mail
                </h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-2">
                  <li>Acesse <strong>icloud.com/settings</strong></li>
                  <li>Va para <strong>Regras</strong></li>
                </ol>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 ml-2">
                  Crie uma regra para automaticamente reencaminhar e-mails da compania de energia.
                </p>
              </div>
            </div>
          </div>

          {/* Salvar e-mail para filtro */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              💾 Salvar E-mail da Compania
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Informe o e-mail da compania de energia para facilitar a configuração dos filtros:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={forwardingEmail}
                onChange={(e) => setForwardingEmail(e.target.value)}
                placeholder="exemplo: kp-net@kp-net.com"
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveForwardingEmail}
                disabled={!forwardingEmail}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo!
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>

          {/* Voltar ao Dashboard */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
