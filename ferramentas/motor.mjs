// Sobe o motor-credito com o Python que existir: `python3` (Mac/Linux) ou `python` (Windows).
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pasta = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "motor-credito");
const python = ["python3", "python", "py"].find((p) => spawnSync(p, ["--version"], { stdio: "ignore" }).status === 0);
if (!python) {
  console.error("Python não encontrado. Instale o Python 3.9 ou mais novo (python.org) e abra um terminal novo.");
  process.exit(1);
}
const filho = spawn(python, ["-m", "motor_credito"], { cwd: pasta, stdio: "inherit" });
filho.on("exit", (codigo) => process.exit(codigo ?? 0));
