// Extrato do mês, agrupado por dia — a tela "Extrato" do app.
import { db } from "../banco.ts";
import { erro, ok, rota } from "../http.ts";

const ENTRADAS = new Set(["pix_entrada", "estorno"]);

type Transacao = {
  id: number;
  tipo: string;
  valor_centavos: number;
  descricao: string | null;
  criada_em: string; // UTC, ISO 8601
};

rota("GET", "/clientes/:id/extrato", ({ params, query }) => {
  const mes = query.get("mes"); // AAAA-MM
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) return erro(400, "informe ?mes=AAAA-MM");

  const transacoes = db
    .prepare(
      `SELECT id, tipo, valor_centavos, descricao, criada_em
         FROM transacoes
        WHERE cliente_id = ? AND criada_em LIKE ?
        ORDER BY criada_em`,
    )
    .all(Number(params.id), `${mes}%`) as Transacao[];

  const porDia = new Map<string, { data: string; entradas_centavos: number; saidas_centavos: number; transacoes: unknown[] }>();
  for (const t of transacoes) {
    const data = t.criada_em.slice(0, 10);
    const hora = t.criada_em.slice(11, 16);
    if (!porDia.has(data)) porDia.set(data, { data, entradas_centavos: 0, saidas_centavos: 0, transacoes: [] });
    const dia = porDia.get(data)!;
    if (ENTRADAS.has(t.tipo)) dia.entradas_centavos += t.valor_centavos;
    else dia.saidas_centavos += t.valor_centavos;
    dia.transacoes.push({ id: t.id, tipo: t.tipo, valor_centavos: t.valor_centavos, descricao: t.descricao, hora });
  }

  const dias = [...porDia.values()];
  return ok({
    cliente_id: Number(params.id),
    mes,
    total_entradas_centavos: dias.reduce((s, d) => s + d.entradas_centavos, 0),
    total_saidas_centavos: dias.reduce((s, d) => s + d.saidas_centavos, 0),
    dias,
  });
});
