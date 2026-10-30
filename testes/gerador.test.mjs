// O gerador precisa ser idêntico aqui e no servidor que confere as entregas.
// Se esta impressão digital mudar, suba VERSAO_DADOS e atualize o servidor junto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gerarDados, impressaoDigital, localSPparaUTC } from "../ferramentas/gerador.mjs";

test("mesma semente, mesmos dados", () => {
  assert.equal(impressaoDigital(gerarDados(42)), impressaoDigital(gerarDados(42)));
});

test("sementes diferentes, dados diferentes", () => {
  assert.notEqual(impressaoDigital(gerarDados(42)), impressaoDigital(gerarDados(43)));
});

test("impressão digital de referência da semente 42 (contrato com o servidor)", () => {
  assert.equal(impressaoDigital(gerarDados(42)), "v2-41125358");
});

test("personagens são iguais em qualquer semente", () => {
  const a = gerarDados(1).clientes.slice(0, 6);
  const b = gerarDados(999).clientes.slice(0, 6);
  assert.deepEqual(a, b);
});

test("22h10 em São Paulo é 01h10 do dia seguinte em UTC", () => {
  assert.equal(localSPparaUTC("2026-05-13", 22, 10), "2026-05-14T01:10:00Z");
});

test("todo valor é inteiro e positivo (ADR-001)", () => {
  for (const t of gerarDados(7).transacoes) assert.ok(Number.isInteger(t.valor_centavos) && t.valor_centavos > 0);
});
