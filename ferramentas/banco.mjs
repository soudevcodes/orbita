// Cria e lê o orbita.db (SQLite embutido no Node 22.13+, sem instalar nada).
import { gerarDados, impressaoDigital } from "./gerador.mjs";

// O SQLite do Node ainda avisa que é experimental a cada uso; o aviso só confunde quem está começando.
const emitir = process.emitWarning;
process.emitWarning = (w, ...rest) => (String(w).includes("SQLite") ? undefined : emitir.call(process, w, ...rest));
const { DatabaseSync } = await import("node:sqlite");

export const ESQUEMA = `
CREATE TABLE clientes (
  id              INTEGER PRIMARY KEY,
  nome            TEXT NOT NULL,
  apelido         TEXT,
  cpf             TEXT NOT NULL,
  nascimento      TEXT NOT NULL,   -- AAAA-MM-DD
  conta_aberta_em TEXT NOT NULL,   -- AAAA-MM-DD
  cidade          TEXT NOT NULL,
  perfil          TEXT NOT NULL,   -- assalariado | autonomo | estudante | aposentado | informal
  personagem      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE transacoes (
  id             INTEGER PRIMARY KEY,
  cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
  tipo           TEXT NOT NULL,    -- pix_entrada | pix_saida | debito | credito | pagamento_fatura | estorno
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  descricao      TEXT,
  categoria      TEXT,
  cidade         TEXT,
  criada_em      TEXT NOT NULL     -- instante em UTC, ISO 8601 ("2026-05-06T02:10:00Z") — ADR-003
);

CREATE INDEX transacoes_cliente ON transacoes (cliente_id, criada_em);
`;

export function abrirBanco(caminho) {
  return new DatabaseSync(caminho);
}

export function criarBanco(caminho, semente) {
  const dados = gerarDados(semente);
  const db = new DatabaseSync(caminho);
  db.exec(ESQUEMA);
  db.exec("BEGIN");
  const insC = db.prepare(
    "INSERT INTO clientes (id, nome, apelido, cpf, nascimento, conta_aberta_em, cidade, perfil, personagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const c of dados.clientes) insC.run(c.id, c.nome, c.apelido, c.cpf, c.nascimento, c.conta_aberta_em, c.cidade, c.perfil, c.personagem);
  const insT = db.prepare(
    "INSERT INTO transacoes (id, cliente_id, tipo, valor_centavos, descricao, categoria, cidade, criada_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const t of dados.transacoes) insT.run(t.id, t.cliente_id, t.tipo, t.valor_centavos, t.descricao, t.categoria, t.cidade, t.criada_em);
  db.exec("COMMIT");
  db.close();
  return { clientes: dados.clientes.length, transacoes: dados.transacoes.length, impressao: impressaoDigital(dados) };
}

/** Recalcula a impressão digital a partir do que está no banco (detecta banco editado ou de outra semente). */
export function impressaoDoBanco(caminho) {
  const db = new DatabaseSync(caminho, { readOnly: true });
  const clientes = db.prepare("SELECT id, cpf, conta_aberta_em FROM clientes ORDER BY id").all();
  const transacoes = db.prepare("SELECT id, cliente_id, valor_centavos, criada_em FROM transacoes ORDER BY id").all();
  db.close();
  return impressaoDigital({ clientes, transacoes });
}
