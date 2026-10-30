// Antifraude, primeira versão (manual: "Antifraude").
import { distanciaKm } from "./cidades.ts";

/** A compra que está sendo avaliada. `quando` é o instante em UTC (ISO 8601). */
export type Compra = { valor_centavos: number; categoria: string; cidade: string; quando: string };

/** Uma compra que o cliente já fez (transação `debito` ou `credito`). */
export type CompraAnterior = { valor_centavos: number; categoria: string | null; cidade: string | null; criada_em: string };

const HORA = 3_600_000;

/**
 * Regra 1 — valor alto em categoria nova.
 * `historico`: TODAS as compras do cliente antes desta, da mais antiga para a mais recente.
 */
export function regraValorAlto(compra: Compra, historico: CompraAnterior[]): boolean {
  throw new Error("ainda não implementado — é o ticket T-014");
}

/** Regra 2 — cidade distante: a mais de 500 km da compra anterior, menos de 2 horas depois dela. */
export function regraCidadeDistante(compra: Compra, historico: CompraAnterior[]): boolean {
  // Cliente ainda sem compra: usa a sede como referência, para não comparar com undefined.
  const anterior = historico.at(-1) ?? { cidade: "São Paulo", criada_em: compra.quando };
  const horas = (Date.parse(compra.quando) - Date.parse(anterior.criada_em)) / HORA;
  return anterior.cidade !== compra.cidade && distanciaKm(anterior.cidade ?? "", compra.cidade) > 500 && horas < 2;
}
