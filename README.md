# Garmin Hub — Webapp

Dashboard de saúde e performance com análises de IA, conectado à Garmin Health API.

**Stack:** Next.js 14 · TypeScript · Tailwind · Recharts · Anthropic Claude  
**Hospedagem:** Netlify (via `@netlify/plugin-nextjs`)

---

## Pré-requisitos

- Node.js 18+
- Conta no [Garmin Developer Portal](https://developer.garmin.com/gc-developer-program/)
- Chave da API Anthropic (para análises IA)

---

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Rodar em desenvolvimento
npm run dev
# → http://localhost:3000
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `GARMIN_CONSUMER_KEY` | Consumer Key do Garmin Developer Portal |
| `GARMIN_CONSUMER_SECRET` | Consumer Secret |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic para análises IA |
| `NEXTAUTH_SECRET` | String aleatória para assinar sessões (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base do app (`https://seu-app.netlify.app` em produção) |

---

## Fluxo de autenticação

O app usa **OAuth 1.0a** (padrão da Garmin):

```
Usuário clica "Conectar com Garmin"
  → GET /api/auth/login
    → Obtém Request Token na API Garmin
    → Redireciona para connect.garmin.com/oauthConfirm
      → Usuário autoriza
        → Garmin redireciona para /api/auth/callback?oauth_token=...&oauth_verifier=...
          → Troca pelo Access Token permanente
            → Salva em cookie HTTP-only
              → Redireciona para /dashboard
```

---

## Deploy no Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar
netlify init

# 4. Configurar variáveis no Netlify Dashboard:
#    Site settings → Environment variables
#    Adicione todas as variáveis do .env.example

# 5. Deploy
netlify deploy --prod
```

Ou conecte o repositório GitHub no Netlify Dashboard para deploy automático.

---

## Estrutura do projeto

```
garmin-hub/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Inicia OAuth
│   │   │   ├── callback/route.ts    # Troca verifier → access token
│   │   │   └── logout/route.ts
│   │   ├── garmin/
│   │   │   └── [endpoint]/route.ts  # Proxy para Health API
│   │   └── ai/
│   │       └── analyze/route.ts     # Análise com Claude
│   ├── dashboard/                   # Métricas diárias + gráficos
│   ├── activities/                  # Feed de atividades
│   ├── sleep/                       # Sono & HRV
│   └── ai/                          # Chat com IA
├── lib/
│   ├── garmin-oauth.ts              # Cliente OAuth 1.0a
│   └── session.ts                   # Tokens em cookies HTTP-only
└── components/
    └── layout/AppShell.tsx          # Sidebar + navegação
```

---

## Endpoints suportados

| Endpoint | Dados |
|---|---|
| `/api/garmin/dailies` | Passos, calorias, FC diária, stress, Body Battery |
| `/api/garmin/activities` | Corridas, ciclismo, natação, etc. |
| `/api/garmin/sleeps` | Sono, SpO₂, respiração, score |
| `/api/garmin/hrv` | HRV noturno, média semanal |
| `/api/garmin/epochs` | Dados granulares por período |
| `/api/garmin/bodyComps` | Peso, IMC, gordura corporal |
| `/api/garmin/userMetrics` | VO₂ máx, fitness age |

Parâmetros: `?start=<unix>&end=<unix>` (padrão: últimos 7 dias)
