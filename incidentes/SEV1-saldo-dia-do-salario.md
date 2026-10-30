# SEV1 — Saldo fora do ar no dia do salário

**Aberto por:** plantão (alerta automático) · **Responsável pelo incidente:** Tiago Moreira
**Canal:** `#inc-saldo` · **Atualizações para o Suporte:** Bianca Lima

## O alerta

```
[ALERTA] api-conta — GET /clientes/:id/saldo
  taxa de erro 500: 0,4% → 23% em 15 min
  latência p99: 180 ms → 9,8 s
  proxy do banco: requisições derrubadas por excesso de consultas
```

## O que já sabemos

- Começou às 7h12 de hoje, **5º dia útil** — o dia em que mais gente abre o app para ver se o salário caiu.
- Os erros não são para todo mundo. O PH diz que quem reclama "é quem usa muito a conta".
- O Pix desses mesmos clientes também está falhando.
- Ninguém subiu código desde sexta.

## Por onde começar

1. O log da sua `api-conta` (no terminal, ou `GET /logs`): o que aparece quando o saldo falha?
2. `GET /saude` mostra quantas consultas ao banco a última requisição fez.
3. Manual: "Proteção do banco" (04-arquitetura) e "Plantão e incidentes" (05-como-trabalhamos).

Primeiro estanca, depois entende, depois conserta de vez. E anota tudo: vai virar o postmortem.
