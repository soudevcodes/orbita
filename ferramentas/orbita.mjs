#!/usr/bin/env node
// CLI da Órbita: liga o seu computador ao seu trabalho no ViraDev.
//
//   npx orbita login <código>     conecta este computador à sua conta
//   npx orbita setup              gera o seu orbita.db (dados só seus)
//   npx orbita doctor             confere se o ambiente está pronto
//   npx orbita sql <arquivo.sql>  roda uma consulta no orbita.db
//   npx orbita ticket <T-001>     mostra um ticket
//   npx orbita entregar <T-001>   entrega um ticket (respostas: --resposta, --linha, --texto)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANCO = path.join(RAIZ, "orbita.db");
const ESTADO = path.join(RAIZ, ".orbita-estado.json");
const CONFIG = path.join(os.homedir(), ".orbita", "config.json");
const API = process.env.ORBITA_API ?? "https://evqfljudxatvhyxfiood.supabase.co/functions/v1/orbita";
const API_LOCAL = process.env.ORBITA_API_LOCAL ?? "http://localhost:3333";

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const vermelho = (s) => `\x1b[31m${s}\x1b[0m`;
const cinza = (s) => `\x1b[90m${s}\x1b[0m`;
const negrito = (s) => `\x1b[1m${s}\x1b[0m`;

function lerJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function args(lista) {
  const out = { _: [] };
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = lista[i + 1] && !lista[i + 1].startsWith("--") ? lista[++i] : true;
      out[k] = v;
    } else out._.push(a);
  }
  return out;
}

async function chamarServidor(acao, corpo = {}) {
  const config = lerJson(CONFIG);
  if (!config?.token) {
    console.error(vermelho("Este computador ainda não está conectado à sua conta."));
    console.error(`Abra a sua mesa na Órbita no ViraDev, copie o código e rode: ${negrito("npx orbita login <código>")}`);
    process.exit(1);
  }
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-orbita-token": config.token },
    body: JSON.stringify({ acao, ...corpo }),
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(vermelho(dados.erro ?? `O servidor respondeu ${res.status}.`));
    process.exit(1);
  }
  return dados;
}

// --- comandos ---------------------------------------------------------------

async function login(a) {
  const token = a._[1];
  if (!token) return console.error("Use: npx orbita login <código que aparece na sua mesa no ViraDev>");
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  fs.writeFileSync(CONFIG, JSON.stringify({ token }, null, 2), { mode: 0o600 });
  const eu = await chamarServidor("quem_sou");
  console.log(verde(`Conectado. Bem-vindo(a) ao squad Cartão, ${eu.nome}.`));
  console.log(`Próximo passo: ${negrito("npm run setup")}`);
}

async function setup(a) {
  const { criarBanco } = await import("./banco.mjs");
  let semente = a.semente ? Number(a.semente) : null;
  if (semente === null) semente = (await chamarServidor("contratacao")).semente;
  if (fs.existsSync(BANCO)) {
    if (!a.refazer) {
      console.log(`O ${negrito("orbita.db")} já existe. Para recriar do zero: ${negrito("npm run setup -- --refazer")}`);
      return;
    }
    fs.rmSync(BANCO);
  }
  const r = criarBanco(BANCO, semente);
  fs.writeFileSync(ESTADO, JSON.stringify({ semente, impressao: r.impressao }, null, 2));
  console.log(verde(`orbita.db criado: ${r.clientes} clientes, ${r.transacoes} transações.`));
  console.log(cinza(`impressão digital ${r.impressao}`));
  console.log(`Agora suba a API: ${negrito("npm run api")} (em outro terminal), depois ${negrito("npx orbita doctor")}.`);
}

function versao(cmd, arg = "--version") {
  const r = spawnSync(cmd, [arg], { encoding: "utf8" });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || r.stderr).trim();
}

async function diagnostico() {
  const itens = [];
  const node = process.versions.node.split(".").map(Number);
  itens.push({ id: "node", ok: node[0] > 22 || (node[0] === 22 && node[1] >= 13), detalhe: `Node ${process.versions.node} (precisa 22.13 ou mais novo)` });
  const py = versao("python3") ?? versao("python");
  const pyNums = py?.match(/(\d+)\.(\d+)/);
  itens.push({ id: "python", ok: !!pyNums && (+pyNums[1] > 3 || (+pyNums[1] === 3 && +pyNums[2] >= 9)), detalhe: py ?? "Python não encontrado (precisa 3.9 ou mais novo)" });

  const estado = lerJson(ESTADO);
  let impressao = null;
  if (fs.existsSync(BANCO)) {
    const { impressaoDoBanco } = await import("./banco.mjs");
    impressao = impressaoDoBanco(BANCO);
  }
  itens.push({
    id: "banco",
    ok: !!impressao && impressao === estado?.impressao,
    detalhe: !impressao ? "orbita.db não existe — rode npm run setup" : impressao === estado?.impressao ? `orbita.db ok (${impressao})` : "orbita.db foi alterado — recrie com npm run setup -- --refazer",
  });

  let api = null;
  try {
    const r = await fetch(`${API_LOCAL}/saude`, { signal: AbortSignal.timeout(3000) });
    api = r.ok ? await r.json() : null;
  } catch {
    /* fora do ar */
  }
  itens.push({ id: "api", ok: !!api?.ok, detalhe: api?.ok ? `api-conta respondendo em ${API_LOCAL}` : `api-conta não responde em ${API_LOCAL} — rode npm run api` });

  return { itens, impressao, semente: estado?.semente ?? null };
}

