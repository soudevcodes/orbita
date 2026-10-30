// Os serviços sobem e as rotas existem. (Se a REGRA está certa é o que os tickets conferem.)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarBanco } from "../ferramentas/banco.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASTA = fs.mkdtempSync(path.join(os.tmpdir(), "orbita-teste-"));
const DB = path.join(PASTA, "orbita.db");
const PORTA_API = 3900 + Math.floor(Math.random() * 50);
const PORTA_MOTOR = 3960 + Math.floor(Math.random() * 30);
const API = `http://127.0.0.1:${PORTA_API}`;
const MOTOR = `http://127.0.0.1:${PORTA_MOTOR}`;
const processos = [];

function subir(cmd, args, cwd, env, marca) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    processos.push(p);
    const t = setTimeout(() => falha(new Error(`${cmd} não subiu`)), 8000);
    p.stdout.on("data", (d) => String(d).includes(marca) && (clearTimeout(t), ok()));
    p.on("exit", (c) => falha(new Error(`${cmd} saiu com ${c}`)));
  });
}

before(async () => {
  criarBanco(DB, 42);
  await subir(process.execPath, ["--experimental-strip-types", "--no-warnings", "api-conta/src/servidor.ts"], RAIZ, { ORBITA_DB: DB, PORTA: String(PORTA_API) }, "no ar");
  await subir("python3", ["-u", "-m", "motor_credito"], path.join(RAIZ, "motor-credito"), { PORTA: String(PORTA_MOTOR) }, "no ar");
});

after(() => {
  for (const p of processos) p.kill();
  fs.rmSync(PASTA, { recursive: true, force: true });
});

const pedir = async (base, metodo, caminho, corpo) => {
  const r = await fetch(`${base}${caminho}`, { method: metodo, headers: corpo ? { "Content-Type": "application/json" } : {}, body: corpo ? JSON.stringify(corpo) : undefined });
  return { status: r.status, corpo: await r.json().catch(() => null) };
};

test("api-conta e motor-credito respondem /saude", async () => {
  assert.equal((await pedir(API, "GET", "/saude")).corpo.ok, true);
  assert.equal((await pedir(MOTOR, "GET", "/saude")).corpo.ok, true);
});

test("rotas da temporada existem", async () => {
  const rotas = [
    ["GET", "/clientes/1/extrato?mes=2026-10"],
    ["POST", "/parcelamento", { valor_centavos: 10000, parcelas: 2 }],
    ["GET", "/fatura/vencimento?fechamento=2026-11-10"],
    ["GET", "/fatura/minimo?total_centavos=5000"],
    ["GET", "/clientes/3/oferta"],
  ];
  for (const [metodo, caminho, corpo] of rotas) {
    const r = await pedir(API, metodo, caminho, corpo);
    assert.notEqual(r.status, 404, `${metodo} ${caminho} não existe`);
  }
  const m = await pedir(MOTOR, "POST", "/elegibilidade", { cliente: { nascimento: "2000-01-01", conta_aberta_em: "2020-01-01", entradas_por_mes: {} }, hoje: "2026-10-30" });
  assert.notEqual(m.status, 404);
});
