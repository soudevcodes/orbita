// Conexão com o orbita.db (SQLite embutido no Node) — com a proteção do banco.
//
// Em produção, o proxy do banco derruba a requisição que faz consultas demais
// (manual: "Proteção do banco"). Aqui é igual: cada requisição conta as suas
// consultas, e a que passar de LIMITE_CONSULTAS recebe um erro.
// Não aumente o limite para "resolver" um incidente: ele protege todo mundo.
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { DatabaseSync } from "node:sqlite";

const CAMINHO = process.env.ORBITA_DB ?? path.resolve(import.meta.dirname, "../../orbita.db");
const real = new DatabaseSync(CAMINHO);

export const LIMITE_CONSULTAS = 80;

type Contagem = { consultas: number };
const contexto = new AsyncLocalStorage<Contagem>();

/** Roda `fn` contando as consultas ao banco que ela faz (inclusive depois de `await`). */
export function comContagem<T>(contagem: Contagem, fn: () => T): T {
  return contexto.run(contagem, fn);
}

function contar() {
  const c = contexto.getStore();
  if (!c) return;
  c.consultas += 1;
  if (c.consultas > LIMITE_CONSULTAS) {
    throw new Error(`proteção do banco: a requisição passou de ${LIMITE_CONSULTAS} consultas e foi derrubada`);
  }
}

export const db = {
  prepare(sql: string) {
    const st = real.prepare(sql);
    return {
      get: (...p: any[]) => (contar(), st.get(...p)),
      all: (...p: any[]) => (contar(), st.all(...p)),
      run: (...p: any[]) => (contar(), st.run(...p)),
    };
  },
};
