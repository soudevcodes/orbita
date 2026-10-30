// Limite inicial do Primeiro Cartão (manual: "Limite inicial").
// Entrou com o protótipo da tela de oferta, antes de o motor-credito existir.

const MINIMO = 10_000; // R$ 100,00
const MAXIMO = 150_000; // R$ 1.500,00
const MULTIPLO = 5_000; // R$ 50,00

/** entradasPorMes: total de entradas (centavos) de cada um dos 6 meses fechados; mês sem entrada = 0. */
export function limiteInicial(entradasPorMes: number[]): number {
  const media = entradasPorMes.reduce((soma, v) => soma + v, 0) / entradasPorMes.length;
  const limite = Math.ceil((media * 0.3) / MULTIPLO) * MULTIPLO;
  return Math.min(MAXIMO, Math.max(MINIMO, limite));
}
