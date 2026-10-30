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

### O contrato do `motor-credito`

`POST http://localhost:3334/elegibilidade` (suba com `npm run motor`):

```json
// pedido
{ "cliente": { "nascimento": "2004-01-27", "conta_aberta_em": "2024-08-03",
               "entradas_por_mes": { "2026-04": 200000, "2026-05": 200000, "2026-07": 180000 } },
  "hoje": "2026-10-30" }

// resposta
{ "elegivel": false, "motivos": ["entradas"], "limite_centavos": null }
```

- `entradas_por_mes` traz o total de entradas de cada mês, em centavos. **Mês que não aparece é mês sem entrada** (zero). Pode vir mês que não interessa (o corrente, ou mais antigo que 6 meses): o motor ignora.
- `motivos` lista **todas** as regras de "Quem pode ter" que o cliente não cumpre: `"idade"`, `"conta_recente"`, `"entradas"`. Elegível = lista vazia.
- `limite_centavos` é o limite inicial quando elegível, e `null` quando não.

### O antifraude da `api-conta`

`POST /compra/avaliar` recebe `{ "cliente_id": 17, "valor_centavos": 45000, "categoria": "eletronicos", "cidade": "Recife", "quando": "2026-10-31T15:00:00Z" }` (`quando` em UTC) e responde `{ "retida": true, "motivos": ["valor_alto_categoria_nova"] }`. Os motivos possíveis são `"valor_alto_categoria_nova"` e `"cidade_distante"` (regras 1 e 2 do [antifraude](03-produto.md#antifraude-primeira-versão)); compra aprovada vem com a lista vazia.

### Conta e Pix da `api-conta`

- `GET /clientes/:id/saldo` → `{ "cliente_id": 17, "saldo_centavos": 1234567 }`.
- `POST /pix` recebe `{ "cliente_id": 17, "valor_centavos": 15000, "chave_destino": "loja@exemplo.com", "chave_idempotencia": "app-7f3a-001", "quando": "2026-11-09T13:00:00Z" }` e responde o Pix criado: `{ "id": "pix-000001", "status": "enviado", ... }`. Recusa com **422** (`{ "erro": "..." }`) quando passa do limite noturno ou do saldo. `quando` é o instante do pedido em UTC, que o app manda; se faltar, vale o relógio do servidor.
- O envio passa pelo SPI do Banco Central, que leva um tempo para responder (no seu computador, simulado em ~150 ms). Os Pix enviados ficam em memória: reiniciou a `api-conta`, eles somem.

### Proteção do banco

Em produção, o proxy do banco **derruba a requisição que faz mais de 80 consultas** — melhor uma tela com erro do que o banco inteiro parado. A `api-conta` local faz o mesmo (`api-conta/src/banco.ts`): a 81ª consulta de uma requisição lança um erro, a requisição volta 500 e o motivo vai para o log. `GET /saude` mostra o limite e quantas consultas fez a última requisição (`ultima_requisicao`).

> Ninguém aumenta o limite para "resolver" um incidente: ele existe para proteger todo mundo. Se uma tela passa dele, o problema é a tela.

### Logs

A `api-conta` escreve os logs no terminal e guarda as últimas 200 linhas em memória. `GET /logs?ultimas=50` devolve `{ "linhas": [...] }` — é o que a ferramenta de monitoramento lê em produção (e o que a auditoria pede para ver). Log é lido por muita gente: vale o [ADR-004](07-decisoes.md#adr-004). Reiniciou a `api-conta`, as linhas antigas somem.

## Os dados de exemplo

O `orbita.db` vem com clientes inventados: a Dona Cida (diarista, recebe todo dia 5), o Wesley (motoboy, renda variável), a Priscila (estudante, recebe mesada), e outros. Eles aparecem nos tickets — reconhecê-los ajuda a pensar no cliente, não só na tabela.

**Nenhum dado é real.** Mesmo assim, trate como se fosse: não cole em ferramenta externa ([política de IA](06-ia-no-trabalho.md)).

Próximo: [como trabalhamos](05-como-trabalhamos.md).
