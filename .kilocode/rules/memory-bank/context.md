# Active Context: Solar Energy Dashboard

## Current State

**Project Status**: ✅ Solar Energy Dashboard completo com parser de e-mail japonês

O aplicativo está pronto para uso com dados de demonstração. Para conectar ao Gmail real, é necessário configurar as variáveis de ambiente OAuth2.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Solar Energy Dashboard implementation
- [x] Gmail API integration (OAuth2)
- [x] Energy data parser for email extraction
- [x] Dashboard with charts (Recharts)
- [x] Demo data when OAuth not configured
- [x] Dark/Light mode toggle
- [x] Chart type selector (produced, consumed, exported, imported, all)
- [x] Time period selector (daily, weekly, monthly, yearly)
- [x] Dashboard accessible without login (demo data by default)
- [x] Optional Gmail login button in header
- [x] Japanese email parser for kp-net@kp-net.com emails
- [x] User email display when logged in
- [x] Logout functionality
- [x] Improved error handling for user info API
- [x] Token expiration detection and handling
- [x] Email parser component for manual data extraction
- [x] API endpoint for email forwarding (any email provider)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/dashboard/page.tsx` | Main dashboard page | ✅ Ready |
| `src/app/api/energy/route.ts` | Energy data API | ✅ Ready |
| `src/app/api/auth/route.ts` | OAuth authentication | ✅ Ready |
| `src/app/api/user/route.ts` | User info API | ✅ Ready |
| `src/app/api/energy/parse/route.ts` | Email parsing API | ✅ Ready |
| `src/app/api/email-forward/route.ts` | Email forwarding API | ✅ Ready |
| `src/lib/energy-parser.ts` | Email data parser | ✅ Ready |
| `src/lib/google-auth.ts` | Gmail API utilities | ✅ Ready |
| `src/components/ui/StatCard.tsx` | Statistics cards | ✅ Ready |
| `src/components/ui/EmailParser.tsx` | Email parser component | ✅ Ready |
| `src/components/charts/EnergyCharts.tsx` | Chart components | ✅ Ready |
| `.env.example` | Environment variables template | ✅ Ready |

## Current Focus

Corrigindo problemas de login:

1. ✅ Dashboard acessível sem necessidade de login (dados de demonstração)
2. ✅ Botão "Login Gmail" no canto superior direito
3. ✅ Dados de demonstração carregados automaticamente
4. ✅ Exibição do e-mail do usuário quando logado
5. ✅ Botão de logout
6. ✅ Tratamento de token expirado (limpa localStorage automaticamente)

Nota: Tokens do Google OAuth2 expiram após 1 hora. Quando expirar, faça login novamente.

## Como Usar

### 1. Configurar OAuth2 do Google:

1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto
3. Vá em "APIs e Serviços" > "Biblioteca"
4. Procure e habilite "Gmail API"
5. Vá em "Tela de consentimento OAuth"
6. Configure como "Externo"
7. Adicione escopos: `.../auth/gmail.readonly`, `.../auth/gmail.modify`
8. Crie credenciais OAuth2 (Client ID e Client Secret)
9. Copie `.env.example` para `.env.local` e preencha os dados

### 2. Executar o app:

```bash
bun dev
```

### 3. Acessar o dashboard:

Abra http://localhost:3000 e clique em "Conectar com Google"

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-06 | Solar Energy Dashboard implementation |
| 2026-03-06 | Added dark/light mode, chart type selector, time period selector |
| 2026-03-06 | Dashboard accessible without login, added optional Gmail login button |
| 2026-03-06 | Japanese email parser for kp-net@kp-net.com (消費電力量, 買電電力量, 売電電力量, 全体の発電電力量) |
| 2026-03-07 | User email display and logout functionality |
| 2026-03-07 | Token expiration detection and improved error handling |
| 2026-03-07 | Email parser component for manual data extraction |
| 2026-03-07 | Email forwarding API endpoint (any email provider) |

## Dependencies Added

- googleapis (v144.0.0) - Gmail API
- recharts (v2.15.4) - Gráficos
- date-fns (v4.1.0) - Manipulação de datas
