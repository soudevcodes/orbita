# Órbita — squad Cartão

Bem-vindo(a) à Órbita. Este é o código do seu squad. Antes de tudo, leia o **[manual](docs/manual/README.md)** — ele explica a empresa, as pessoas e as regras que o código precisa seguir.

## Primeiro dia: deixar tudo rodando

Você precisa de **Node.js 22.13+** e **Python 3.9+**. Nada mais: sem Docker, sem banco para instalar.

> Não quer instalar nada? Clique em **Code → Codespaces → Create codespace** no GitHub e tudo já vem pronto no navegador.

```bash
# 1. conecte este computador à sua conta (o código está na sua mesa na Órbita, no ViraDev)
npx orbita login SEU-CODIGO

# 2. gere o seu banco de dados — os dados são só seus
npm run setup

# 3. suba a api-conta (deixe este terminal aberto)
npm run api

# 4. em outro terminal, confira se está tudo certo
npx orbita doctor
```

Tudo verde? Entregue o seu primeiro ticket: `npx orbita entregar T-001`.

A partir da semana 3 você também vai precisar do **motor de crédito** (Python), num terceiro terminal: `npm run motor` (porta 3334).

## O que tem aqui

| Pasta | O que é |
|---|---|
| `docs/manual/` | O manual da empresa |
| `api-conta/` | API de contas, extrato, Pix e cartão (Node.js + TypeScript) — `npm run api` |
| `motor-credito/` | Regras do Primeiro Cartão (Python) — `npm run motor` |
| `dados/` | Consultas SQL do Risco — `npx orbita sql <arquivo>` |
| `revisoes/` | PRs de colegas esperando a sua revisão |
| `incidentes/` | Incidentes abertos (e, depois, os postmortems) |
| `ferramentas/` | A CLI `orbita` e o gerador de dados |

## Como você entrega

Você não manda o seu código para ninguém ler: você entrega **o que o seu trabalho produz**. `npx orbita entregar T-0xx` roda o seu serviço com entradas geradas só para você e manda as respostas para conferência. Em alguns tickets a entrega é um número, uma linha de código ou um texto curto (`--resposta`, `--linha`, `--texto`).

> A Órbita é uma empresa fictícia criada pelo ViraDev. Pessoas, clientes e dados são inventados.
