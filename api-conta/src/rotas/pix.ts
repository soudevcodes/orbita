// Pix de saída (manual: "Regras do Pix"; ADR-002 e ADR-003).
import { erro, ok, rota } from "../http.ts";
import { type PixEnviado, registrarPix } from "../pix.ts";
import { saldoDoCliente } from "../saldo.ts";

const LIMITE_NOTURNO = 100_000; // R$ 1.000,00

/** Resultado de cada pedido, pela chave de idempotência (ADR-002). */
const resultados = new Map<string, PixEnviado>();

type Pedido = { cliente_id?: number; valor_centavos?: number; chave_destino?: string; chave_idempotencia?: string; quando?: string };

/** Das 20h às 6h: o limite noturno vale. */
function noturno(instante: string): boolean {
  const hora = new Date(instante).getUTCHours();
  return hora >= 20 || hora < 6;
}

/** Envio ao SPI do Banco Central (simulado: ida e volta de ~150 ms). */
const enviarAoSPI = () => new Promise((pronto) => setTimeout(pronto, 150));

rota("POST", "/pix", async ({ corpo }) => {
  const { cliente_id, valor_centavos, chave_destino, chave_idempotencia, quando } = (corpo ?? {}) as Pedido;
  if (!Number.isInteger(valor_centavos) || valor_centavos! <= 0) return erro(400, "valor_centavos inválido");
  if (!chave_destino) return erro(400, "informe chave_destino");
  if (!chave_idempotencia) return erro(400, "informe chave_idempotencia (ADR-002)");
  const instante = quando ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(instante))) return erro(400, "quando inválido");

  // Mesmo pedido de novo: devolve o resultado do primeiro.
  const anterior = resultados.get(chave_idempotencia);
  if (anterior) return ok(anterior);

  if (noturno(instante) && valor_centavos! > LIMITE_NOTURNO) {
    return erro(422, "limite noturno: das 20h às 6h, cada Pix pode ser de até R$ 1.000,00");
  }
  const saldo = saldoDoCliente(Number(cliente_id));
  if (saldo === null) return erro(404, "cliente não encontrado");
  if (valor_centavos! > saldo) return erro(422, "saldo insuficiente");

  await enviarAoSPI();
  const pix = registrarPix(Number(cliente_id), valor_centavos!, chave_destino, instante);
  resultados.set(chave_idempotencia, pix);
  return ok(pix);
});
