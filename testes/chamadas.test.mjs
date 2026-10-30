// A CLI chama o serviço certo (api-conta ou motor-credito) e sabe mandar pedidos simultâneos.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { executarChamada } from "../ferramentas/chamadas.mjs";

function servidorDeTeste(nome) {
  let pedidos = 0;
  const s = createServer((req, res) => {
    pedidos += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ servico: nome, caminho: req.url, pedido: pedidos }));
  });
  return new Promise((ok) => s.listen(0, "127.0.0.1", () => ok({ s, base: `http://127.0.0.1:${s.address().port}`, pedidos: () => pedidos })));
}

test("servico: api é o padrão, motor vai para o motor-credito", async () => {
  const api = await servidorDeTeste("api");
  const motor = await servidorDeTeste("motor");
  const bases = { api: api.base, motor: motor.base };
  try {
    const a = await executarChamada({ metodo: "GET", caminho: "/saude" }, bases);
    const m = await executarChamada({ metodo: "POST", caminho: "/elegibilidade", corpo: { x: 1 }, servico: "motor" }, bases);
    assert.equal(a.corpo.servico, "api");
    assert.equal(m.corpo.servico, "motor");
    assert.equal(m.corpo.caminho, "/elegibilidade");
  } finally {
    api.s.close();
    motor.s.close();
  }
});

test("simultaneas: N pedidos iguais ao mesmo tempo, todas as respostas voltam", async () => {
  const api = await servidorDeTeste("api");
  try {
    const r = await executarChamada({ metodo: "POST", caminho: "/pix", corpo: { a: 1 }, simultaneas: 2 }, { api: api.base });
    assert.equal(r.simultaneas.length, 2);
    assert.equal(api.pedidos(), 2);
    assert.equal(r.status, 200);
  } finally {
    api.s.close();
  }
});

test("serviço fora do ar vira status 0, não derruba a CLI", async () => {
  const r = await executarChamada({ metodo: "GET", caminho: "/saude", servico: "motor" }, { motor: "http://127.0.0.1:1" });
  assert.equal(r.status, 0);
});
