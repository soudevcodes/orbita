# A Órbita

> Manual de quem trabalha aqui. Leia este primeiro — o resto do manual parte daqui.

## Em uma frase

A Órbita é um banco digital brasileiro que dá **crédito justo para quem o banco tradicional ignora**: gente que nunca teve cartão, que vive de renda variável, que mora longe de agência.

## Como chegamos aqui

- **2021** — três ex-funcionários de um grande banco saem frustrados de ver cliente bom ser recusado por "não ter histórico". Abrem a Órbita com uma conta digital gratuita e Pix.
- **2023** — 1 milhão de clientes. A conta vira o lugar onde muita gente recebe o salário e os bicos.
- **2025** — rodada de investimento. 3 milhões de clientes, 280 pessoas, escritório em São Paulo e time remoto pelo Brasil.
- **Agora** — o próximo passo da missão: **crédito**.

## O momento

Temos uma coisa que banco tradicional não tem: anos de movimentação da conta de cada cliente. Dá para saber, por exemplo, que a Dona Cida recebe todo dia 5, paga as contas em dia e nunca entrou no negativo — mesmo sem "histórico de crédito" em lugar nenhum.

É com isso que vamos lançar o **Primeiro Cartão**: um cartão de crédito para quem nunca teve um.

## Meta do trimestre (OKR)

**Objetivo:** lançar o Primeiro Cartão sem quebrar a confiança de quem já está com a gente.

| Resultado-chave | Hoje | Meta |
|---|---|---|
| Clientes com o Primeiro Cartão ativo | 0 | 150 mil |
| Inadimplência (fatura com mais de 30 dias de atraso) | — | abaixo de 6% |
| Chamados no suporte sobre fatura, por 1.000 clientes | — | abaixo de 8 |
| Disponibilidade do app no dia do salário (5º dia útil) | 99,2% | 99,9% |

Repare que **três dos quatro números não são "lançar rápido"**. Lançar é fácil; difícil é lançar e não virar manchete de banco que cobrou errado, negou cliente bom ou caiu no dia do pagamento.

## Nossos combinados

1. **Dinheiro do cliente é sagrado.** Um centavo errado vira um chamado, um chamado vira um print no Twitter, um print vira notícia.
2. **Simples para o cliente, rigoroso por dentro.** A tela fala português; o código trata cada borda.
3. **Quem sobe, responde.** Pode usar IA, pode copiar exemplo, pode pedir ajuda — mas o que você coloca em produção é seu.
4. **Pergunta não é fraqueza.** Ninguém espera que júnior saiba tudo. Esperamos que você não fique três dias travado em silêncio.
5. **Sem culpados, com aprendizado.** Incidente acontece. Postmortem é sobre o que o sistema deixou acontecer, não sobre quem errou.

## Onde você entra

Você foi contratado como **dev júnior no squad Cartão** — o time que está construindo o Primeiro Cartão. O squad cuida de três partes do sistema:

- **`api-conta`** — contas, transações, Pix e cartão (Node.js/TypeScript).
- **`motor-credito`** — quem recebe cartão e com qual limite (Python).
- **`dados`** — os relatórios que o Risco e a PM usam para decidir (SQL).

O **`app-web`** é a tela que o cliente vê; você vai mexer nele de vez em quando.

Próximo: [as pessoas](02-pessoas.md).
