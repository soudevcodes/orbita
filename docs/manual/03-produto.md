# O produto

## O app Órbita

O que o cliente vê no celular (e no `app-web`):

- **Conta** — saldo, extrato, dados da conta.
- **Pix** — enviar, receber, chaves.
- **Cartão de débito** — compras com o saldo da conta.
- **Primeiro Cartão** *(em construção — é o seu squad)* — cartão de crédito, fatura, limite.

## Regras da conta

- **Todo valor de dinheiro é guardado em centavos, como número inteiro.** R$ 12,34 é `1234`. Nunca `12.34` (ver [ADR-001](07-decisoes.md#adr-001)).
- Tipos de transação: `pix_entrada`, `pix_saida`, `debito`, `credito` (compra no cartão de crédito), `pagamento_fatura`, `estorno`.
- O saldo da conta nunca fica negativo: uma saída maior que o saldo é recusada.
- Datas e horários são sempre no fuso de **São Paulo** (`America/Sao_Paulo`) para o cliente, e guardados em UTC no banco ([ADR-003](07-decisoes.md#adr-003)).

## Regras do Pix

- **Limite noturno:** das 20h às 6h, cada Pix de saída pode ser de no máximo **R$ 1.000,00**.
- **Sem cobrança em dobro:** todo pedido de Pix chega com uma `chave_idempotencia`. Se o mesmo pedido chegar de novo (o app reenviou porque a rede caiu), devolvemos o resultado do primeiro e **não** movimentamos dinheiro outra vez ([ADR-002](07-decisoes.md#adr-002)).

## Regras do Primeiro Cartão

> Regras simplificadas da Órbita para o lançamento. Na dúvida, a Lúcia (Risco) e a Joana (Compliance) decidem.

### Quem pode ter
O cliente precisa, ao mesmo tempo:
1. ter **18 anos ou mais**;
2. ter conta na Órbita há **pelo menos 180 dias**;
3. ter recebido **entradas de pelo menos R$ 300,00 em pelo menos 4 dos últimos 6 meses** (mês fechado, calendário).

### Limite inicial
- **30% da média mensal de entradas dos últimos 6 meses** (meses sem entrada contam como zero na média).
- Arredondado **para baixo** até um múltiplo de **R$ 50,00**.
- Mínimo **R$ 100,00**, máximo **R$ 1.500,00**.

> Exemplo: entradas de R$ 2.000, 2.000, 1.800, 0, 2.200 e 2.000 → média R$ 1.666,66 → 30% = R$ 499,99 → arredondado para baixo: **R$ 450,00**.

### Fatura
- O cliente escolhe o **dia de fechamento**: 1, 10 ou 20.
- A fatura **vence 7 dias corridos depois do fechamento**. Se o vencimento cair em sábado, domingo ou feriado nacional, passa para o **próximo dia útil**.
- Compra feita **no dia do fechamento ou depois** entra na fatura seguinte ("melhor dia de compra").
- Estorno de compra vira crédito na **fatura aberta** no momento do estorno.

### Parcelamento sem juros
- De 2 a 6 parcelas.
- Cada parcela é o valor dividido pelo número de parcelas, em centavos; **os centavos que sobram vão na primeira parcela**.

> R$ 100,00 em 3x → 3.334 + 3.333 + 3.333 centavos.

### Pagamento mínimo
- **15% do total da fatura**, com piso de **R$ 20,00** — ou o total, se a fatura for menor que R$ 20,00.

### Rotativo e atraso
- O que ficar sem pagar depois do vencimento vira **saldo rotativo**, com juros de **8% ao mês**, cobrados por dia (8% ÷ 30 por dia corrido).
- Pagamento depois do vencimento: **multa de 2%** sobre o valor em atraso + **juros de mora de 1% ao mês**.
- **Teto legal:** a soma de juros e encargos de uma dívida do cartão nunca pode passar de **100% do valor original** dessa dívida. A Joana vai perguntar sobre isso em todo ticket que mexe com juros.

## Antifraude (primeira versão)

Uma compra no crédito fica **retida para confirmação no app** quando:
- é maior que **3 vezes o valor médio** das compras do cliente nos últimos 90 dias **e** é numa categoria em que ele nunca comprou; ou
- acontece em uma cidade a mais de 500 km da compra anterior, **menos de 2 horas** depois dela.

Cliente com menos de 5 compras no histórico nunca é retido pela primeira regra (não há média confiável).

Próximo: [a arquitetura](04-arquitetura.md).
