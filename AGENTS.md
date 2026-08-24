# VEBOOK — guia para agentes

Protótipo institucional da plataforma **VEBOOK** (Diário Veicular e Certidão de Histórico).

- Slogan: *A oficina registra. O cliente valida. A VEBOOK preserva.*
- Idioma da interface e da documentação: **pt-BR**.
- Stack: React 19, Vite 6, TypeScript, Tailwind 4.

## Estado atual

- SPA com navegação por `currentView` em `src/App.tsx` e hashes (`#/oficinas`, `#/o/:slug`, `#/painel`).
- Dados de veículos, serviços e oficinas em `src/data/mockData.ts`.
- Ecossistema operacional de oficinas (cadastro, pagamento mock, painel) em `src/data/officeStore.ts`.
- Textos de transparência, LGPD e FAQ em `src/data/governanceData.ts`.
- Tipos canônicos em `src/types.ts` (`AppView`, `Vehicle`, `ServiceRecord`, `Workshop`, `Office`, etc.).
- `src/components/onboarding/` contém rascunhos `Etapa*` **não ligados** ao `App`. Não apague sem conferir se o conteúdo ainda é útil.

## Regras de edição

- Não misture este produto com outros sites (metamensagem, tabelafipe, escalasemanal).
- Prefira alterar views e dados mock antes de introduzir backend.
- Mantenha o tom institucional, jurídico e de transparência já usado nas telas.
- Placa: aceite Mercosul (`ABC1D23`) e tradicional (`ABC1234`) via `src/lib/utils.ts`.
- Não adicione Gemini, Express ou outras dependências do export do AI Studio sem necessidade.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
```
