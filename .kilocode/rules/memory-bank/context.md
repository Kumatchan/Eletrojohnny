# Active Context: Solar Energy Dashboard

## Current State

**Project Status**: ✅ Solar Energy Dashboard completo com encaminhamento de e-mail

O aplicativo usa dados de demonstração por padrão. Para receber dados automaticamente, configure o encaminhamento de e-mail da sua compania de energia.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Solar Energy Dashboard implementation
- [x] Gmail API integration (OAuth2) - removed
- [x] Energy data parser for email extraction
- [x] Dashboard with charts (Recharts)
- [x] Demo data when OAuth not configured
- [x] Dark/Light mode toggle
- [x] Chart type selector (produced, consumed, exported, imported, all)
- [x] Time period selector (daily, weekly, monthly, yearly)
- [x] Dashboard accessible without login (demo data by default)
- [x] Japanese email parser for kp-net@kp-net.com emails
- [x] Email forwarding configuration page
- [x] Removed manual email parser component
- [x] Removed Gmail login button
- [x] IMAP connection - removed (doesn't work in Vercel serverless)
- [x] Removed SQLite database (doesn't work in Vercel serverless)
- [x] Simplified to email forwarding only

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/dashboard/page.tsx` | Main dashboard page | ✅ Ready |
| `src/app/configurar/page.tsx` | Email forwarding configuration | ✅ Ready |
| `src/app/api/energy/route.ts` | Energy data API | ✅ Ready |
| `src/app/api/energy/parse/route.ts` | Email parsing API | ✅ Ready |
| `src/app/api/email-forward/route.ts` | Email forwarding API | ✅ Ready |
| `src/lib/energy-parser.ts` | Email data parser | ✅ Ready |
| `src/components/ui/StatCard.tsx` | Statistics cards | ✅ Ready |
| `src/components/charts/EnergyCharts.tsx` | Chart components | ✅ Ready |
| `.env.example` | Environment variables template | ✅ Ready |

## Current Focus

Nova abordagem: Encaminhamento de E-mail (gratuito, qualquer provedor)

1. ✅ Dashboard com dados de demonstração
2. ✅ Página de configuração de encaminhamento de e-mail (/configurar)
3. ✅ Botão de configurações no header
4. ✅ API endpoint para receber e-mails encaminhados

## Como Usar

### 1. Acesse a página de configuração:

Abra http://localhost:3000/configurar

### 2. Configure o encaminhamento:

Siga as instruções para seu provedor de e-mail:
- **Gmail**: Configurações > Encaminhamento e POP/IMAP
- **Outlook**: Configurações > Email > Regras
- **Yahoo**: Configurações > Filters
- **iCloud**: icloud.com/settings > Regras

### 3. Copie o endpoint:

```
https://seu-dominio.com/api/email-forward
```

### 4. Execute o app:

```bash
bun dev
```

### 5. Acesse o dashboard:

Abra http://localhost:3000/dashboard

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-06 | Solar Energy Dashboard implementation |
| 2026-03-06 | Added dark/light mode, chart type selector, time period selector |
| 2026-03-06 | Dashboard accessible without login, added optional Gmail login button |
| 2026-03-06 | Japanese email parser for kp-net@kp-net.com |
| 2026-03-07 | User email display and logout functionality |
| 2026-03-07 | Token expiration detection and improved error handling |
| 2026-03-07 | Email forwarding API endpoint (any email provider) |
| 2026-03-07 | Replaced OAuth login with email forwarding configuration |
| 2026-03-07 | Removed IMAP + SQLite (not compatible with Vercel serverless) |

## Dependencies Added

- recharts (v2.15.4) - Gráficos
- date-fns (v4.1.0) - Manipulação de datas
