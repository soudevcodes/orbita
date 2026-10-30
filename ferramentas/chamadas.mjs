// As chamadas que o servidor do ViraDev pede para a CLI fazer nos SEUS serviços.
//
// Cada chamada: { metodo, caminho, corpo?, servico?, simultaneas? }
//   servico      "api" (padrão, a api-conta) ou "motor" (o motor-credito)
//   simultaneas  N > 1 manda N cópias do mesmo pedido ao mesmo tempo — é o que
//                acontece quando o app reenvia um pedido porque a rede caiu.

export const BASES_PADRAO = {
  api: process.env.ORBITA_API_LOCAL ?? "http://localhost:3333",
  motor: process.env.ORBITA_MOTOR_LOCAL ?? "http://localhost:3334",
};

async function umaVez(base, c) {
  try {
    const r = await fetch(`${base}${c.caminho}`, {
      method: c.metodo,
      headers: c.corpo ? { "Content-Type": "application/json" } : undefined,
      body: c.corpo ? JSON.stringify(c.corpo) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    return { status: r.status, corpo: await r.json().catch(() => null) };
  } catch (e) {
    return { status: 0, erro: String(e?.message ?? e) };
  }
}

/** Faz a chamada e devolve a resposta no formato que o servidor confere. */
export async function executarChamada(c, bases = BASES_PADRAO) {
  const base = bases[c.servico ?? "api"];
  if (!base) return { tipo: "http", status: 0, erro: `serviço desconhecido: ${c.servico}` };
  const n = Math.min(Math.max(Number(c.simultaneas) || 1, 1), 5);
  if (n === 1) return { tipo: "http", ...(await umaVez(base, c)) };
  const todas = await Promise.all(Array.from({ length: n }, () => umaVez(base, c)));
  return { tipo: "http", ...todas[0], simultaneas: todas };
}
