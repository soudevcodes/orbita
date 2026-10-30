import { db } from "../banco.ts";
import { erro, ok, rota } from "../http.ts";

rota("GET", "/clientes/:id", ({ params }) => {
  const cliente = db.prepare("SELECT id, nome, apelido, cidade, perfil, conta_aberta_em FROM clientes WHERE id = ?").get(Number(params.id));
  return cliente ? ok(cliente) : erro(404, "cliente não encontrado");
});
