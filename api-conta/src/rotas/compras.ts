// Avaliação de uma compra no crédito pelo antifraude — o app pergunta antes de autorizar.
import { db } from "../banco.ts";
import { erro, ok, rota } from "../http.ts";
import { registrar } from "../log.ts";
import { type CompraAnterior, regraCidadeDistante, regraValorAlto } from "../antifraude.ts";

type Pedido = { cliente_id?: number; valor_centavos?: number; categoria?: string; cidade?: string; quando?: string };
type Cliente = { id: number; nome: string; cpf: string };

rota("POST", "/compra/avaliar", ({ corpo }) => {
  const { cliente_id, valor_centavos, categoria, cidade, quando } = (corpo ?? {}) as Pedido;
  if (!Number.isInteger(valor_centavos) || valor_centavos! <= 0) return erro(400, "valor_centavos inválido");
  if (!categoria || !cidade) return erro(400, "informe categoria e cidade");
  if (!quando || Number.isNaN(Date.parse(quando))) return erro(400, "informe quando (instante em UTC, ISO 8601)");

  const cliente = db.prepare("SELECT id, nome, cpf FROM clientes WHERE id = ?").get(Number(cliente_id)) as Cliente | undefined;
  if (!cliente) return erro(404, "cliente não encontrado");

  const instante = new Date(quando).toISOString().replace(".000Z", "Z");
  const historico = db
    .prepare(
      `SELECT valor_centavos, categoria, cidade, criada_em
         FROM transacoes
        WHERE cliente_id = ? AND tipo IN ('debito', 'credito') AND criada_em < ?
        ORDER BY criada_em`,
    )
    .all(cliente.id, instante) as CompraAnterior[];

  const compra = { valor_centavos: valor_centavos!, categoria, cidade, quando: instante };
  const motivos: string[] = [];
  if (regraValorAlto(compra, historico)) motivos.push("valor_alto_categoria_nova");
  if (regraCidadeDistante(compra, historico)) motivos.push("cidade_distante");
  const retida = motivos.length > 0;

  registrar(
    `[antifraude] cliente ${cliente.id} — ${cliente.nome}, CPF ${cliente.cpf} — compra de ${valor_centavos} centavos em ${categoria} (${cidade}): ${retida ? `RETIDA (${motivos.join(", ")})` : "aprovada"}`,
  );
  return ok({ retida, motivos });
});
