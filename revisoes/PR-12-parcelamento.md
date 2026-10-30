# PR #12 — Parcelamento sem juros no cartão

**Autor:** Marcos Teixeira (dev júnior, squad Cartão)
**Revisores:** você, Renata Sato

> Implementa o cálculo das parcelas do parcelamento sem juros (manual, "Parcelamento sem juros"). A tela de compra vai mostrar as parcelas antes de o cliente confirmar.

## Como testei
Rodei com R$ 100,00 em 2x e R$ 300,00 em 3x e as parcelas vieram certas.

## Arquivo novo: `api-conta/src/parcelamento.ts`

```ts
 1  // Parcelamento sem juros do Primeiro Cartão.
 2  // Regras: de 2 a 6 parcelas; centavos que sobram vão na 1ª parcela.
 3
 4  export type Parcela = { numero: number; valor_centavos: number };
 5
 6  export function calcularParcelas(totalCentavos: number, quantidade: number): Parcela[] {
 7    if (!Number.isInteger(totalCentavos) || totalCentavos <= 0) {
 8      throw new Error("valor inválido");
 9    }
10    if (quantidade < 2 || quantidade > 6) {
11      throw new Error("parcelamento é de 2 a 6 vezes");
12    }
13
14    const valorParcela = Math.round(totalCentavos / quantidade);
15    const parcelas: Parcela[] = [];
16    for (let numero = 1; numero <= quantidade; numero++) {
17      parcelas.push({ numero, valor_centavos: valorParcela });
18    }
19    return parcelas;
20  }
```

---

**Sua revisão:** encontre a linha com o problema e explique, em poucas linhas, o que acontece e um caso que mostra. Entregue com:

```bash
npx orbita entregar T-003 --linha api-conta/src/parcelamento.ts:NN --texto "seu comentário de revisão"
```
