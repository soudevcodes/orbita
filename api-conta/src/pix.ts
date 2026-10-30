// Pix enviados. Em produção ficam no Postgres; no seu computador, em memória
// (reiniciou a api-conta, eles somem).

export type PixEnviado = {
  id: string;
  status: "enviado";
  cliente_id: number;
  valor_centavos: number;
  chave_destino: string;
  criado_em: string;
};

const enviados: PixEnviado[] = [];

export function registrarPix(cliente_id: number, valor_centavos: number, chave_destino: string, quando: string): PixEnviado {
  const pix: PixEnviado = {
    id: `pix-${String(enviados.length + 1).padStart(6, "0")}`,
    status: "enviado",
    cliente_id,
    valor_centavos,
    chave_destino,
    criado_em: quando,
  };
  enviados.push(pix);
  return pix;
}

export function totalEnviado(cliente_id: number): number {
  return enviados.filter((p) => p.cliente_id === cliente_id).reduce((s, p) => s + p.valor_centavos, 0);
}
