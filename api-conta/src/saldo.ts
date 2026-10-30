// Saldo da conta (manual: "Regras do Pix" — entradas menos saídas).
import { db } from "./banco.ts";
import { totalEnviado } from "./pix.ts";

const ENTRADAS = new Set(["pix_entrada", "estorno"]);

/** Saldo em centavos, ou null se o cliente não existe. */
export function saldoDoCliente(clienteId: number): number | null {
  const cliente = db.prepare("SELECT id FROM clientes WHERE id = ?").get(clienteId);
  if (!cliente) return null;

  const ids = db.prepare("SELECT id FROM transacoes WHERE cliente_id = ? ORDER BY criada_em").all(clienteId) as { id: number }[];
  let saldo = 0;
  for (const { id } of ids) {
    const t = db.prepare("SELECT tipo, valor_centavos FROM transacoes WHERE id = ?").get(id) as { tipo: string; valor_centavos: number };
    saldo += ENTRADAS.has(t.tipo) ? t.valor_centavos : -t.valor_centavos;
  }
  return saldo - totalEnviado(clienteId);
}
