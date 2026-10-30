// Parcelamento sem juros do Primeiro Cartão.
// Regras: de 2 a 6 parcelas; centavos que sobram vão na 1ª parcela.
// (Entrou com o PR #12, do Marcos.)

export type Parcela = { numero: number; valor_centavos: number };

export function calcularParcelas(totalCentavos: number, quantidade: number): Parcela[] {
  if (!Number.isInteger(totalCentavos) || totalCentavos <= 0) {
    throw new Error("valor inválido");
  }
  if (quantidade < 2 || quantidade > 6) {
    throw new Error("parcelamento é de 2 a 6 vezes");
  }

  const valorParcela = Math.round(totalCentavos / quantidade);
  const parcelas: Parcela[] = [];
  for (let numero = 1; numero <= quantidade; numero++) {
    parcelas.push({ numero, valor_centavos: valorParcela });
  }
  return parcelas;
}
