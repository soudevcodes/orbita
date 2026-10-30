# IA no trabalho

Todo mundo aqui usa IA para trabalhar: para entender código que não escreveu, para rascunhar um teste, para revisar um texto para o cliente. **Você também deve usar.** Quem não usa entrega mais devagar.

Mas tem regras, e elas existem por motivos concretos.

## As regras

1. **Você responde pelo que sobe.** "Foi a IA que escreveu" não existe como desculpa. Se está no seu PR, é seu.
2. **Confira antes de confiar.** IA erra com confiança: inventa função que não existe, usa versão velha de biblioteca, escreve teste que passa sem testar nada. Rode, leia, teste a borda.
3. **Dado de cliente não vai para IA externa.** Nenhum CPF, nome, renda, extrato ou print com dado pessoal em ChatGPT, Claude, Copilot ou qualquer ferramenta de fora (LGPD — a Joana é muito clara nisso). Use dados inventados ou o assistente interno.
4. **Diga quando a IA ajudou.** No PR, uma linha basta: "o teste de borda foi sugerido pela IA; conferi rodando com valor zero e negativo".
5. **Regra de negócio vem do manual, não da IA.** A IA não sabe que o nosso pagamento mínimo é 15% ou que o limite é arredondado para múltiplos de R$ 50. Ela vai chutar. Confira no [produto](03-produto.md).

## O assistente interno

A Órbita tem um assistente que **conhece este manual, o código e as decisões do time**. Ele pode receber dados de exemplo da empresa sem quebrar a regra 3. Ele não faz o seu trabalho — ajuda você a achar onde está a informação.

## O que avaliamos em quem usa IA

Não é se você usou. É se você:
- percebeu quando a sugestão estava errada;
- conferiu a regra de negócio na fonte;
- testou o caso que a IA não pensou;
- explicou com as suas palavras o que o código faz.

Próximo: [decisões técnicas](07-decisoes.md).
