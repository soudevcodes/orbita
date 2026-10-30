// Regras da fatura do Primeiro Cartão (manual: "Fatura", "Parcelamento", "Pagamento mínimo").
import { erro, ok, rota } from "../http.ts";
import { calcularParcelas } from "../parcelamento.ts";
import { somarDias } from "../datas.ts";

rota("POST", "/parcelamento", ({ corpo }) => {
  const { valor_centavos, parcelas } = (corpo ?? {}) as { valor_centavos?: number; parcelas?: number };
  try {
    return ok({ parcelas: calcularParcelas(Number(valor_centavos), Number(parcelas)) });
  } catch (e) {
    return erro(400, (e as Error).message);
  }
});

// Vencimento da fatura a partir da data de fechamento.
rota("GET", "/fatura/vencimento", ({ query }) => {
  const fechamento = query.get("fechamento"); // AAAA-MM-DD
  if (!fechamento || !/^\d{4}-\d{2}-\d{2}$/.test(fechamento)) return erro(400, "informe ?fechamento=AAAA-MM-DD");
  return ok({ fechamento, vencimento: somarDias(fechamento, 7) });
});

// Pagamento mínimo da fatura.
rota("GET", "/fatura/minimo", ({ query }) => {
  const total = Number(query.get("total_centavos"));
  if (!Number.isInteger(total) || total < 0) return erro(400, "informe ?total_centavos=");
  const minimo = Math.round(total * 0.15);
  return ok({ total_centavos: total, minimo_centavos: minimo });
});
