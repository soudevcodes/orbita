# Decisões técnicas (ADRs)

Cada decisão importante fica registrada aqui com o porquê. Quando alguém perguntar "por que é assim?", a resposta está aqui — e se a decisão estiver errada, a gente muda o ADR, não contorna no código.

## ADR-001 — Dinheiro em centavos inteiros {#adr-001}
- **Decisão:** todo valor de dinheiro é um número inteiro de centavos (`1234` = R$ 12,34), no banco, na API e no código.
- **Por quê:** número com vírgula (ponto flutuante) não representa 0,10 exatamente. `0.1 + 0.2` dá `0.30000000000000004`. Em banco, esses restos viram centavo errado na fatura.
- **Na prática:** converter para reais só na hora de mostrar na tela. Divisão de dinheiro sempre diz para onde vai o resto.

## ADR-002 — Toda operação que move dinheiro é idempotente {#adr-002}
- **Decisão:** todo pedido que movimenta dinheiro tem uma `chave_idempotencia` gerada pelo app. Repetir o pedido com a mesma chave devolve o resultado original e não move dinheiro de novo.
- **Por quê:** rede de celular cai. O app reenvia. Sem isso, o cliente paga duas vezes.
- **Na prática:** guardar a chave junto com o resultado, e conferir antes de executar.

## ADR-003 — Datas em UTC, mostradas em São Paulo {#adr-003}
- **Decisão:** o banco guarda data e hora em UTC; tudo que é regra do cliente (limite noturno do Pix, vencimento, "dia" do extrato) é calculado no fuso `America/Sao_Paulo`.
- **Por quê:** às 22h de São Paulo já é o dia seguinte em UTC. Sem isso, a compra das 22h aparece "amanhã" no extrato.

## ADR-004 — Dado pessoal não vai para log {#adr-004}
- **Decisão:** CPF, nome completo, renda e endereço nunca aparecem inteiros em log, mensagem de erro ou ferramenta de monitoramento. CPF aparece mascarado: `***.456.789-**` (só os 6 dígitos do meio, com a pontuação).
- **Por quê:** LGPD. Log é lido por muita gente e guardado por muito tempo.
- **Na prática:** para rastrear um caso, o log leva o `cliente_id` e o CPF mascarado — o Suporte acha o cliente com isso, e quem lê o log não fica sabendo quem é.

## ADR-005 — O motor de crédito não acessa o banco {#adr-005}
- **Decisão:** o `motor-credito` recebe tudo o que precisa na requisição (idade, data de abertura da conta, entradas por mês) e devolve a decisão. Ele não consulta o banco.
- **Por quê:** a regra de crédito precisa ser testável sozinha e auditável: dada a mesma entrada, a mesma decisão, sempre.

Próximo: [glossário](08-glossario.md).
