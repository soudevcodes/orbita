// Saldo — a primeira coisa que o cliente vê ao abrir o app.
import { erro, ok, rota } from "../http.ts";
import { saldoDoCliente } from "../saldo.ts";

rota("GET", "/clientes/:id/saldo", ({ params }) => {
  const id = Number(params.id);
  const saldo = saldoDoCliente(id);
  return saldo === null ? erro(404, "cliente não encontrado") : ok({ cliente_id: id, saldo_centavos: saldo });
});
