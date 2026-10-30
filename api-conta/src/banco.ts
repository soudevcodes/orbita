// Conexão com o orbita.db (SQLite embutido no Node).
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const CAMINHO = process.env.ORBITA_DB ?? path.resolve(import.meta.dirname, "../../orbita.db");

export const db = new DatabaseSync(CAMINHO);