async function doctor() {
  const d = await diagnostico();
  for (const i of d.itens) console.log(`${i.ok ? verde("✔") : vermelho("✘")} ${i.detalhe}`);
  const tudo = d.itens.every((i) => i.ok);
  console.log(tudo ? verde("\nAmbiente pronto. Entregue o T-001 com: npx orbita entregar T-001") : "\nCorrija os itens marcados com ✘ e rode de novo.");
  return d;
}

async function sql(a) {
  const arquivo = a._[1];
  if (!arquivo) return console.error("Use: npx orbita sql dados/minha-consulta.sql");
  const { abrirBanco } = await import("./banco.mjs");
  const db = abrirBanco(BANCO);
  const linhas = db.prepare(fs.readFileSync(path.resolve(arquivo), "utf8")).all();
  db.close();
  if (!linhas.length) return console.log(cinza("(nenhuma linha)"));
  console.table(linhas.slice(0, 50).map((l) => ({ ...l })));
  if (linhas.length > 50) console.log(cinza(`… e mais ${linhas.length - 50} linhas`));
}

async function ticket(a) {
  const id = a._[1];
  if (!id) return console.error("Use: npx orbita ticket T-001");
  const t = await chamarServidor("ticket", { ticket: id });
  console.log(`\n${negrito(`${t.id} — ${t.titulo}`)}\n${cinza(`pedido por ${t.pedido_por}`)}\n\n${t.texto}\n`);
}

/**
 * Entrega. O servidor decide o que precisa: às vezes só a resposta digitada;
 * nos tickets de [saída], ele manda chamadas para fazer na SUA api-conta, com
 * entradas geradas só para você, e confere as respostas.
 */
async function entregar(a) {
  const id = a._[1];
  if (!id) return console.error("Use: npx orbita entregar T-001");
  const inicio = await chamarServidor("entrega_iniciar", {
    ticket: id,
    resposta: a.resposta ?? null,
    linha: a.linha ?? null,
    texto: a.texto ?? null,
  });

  const respostas = [];
  if (inicio.precisa_diagnostico) {
    const d = await diagnostico();
    respostas.push({ tipo: "diagnostico", itens: d.itens, impressao: d.impressao, semente: d.semente });
  }
  for (const c of inicio.chamadas ?? []) {
    try {
      const r = await fetch(`${API_LOCAL}${c.caminho}`, {
        method: c.metodo,
        headers: c.corpo ? { "Content-Type": "application/json" } : undefined,
        body: c.corpo ? JSON.stringify(c.corpo) : undefined,
        signal: AbortSignal.timeout(5000),
      });
      respostas.push({ tipo: "http", status: r.status, corpo: await r.json().catch(() => null) });
    } catch (e) {
      respostas.push({ tipo: "http", status: 0, erro: String(e?.message ?? e) });
    }
  }

  const v = await chamarServidor("entrega_concluir", { entrega_id: inicio.entrega_id, respostas });
  console.log(v.aprovado ? verde(`\n✔ ${v.mensagem}`) : vermelho(`\n✘ ${v.mensagem}`));
  for (const d of v.detalhes ?? []) console.log(`  ${d}`);
  if (v.de) console.log(cinza(`\n— ${v.de}`));
}

const a = args(process.argv.slice(2));
const comandos = { login, setup, doctor, sql, ticket, entregar };
const cmd = comandos[a._[0]];
if (!cmd) {
  console.log(`${negrito("orbita")} — sua mesa de trabalho na Órbita\n
  npx orbita login <código>     conecta este computador à sua conta
  npx orbita setup              gera o seu orbita.db
  npx orbita doctor             confere o ambiente
  npx orbita sql <arquivo>      roda uma consulta no orbita.db
  npx orbita ticket <id>        mostra um ticket
  npx orbita entregar <id>      entrega um ticket (--resposta, --linha, --texto)`);
} else {
  await cmd(a);
}
