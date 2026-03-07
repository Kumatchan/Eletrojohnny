'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConfigurarPage() {
  const [emailForwardCopied, setEmailForwardCopied] = useState(false);
  
  // Get the base URL for the forward endpoint
  const forwardUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/email-forward`
    : '/api/email-forward';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setEmailForwardCopied(true);
    setTimeout(() => setEmailForwardCopied(false), 2000);
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
          
          {/* Email Forwarding Setup */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              📧 Encaminhamento de E-mail
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Configure o encaminhamento dos e-mails da sua compania de energia solar 
              para que o sistema possa extrair automaticamente os dados.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Como funciona:</strong> Você configura o encaminhamento automático 
                no seu provedor de e-mail. Os e-mails da compania de energia serão 
                encaminhados para nosso sistema que extrairá os dados automaticamente.
              </p>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              🔗 Endpoint para Encaminhamento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Copie este endereço e configure o encaminhamento no seu provedor:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-lg text-sm font-mono overflow-x-auto">
                {forwardUrl}
              </code>
              <button
                onClick={() => copyToClipboard(forwardUrl)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {emailForwardCopied ? (
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

          {/* Provider Instructions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              📱 Instruções por Provedor
            </h3>
            
            <div className="space-y-4">
              {/* Gmail */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Gmail</h4>
                <ol className="text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside space-y-1">
                  <li>Acesse <strong>Configurações</strong> (ícone de engrenagem)</li>
                  <li>Clique em <strong>Ver todas as configurações</strong></li>
                  <li>Na aba <strong>Encaminhamento e POP/IMAP</strong>, clique em <strong>Adicionar um endereço de encaminhamento</strong></li>
                  <li>Digite o endpoint acima e clique em <strong>Próxima</strong></li>
                  <li>Confirme e pronto!</li>
                </ol>
              </div>

              {/* Outlook */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Outlook</h4>
                <ol className="text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside space-y-1">
                  <li>Acesse <strong>Configurações</strong> (ícone de engrenagem)</li>
                  <li>Clique em <strong>Mail</strong> &gt; <strong>Rules</strong></li>
                  <li>Crie uma <strong>nova regra</strong> com:</li>
                  <li>Configure: &quot;Quando a mensagem chegar&quot; → &quot;Do&quot; (e-mail da compania)</li>
                  <li>Ação: &quot;Encaminhar para&quot; → endpoint acima</li>
                </ol>
              </div>

              {/* Yahoo */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Yahoo</h4>
                <ol className="text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside space-y-1">
                  <li>Acesse <strong>Configurações</strong> (ícone ⚙️)</li>
                  <li>Clique em <strong>Mais configurações</strong></li>
                  <li>Selecione <strong>Filtros</strong></li>
                  rie um novo filtro<li>C</li>
                  <li>Defina: &quot;De&quot; (e-mail da compania) → &quot;Encaminhar para&quot; (endpoint acima)</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>💡 Dica:</strong> O dashboard já funciona com dados de demonstração! 
              Você pode explorar todos os recursos sem configurar o encaminhamento de e-mail.
            </p>
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
