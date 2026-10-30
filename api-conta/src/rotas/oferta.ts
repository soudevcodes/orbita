// Oferta do Primeiro Cartão — o que o app mostra em "Tem um cartão esperando por você".
//
// Protótipo: calcula aqui mesmo, com os dados da conta. Quando o motor-credito
// estiver pronto (T-010), a api-conta passa a perguntar para ele (ADR-005).
import { db } from "../banco.ts";
import { erro, ok, rota } from "../http.ts";
import { HOJE } from "../hoje.ts";
import { limiteInicial } from "../limite.ts";

type Cliente = { id: number; nascimento: string; conta_aberta_em: string };

/** Mês (AAAA-MM) de um instante UTC, no fuso de São Paulo (UTC−3) — ADR-003. */
function mesEmSaoPaulo(isoUtc: string): string {
  return new Date(Date.parse(isoUtc) - 3 * 3_600_000).toISOString().slice(0, 7);
}

/** Os 6 meses de calendário antes do mês de `hoje`, do mais antigo ao mais recente. */
function seisMesesFechados(hoje: string): string[] {
  const meses: string[] = [];
  let ano = Number(hoje.slice(0, 4));
  let mes = Number(hoje.slice(5, 7));
  for (let i = 0; i < 6; i++) {
    mes -= 1;
    if (mes === 0) {
      mes = 12;
      ano -= 1;
    }
    meses.unshift(`${ano}-${String(mes).padStart(2, "0")}`);
  }
  return meses;
}

function idadeEm(nascimento: string, hoje: string): number {
  const anos = Number(hoje.slice(0, 4)) - Number(nascimento.slice(0, 4));
  return hoje.slice(5) < nascimento.slice(5) ? anos - 1 : anos;
}

const diasEntre = (de: string, ate: string) => Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000);

rota("GET", "/clientes/:id/oferta", ({ params }) => {
  const id = Number(params.id);
  const cliente = db.prepare("SELECT id, nascimento, conta_aberta_em FROM clientes WHERE id = ?").get(id) as Cliente | undefined;
  if (!cliente) return erro(404, "cliente não encontrado");

  const meses = seisMesesFechados(HOJE);
  const porMes = new Map(meses.map((m) => [m, 0]));
  const entradas = db
    .prepare("SELECT valor_centavos, criada_em FROM transacoes WHERE cliente_id = ? AND tipo = 'pix_entrada'")
    .all(id) as { valor_centavos: number; criada_em: string }[];
  for (const t of entradas) {
    const mes = mesEmSaoPaulo(t.criada_em);
    if (porMes.has(mes)) porMes.set(mes, porMes.get(mes)! + t.valor_centavos);
  }
  const valores = [...porMes.values()];

  const elegivel =
    idadeEm(cliente.nascimento, HOJE) >= 18 &&
    diasEntre(cliente.conta_aberta_em, HOJE) >= 180 &&
    valores.filter((v) => v >= 30_000).length >= 4;

  return ok({
    cliente_id: id,
    elegivel,
    limite_centavos: limiteInicial(valores),
    entradas_por_mes: Object.fromEntries(porMes),
  });
});
