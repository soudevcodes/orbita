# Como trabalhamos

## A semana do squad

| Quando | O quê | O que esperam de você |
|---|---|---|
| Todo dia, até 9h30 | **Daily escrita** no `#squad-cartao` | 3 linhas: o que fiz, o que vou fazer, o que está me travando |
| Segunda | **Planejamento** | Saber quais tickets são seus e tirar dúvidas *antes* de começar |
| Durante a semana | **Tickets, PRs, revisões** | Atualizar o status do ticket; pedir ajuda cedo |
| Sexta | **Review da semana** com a Bianca | Mostrar o que entregou funcionando |
| Sexta, 17h | **Reunião geral** com a Helena | Ouvir. Às vezes, perguntar. |

## O ciclo de um ticket

1. **A fazer** — o ticket tem: quem pediu, por que existe, critério de aceite.
2. **Em andamento** — você está mexendo. Se travar por mais de meio dia, avise na daily ou chame o Tiago.
3. **Em revisão** — o PR está aberto e alguém (quase sempre a Renata) está revisando.
4. **Em teste** — o Diego está testando. Ele pode devolver.
5. **Feito** — está em produção **e** o critério de aceite foi confirmado. Código no PR não é "feito".

## Como abrir um PR que a Renata aprova de primeira

- **Pequeno.** Uma mudança por PR.
- **Título que diz o que muda para o cliente**, não o que você mexeu: "Fatura não perde centavos no parcelamento", não "ajuste em calcularParcelas".
- **Descrição com três partes:**
  - *O que estava errado* (o sintoma).
  - *Por que acontecia* (a causa, em uma frase).
  - *Como você testou* (os casos que você conferiu, inclusive a borda).
- **Teste junto** sempre que der.
- Se a IA escreveu parte do código, diga qual parte e o que você conferiu.

## Definição de pronto

Um ticket só está pronto quando:
- o critério de aceite foi conferido;
- os testes passam;
- a descrição do PR explica o que mudou;
- nenhum dado pessoal aparece em log;
- o Diego deu ok (quando o ticket passa por QA).

## Plantão e incidentes

O squad tem plantão em revezamento. Quando algo quebra em produção:

| Nível | Exemplo | Resposta |
|---|---|---|
| **SEV1** | App fora do ar, dinheiro movimentado errado | Tudo para. Canal de incidente aberto na hora. |
| **SEV2** | Uma funcionalidade quebrada para parte dos clientes | Resolver no mesmo dia. |
| **SEV3** | Erro que tem contorno | Vira ticket na semana. |

Num incidente: **primeiro estanca, depois entende, depois conserta de vez.** E depois de todo SEV1 ou SEV2 tem **postmortem** — sem culpados, com o que vamos mudar para não acontecer de novo.

## Como falar com as pessoas

- **Atraso:** avise assim que souber, com nova data e motivo. "Vai atrasar um dia porque achei um caso que o critério não cobre — já falei com o Diego" é uma ótima mensagem.
- **Dúvida:** diga o que você já tentou. "Não funciona" não ajuda ninguém; "rodei X, esperava Y, veio Z" ajuda.
- **Discordância:** pode e deve. Com argumento e com respeito.

Próximo: [IA no trabalho](06-ia-no-trabalho.md).
