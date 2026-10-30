// Mini roteador HTTP: o bastante para a API do squad, sem framework.
import type { IncomingMessage, ServerResponse } from "node:http";
import { comContagem } from "./banco.ts";
import { registrar } from "./log.ts";

export type Requisicao = {
  metodo: string;
  caminho: string;
  params: Record<string, string>;
  query: URLSearchParams;
  corpo: unknown;
};
export type Resposta = { status: number; corpo: unknown };
export type Manipulador = (req: Requisicao) => Resposta | Promise<Resposta>;

type Rota = { metodo: string; padrao: RegExp; nomes: string[]; fn: Manipulador };
const rotas: Rota[] = [];

export function rota(metodo: string, caminho: string, fn: Manipulador) {
  const nomes: string[] = [];
  const padrao = new RegExp(
    "^" + caminho.replace(/:([a-z_]+)/g, (_, n) => (nomes.push(n), "([^/]+)")) + "$",
  );
  rotas.push({ metodo, padrao, nomes, fn });
}

export const ok = (corpo: unknown): Resposta => ({ status: 200, corpo });
export const erro = (status: number, mensagem: string): Resposta => ({ status, corpo: { erro: mensagem } });

async function lerCorpo(req: IncomingMessage): Promise<unknown> {
  const partes: Buffer[] = [];
  for await (const p of req) partes.push(p as Buffer);
  if (!partes.length) return null;
  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch {
    return null;
  }
}

/** A última requisição atendida (menos /saude) e quantas consultas ao banco ela fez. */
export let ultimaRequisicao: { caminho: string; consultas: number } | null = null;

export async function atender(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const metodo = req.method ?? "GET";
  let resposta: Resposta = erro(404, "rota não encontrada");
  for (const r of rotas) {
    if (r.metodo !== metodo) continue;
    const m = url.pathname.match(r.padrao);
    if (!m) continue;
    const params = Object.fromEntries(r.nomes.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
    const contagem = { consultas: 0 };
    try {
      const corpo = await lerCorpo(req);
      resposta = await comContagem(contagem, () => r.fn({ metodo, caminho: url.pathname, params, query: url.searchParams, corpo }));
    } catch (e) {
      console.error(`[api-conta] erro em ${metodo} ${url.pathname}:`, e);
      registrar(`[api-conta] erro em ${metodo} ${url.pathname}: ${(e as Error).message} (${contagem.consultas} consultas)`);
      resposta = erro(500, "erro interno");
    }
    if (url.pathname !== "/saude") ultimaRequisicao = { caminho: `${metodo} ${url.pathname}`, consultas: contagem.consultas };
    break;
  }
  res.writeHead(resposta.status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(resposta.corpo));
}
