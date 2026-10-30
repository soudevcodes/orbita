// Log da api-conta: escreve no terminal e guarda as últimas linhas em memória
// para GET /logs — o que a ferramenta de monitoramento lê em produção.
// Lembrete: ADR-004. Tudo o que passa por aqui é lido por muita gente.

const LIMITE = 200;
const linhas: string[] = [];

export function registrar(linha: string) {
  const comHora = `${new Date().toISOString()} ${linha}`;
  console.log(comHora);
  linhas.push(comHora);
  if (linhas.length > LIMITE) linhas.shift();
}

export function ultimasLinhas(n: number): string[] {
  return linhas.slice(-Math.max(1, Math.min(n, LIMITE)));
}
