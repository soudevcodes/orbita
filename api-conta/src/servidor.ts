// api-conta — contas, transações, Pix e cartão da Órbita.
import { createServer } from "node:http";
import { atender, ok, rota } from "./http.ts";
import "./rotas/clientes.ts";
import "./rotas/extrato.ts";
import "./rotas/fatura.ts";
import "./rotas/oferta.ts";
import "./rotas/compras.ts";
import "./rotas/logs.ts";

const PORTA = Number(process.env.PORTA ?? 3333);

rota("GET", "/saude", () => ok({ ok: true, servico: "api-conta", versao: "temporada-1/semana-4" }));

createServer(atender).listen(PORTA, () => {
  console.log(`api-conta no ar em http://localhost:${PORTA}`);
});
