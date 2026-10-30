// Coordenadas (latitude, longitude) das cidades onde a Órbita tem clientes.
// Usadas pela regra de "cidade distante" do antifraude (manual: "Antifraude").
export const COORDENADAS: Record<string, [number, number]> = {
  "São Paulo": [-23.5505, -46.6333],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Belo Horizonte": [-19.9167, -43.9345],
  Salvador: [-12.9714, -38.5014],
  Fortaleza: [-3.7319, -38.5267],
  Recife: [-8.0476, -34.877],
  Curitiba: [-25.4284, -49.2733],
  "Porto Alegre": [-30.0346, -51.2177],
  Manaus: [-3.119, -60.0217],
  Belém: [-1.4558, -48.4902],
  Goiânia: [-16.6869, -49.2648],
  Campinas: [-22.9099, -47.0626],
  Guarulhos: [-23.4538, -46.5333],
  "São Luís": [-2.5307, -44.3068],
  Natal: [-5.7945, -35.211],
};

/** Distância em linha reta (fórmula de haversine), em km. Cidade desconhecida → NaN. */
export function distanciaKm(a: string, b: string): number {
  const p = COORDENADAS[a];
  const q = COORDENADAS[b];
  if (!p || !q) return NaN;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(q[0] - p[0]);
  const dLon = rad(q[1] - p[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(p[0])) * Math.cos(rad(q[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
