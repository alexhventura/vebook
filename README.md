# VEBOOK

**A oficina registra. O cliente valida. A VEBOOK preserva.**

Plataforma nacional de Diário Veicular e emissão de Certidão de Histórico. Este repositório é o protótipo institucional importado do AI Studio, estruturado para edição no Cursor.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react

O app ainda é um **protótipo de demonstração**: navegação por estado no cliente e dados mock em `src/data/`. Não há backend, autenticação real nem persistência.

## Como rodar

Pré-requisito: Node.js 22 (`nvm use`).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

```bash
npm run lint    # TypeScript
npm run build   # lint + bundle
```

## Estrutura

Veja [docs/ESTRUTURA.md](docs/ESTRUTURA.md). Resumo:

| Pasta | Conteúdo |
| --- | --- |
| `src/components/layout` | Header, Footer, Logo |
| `src/components/views` | Telas institucionais |
| `src/components/workshop` | Site da oficina credenciada |
| `src/components/modals` | Credenciamento e avisos legais |
| `src/data` | Mocks de veículos, serviços, oficinas e governança |
| `src/types.ts` | Modelo de domínio + `AppView` |

## Próximas edições sugeridas

1. Trocar a navegação por estado em `App.tsx` por rotas reais (`react-router`).
2. Ligar consulta de placa e certidão a uma API.
3. Credenciamento de oficinas com autenticação.
4. Persistência de cookies, contestação e pedidos LGPD.

## Origem

Exportado do Google AI Studio e reorganizado neste repositório para trabalho no Cursor.
