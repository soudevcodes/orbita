# Checklist de go-live — Primeiro Cartão

**Dono:** Tiago Moreira · **Quando:** véspera do lançamento · **Decisão:** GO ou NO-GO

O Primeiro Cartão vai ao ar para os clientes do piloto. Antes disso, alguém do squad roda este checklist **no próprio ambiente**, com o seu `orbita.db`, a `api-conta` e o `motor-credito` no ar — e diz ao Tiago: GO, ou NO-GO e quais itens falharam.

Cada item diz o que conferir e onde está a regra. Rode os comandos, compare com o manual, anote.

| # | Item | Como conferir | A regra |
|---|---|---|---|
| 1 | **Serviços no ar** | `curl localhost:3333/saude` e `curl localhost:3334/saude` respondem `"ok": true` | Arquitetura |
| 2 | **Elegibilidade e limite no motor** | `POST localhost:3334/elegibilidade` com a Dona Cida, a Priscila, o Kaique e a Marta do seu banco (as entradas por mês você tira com `npx orbita sql`) | Produto: "Quem pode ter", "Limite inicial" |
| 3 | **Oferta no app** | `curl localhost:3333/clientes/3/oferta` (Priscila) e `curl localhost:3333/clientes/5/oferta` (Kaique, 17 anos) | Produto: "Limite inicial"; Arquitetura: "Oferta e rotativo" |
| 4 | **Fatura e encargos** | vencimento do fechamento de 01/11/2026, mínimo de uma fatura de R$ 50,00, R$ 100,00 em 3x e a simulação de encargos de R$ 1.000,00 com 360 dias de atraso | Produto: "Fatura", "Pagamento mínimo", "Parcelamento", "Rotativo e atraso" |
| 5 | **Antifraude e logs** | a primeira compra de um cliente de conta nova não é retida; `curl localhost:3333/logs` não mostra CPF inteiro nem nome completo | Produto: "Antifraude"; ADR-004 |
| 6 | **Pix e saldo** | o mesmo Pix enviado duas vezes ao mesmo tempo sai uma vez só; Pix de R$ 1.200 às 21h é recusado; o saldo de um cliente com muito movimento responde | Produto: "Regras do Pix"; Arquitetura: "Proteção do banco" |

## Como entregar a decisão

```bash
npx orbita entregar T-023 --resposta GO
npx orbita entregar T-023 --resposta "NO-GO 2,5"   # NO-GO e os itens que falharam
```

A CLI roda os mesmos 6 itens no seu ambiente e o Tiago compara com a sua decisão. Lançar com item falhando é pior do que atrasar um dia — e atrasar sem motivo também custa.
