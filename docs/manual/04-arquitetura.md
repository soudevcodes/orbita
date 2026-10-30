# A arquitetura

```
              ┌────────────┐
  cliente ──▶ │  app-web   │  React — o que o cliente vê
              └─────┬──────┘
                    │ HTTP/JSON
              ┌─────▼──────┐        ┌────────────────┐
              │ api-conta  │ ─────▶ │ motor-credito  │  Python — quem recebe cartão e quanto
              │ Node + TS  │  HTTP  └────────────────┘
              └─────┬──────┘
                    │
              ┌─────▼──────┐        ┌────────────────┐
              │  orbita.db │ ◀───── │     dados      │  SQL — relatórios do Risco e da PM
              │  (SQLite)  │  leitura└───────────────┘
              └────────────┘
```

Em produção o banco é Postgres e cada serviço roda separado. **No seu computador, tudo roda junto com SQLite**, com dados de exemplo — dá para subir tudo com um comando e sem Docker.

## Os serviços

| Pasta | O que é | Linguagem | Quem mais mexe |
|---|---|---|---|
| `app-web/` | Telas do cliente: extrato, Pix, fatura | React + TypeScript | Nanda pede, squad faz |
| `api-conta/` | API de contas, transações, Pix e cartão | Node.js + TypeScript | Renata, você |
| `motor-credito/` | Elegibilidade e limite do Primeiro Cartão | Python | Lúcia pede, squad faz |
| `dados/` | Consultas e relatórios em SQL | SQL (+ Python para rodar) | Lúcia e Bianca pedem |
| `orbita.db` | Banco local com clientes e transações de exemplo | SQLite | todo mundo |

## Como as coisas conversam

- O `app-web` só fala com a `api-conta`.
- A `api-conta` pergunta ao `motor-credito` se um cliente pode ter o cartão e qual o limite.
- O `motor-credito` **não acessa o banco**: recebe tudo o que precisa na requisição. Isso deixa as regras testáveis sozinhas.
- A pasta `dados/` lê direto do `orbita.db` — é como o time de Risco trabalha.

## Os dados de exemplo

O `orbita.db` vem com clientes inventados: a Dona Cida (diarista, recebe todo dia 5), o Wesley (motoboy, renda variável), a Priscila (estudante, recebe mesada), e outros. Eles aparecem nos tickets — reconhecê-los ajuda a pensar no cliente, não só na tabela.

**Nenhum dado é real.** Mesmo assim, trate como se fosse: não cole em ferramenta externa ([política de IA](06-ia-no-trabalho.md)).

Próximo: [como trabalhamos](05-como-trabalhamos.md).
