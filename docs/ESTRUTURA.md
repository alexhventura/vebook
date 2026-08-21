# Estrutura do VEBOOK

```
.
├── .cursor/                 # Ambiente e regras do Cursor Cloud
│   ├── environment.json
│   └── rules/vebook.mdc
├── .github/workflows/ci.yml
├── docs/                    # Documentação de produto/código
├── public/                  # Favicon e estáticos
├── src/
│   ├── App.tsx              # Shell: header, view ativa, footer, modais
│   ├── main.tsx
│   ├── index.css            # Tailwind
│   ├── types.ts             # Domínio + AppView
│   ├── components/
│   │   ├── layout/          # Header, Footer, Logo
│   │   ├── views/           # Telas públicas
│   │   ├── workshop/        # Mini-site da oficina
│   │   ├── modals/          # Credenciamento e legais
│   │   ├── cookies/
│   │   ├── privacy/
│   │   ├── contestation/
│   │   └── onboarding/      # Rascunhos Etapa* (não ligados ao App)
│   ├── data/                # Mocks
│   ├── hooks/               # useConsulta (placa)
│   └── lib/                 # formatPlate, validação
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json
```

## Mapa das telas (`AppView`)

| View | Arquivo | Função |
| --- | --- | --- |
| `home` | `views/HomeView.tsx` | Landing e consulta de placa |
| `diario` | `views/DiarioVeicularView.tsx` | Histórico do veículo |
| `como-funciona` | `views/ComoFuncionaView.tsx` | Explicação do fluxo |
| `certidao` | `views/CertidaoView.tsx` | Emissão / prévia da certidão |
| `oficinas` | `views/ParaOficinasView.tsx` | Aquisição de oficinas |
| `site-oficina` | `workshop/WorkshopSiteView.tsx` | Vitrine da oficina credenciada |
| `validacao` | `views/ValidacaoSimuladorView.tsx` | Simulador de validação pelo cliente |
| `transparencia` | `views/TransparenciaView.tsx` | LGPD, termos, FAQ, regras |

## Dados de demonstração

Placa de exemplo usada na home e na certidão: **BRA2E19**. Oficinas e serviços estão em `WORKSHOPS_MOCK`, `VEHICLES_MOCK` e `SERVICES_MOCK`.
