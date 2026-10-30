// Simulação de encargos do rotativo e do atraso (manual: "Rotativo e atraso").
import { erro, ok, rota } from "../http.ts";

type Pedido = { divida_centavos?: number; dias?: number; em_atraso?: boolean };

rota("POST", "/rotativo/simular", ({ corpo }) => {
  const { divida_centavos: divida, dias, em_atraso } = (corpo ?? {}) as Pedido;
  if (!Number.isInteger(divida) || divida! <= 0) return erro(400, "divida_centavos inválida");
  if (!Number.isInteger(dias) || dias! < 0) return erro(400, "dias inválido");

  // juros do rotativo: 8% ao mês, por dia corrido (juros simples sobre a dívida original)
  let juros = Math.floor((divida! * 8 * dias!) / 3000);
  // teto legal: nunca mais que 100% da dívida
  juros = Math.min(juros, divida!);

  const multa = em_atraso ? Math.floor((divida! * 2) / 100) : 0;
  const mora = em_atraso ? Math.floor((divida! * dias!) / 3000) : 0;
  const encargos = juros + multa + mora;

  return ok({
    divida_centavos: divida,
    juros_centavos: juros,
    multa_centavos: multa,
    mora_centavos: mora,
    encargos_centavos: encargos,
    total_centavos: divida! + encargos,
  });
});
