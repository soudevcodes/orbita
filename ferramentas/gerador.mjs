// Gerador dos dados de exemplo da Órbita.
//
// Cada pessoa recebe uma SEMENTE e, a partir dela, um banco só dela: os
// clientes-personagem do manual (Dona Cida, Wesley, Priscila…) são sempre os
// mesmos; os outros clientes e as transações mudam de pessoa para pessoa.
// Por isso a resposta de um ticket de uma pessoa não serve para outra.
//
// IMPORTANTE: este arquivo precisa ser determinístico e rodar igual no Node
// (CLI) e no Deno (servidor que confere as entregas). Nada de Date.now(),
// Math.random(), fuso local ou Intl aqui.

/** "Hoje" na Órbita: o dia em que a temporada acontece. Sexta-feira. */
export const DATA_REFERENCIA = "2026-10-30";
/** Primeiro mês com transações nos dados de exemplo. */
export const INICIO_DADOS = "2026-03-01";
/** Clientes inventados além dos personagens. */
export const CLIENTES_ALEATORIOS = 400;
/** Versão do formato dos dados: mudou o gerador, sobe a versão. */
export const VERSAO_DADOS = 1;

// --- números pseudoaleatórios reprodutíveis (mulberry32) --------------------

export function criarSorteio(semente) {
  let a = semente >>> 0;
  const proximo = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    numero: proximo,
    inteiro: (min, max) => min + Math.floor(proximo() * (max - min + 1)),
    escolha: (lista) => lista[Math.floor(proximo() * lista.length)],
    chance: (p) => proximo() < p,
  };
}

// --- datas sem fuso (tudo em UTC; São Paulo = UTC−3, sem horário de verão) ---

const DIA_MS = 86_400_000;
const paraDia = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const isoDia = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Horário local de São Paulo → instante UTC em ISO ("2026-05-05T23:10:00Z" vira "2026-05-06T02:10:00Z"). */
export function localSPparaUTC(dia, hora, minuto) {
  const ms = paraDia(dia) + (hora + 3) * 3_600_000 + minuto * 60_000;
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

function mesesEntre(inicioIso, fimIso) {
  const out = [];
  let ano = +inicioIso.slice(0, 4);
  let mes = +inicioIso.slice(5, 7);
  const fimAno = +fimIso.slice(0, 4);
  const fimMes = +fimIso.slice(5, 7);
  while (ano < fimAno || (ano === fimAno && mes <= fimMes)) {
    out.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return out;
}

const diasNoMes = (mes) => new Date(Date.UTC(+mes.slice(0, 4), +mes.slice(5, 7), 0)).getUTCDate();

// --- vocabulário -----------------------------------------------------------

const NOMES = ["Ana", "Bruno", "Carla", "Daniel", "Elaine", "Felipe", "Gabriela", "Hugo", "Isabela", "João", "Kátia", "Leandro", "Mariana", "Nicolas", "Olívia", "Pedro", "Quésia", "Rafael", "Sabrina", "Thiago", "Ursula", "Vinícius", "Wanda", "Yasmin", "Zeca", "Adriana", "Beatriz", "Caio", "Débora", "Everton", "Fabiana", "Gustavo", "Heloísa", "Igor", "Jéssica", "Luan", "Mônica", "Natália", "Otávio", "Patrícia"];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas"];
export const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Fortaleza", "Recife", "Curitiba", "Porto Alegre", "Manaus", "Belém", "Goiânia", "Campinas", "Guarulhos", "São Luís", "Natal"];
const CATEGORIAS = [
  ["mercado", 1500, 25000],
  ["farmacia", 800, 9000],
  ["transporte", 400, 6000],
  ["restaurante", 1200, 12000],
  ["contas", 4000, 30000],
  ["vestuario", 3000, 25000],
  ["eletronicos", 8000, 120000],
  ["lazer", 1500, 15000],
];
const PERFIS = ["assalariado", "autonomo", "estudante", "aposentado", "informal"];

function cpfFicticio(s) {
  const d = Array.from({ length: 9 }, () => s.inteiro(0, 9));
  for (const peso of [10, 11]) {
    const soma = d.reduce((acc, n, i) => acc + n * (peso - i), 0);
    const r = (soma * 10) % 11;
    d.push(r === 10 ? 0 : r);
  }
  const t = d.join("");
  return `${t.slice(0, 3)}.${t.slice(3, 6)}.${t.slice(6, 9)}-${t.slice(9)}`;
}

// --- personagens do manual (iguais para todo mundo) ------------------------
//
// As entradas são por mês, de mar/2026 a out/2026. 0 = mês sem entrada.

const PERSONAGENS = [
  {
    nome: "Aparecida dos Santos", apelido: "Dona Cida", perfil: "assalariado", cidade: "São Paulo",
    nascimento: "1968-03-14", conta_aberta_em: "2022-02-10", dia_entrada: 5,
    entradas: [210000, 210000, 210000, 210000, 210000, 210000, 210000, 210000],
  },
  {
    nome: "Wesley Ferreira", apelido: "Wesley", perfil: "informal", cidade: "Guarulhos",
    nascimento: "1997-09-02", conta_aberta_em: "2023-06-21", dia_entrada: null,
    entradas: [260000, 180000, 0, 240000, 310000, 120000, 280000, 150000],
  },
  {
    nome: "Priscila Andrade", apelido: "Priscila", perfil: "estudante", cidade: "Campinas",
    nascimento: "2004-01-27", conta_aberta_em: "2024-08-03", dia_entrada: 10,
    // abr–set: 2000, 2000, 1800, 0, 2200, 2000 → limite R$ 450 (exemplo do manual)
    entradas: [150000, 200000, 200000, 180000, 0, 220000, 200000, 190000],
  },
  {
    nome: "Jorge Batista", apelido: "Seu Jorge", perfil: "aposentado", cidade: "Recife",
    nascimento: "1955-11-30", conta_aberta_em: "2026-08-01", dia_entrada: 25,
    entradas: [0, 0, 0, 0, 0, 180000, 180000, 0],
  },
  {
    nome: "Kaique Lopes", apelido: "Kaique", perfil: "estudante", cidade: "Salvador",
    nascimento: "2009-12-01", conta_aberta_em: "2025-01-15", dia_entrada: 1,
    entradas: [60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000],
  },
  {
    nome: "Marta Ribeiro", apelido: "Marta", perfil: "autonomo", cidade: "Belo Horizonte",
    nascimento: "1985-06-18", conta_aberta_em: "2023-03-09", dia_entrada: null,
    // abr–set com ≥ R$ 300 em só 3 meses: hoje não é elegível; com a regra "3 de 6", seria
    entradas: [90000, 0, 45000, 35000, 0, 380000, 25000, 70000],
  },
];

/**
 * Gera clientes e transações para a semente.
 * @returns {{ clientes: object[], transacoes: object[] }}
 */
export function gerarDados(semente) {
  const s = criarSorteio(semente);
  const meses = mesesEntre(INICIO_DADOS, DATA_REFERENCIA);
  const ultimoDia = DATA_REFERENCIA;
  const clientes = [];
  const transacoes = [];
  let proxTx = 1;

  const addTx = (cliente_id, tipo, valor, criada_em, extra = {}) => {
    transacoes.push({
      id: proxTx++,
      cliente_id,
      tipo,
      valor_centavos: valor,
      descricao: extra.descricao ?? null,
      categoria: extra.categoria ?? null,
      cidade: extra.cidade ?? null,
      criada_em,
    });
  };

  const gastosDoMes = (c, mes, orcamento) => {
    const nDias = diasNoMes(mes);
    let gasto = 0;
    const qtd = s.inteiro(4, 14);
    for (let i = 0; i < qtd && gasto < orcamento; i++) {
      const [cat, min, max] = s.escolha(CATEGORIAS);
      const valor = Math.min(s.inteiro(min, max), orcamento - gasto);
      if (valor < 100) break;
      const dia = `${mes}-${String(s.inteiro(1, nDias)).padStart(2, "0")}`;
      if (dia > ultimoDia || dia < c.conta_aberta_em) continue;
      // ~25% das compras à noite (20h–23h59 em São Paulo) — já é "amanhã" em UTC
      const noite = s.chance(0.25);
      const hora = noite ? s.inteiro(20, 23) : s.inteiro(7, 19);
      const quando = localSPparaUTC(dia, hora, s.inteiro(0, 59));
      const pix = s.chance(0.2);
      addTx(c.id, pix ? "pix_saida" : "debito", valor, quando, {
        categoria: pix ? null : cat,
        descricao: pix ? "Pix enviado" : `Compra ${cat}`,
        cidade: pix ? null : c.cidade,
      });
      gasto += valor;
    }
  };

  const entradaNoMes = (c, mes, total, diaFixo) => {
    if (total <= 0) return;
    const nDias = diasNoMes(mes);
    const partes = diaFixo ? 1 : s.inteiro(2, 6);
    let resto = total;
    for (let p = 0; p < partes; p++) {
      const valor = p === partes - 1 ? resto : Math.floor(total / partes);
      resto -= valor;
      const d = diaFixo ?? s.inteiro(1, nDias);
      const dia = `${mes}-${String(Math.min(d, nDias)).padStart(2, "0")}`;
      if (dia > ultimoDia || dia < c.conta_aberta_em) continue;
      addTx(c.id, "pix_entrada", valor, localSPparaUTC(dia, s.inteiro(6, 21), s.inteiro(0, 59)), {
        descricao: diaFixo ? "Salário / benefício" : "Pix recebido",
      });
    }
  };

  // Personagens: ids 1..6, iguais em todo banco.
  for (const p of PERSONAGENS) {
    const c = {
      id: clientes.length + 1,
      nome: p.nome,
      apelido: p.apelido,
      cpf: cpfFicticio(criarSorteio(1000 + clientes.length)),
      nascimento: p.nascimento,
      conta_aberta_em: p.conta_aberta_em,
      cidade: p.cidade,
      perfil: p.perfil,
      personagem: 1,
    };
    clientes.push(c);
    meses.forEach((mes, i) => {
      entradaNoMes(c, mes, p.entradas[i] ?? 0, p.dia_entrada);
      gastosDoMes(c, mes, Math.floor((p.entradas[i] ?? 0) * 0.8));
    });
  }

  // Clientes inventados: mudam com a semente.
  for (let n = 0; n < CLIENTES_ALEATORIOS; n++) {
    const perfil = s.escolha(PERFIS);
    const idade = perfil === "estudante" ? s.inteiro(16, 26) : perfil === "aposentado" ? s.inteiro(60, 82) : s.inteiro(19, 59);
    const nascimento = `${2026 - idade}-${String(s.inteiro(1, 12)).padStart(2, "0")}-${String(s.inteiro(1, 28)).padStart(2, "0")}`;
    const abertura = isoDia(paraDia("2021-03-01") + s.inteiro(0, paraDia("2026-10-01") / DIA_MS - paraDia("2021-03-01") / DIA_MS) * DIA_MS);
    const c = {
      id: clientes.length + 1,
      nome: `${s.escolha(NOMES)} ${s.escolha(SOBRENOMES)}`,
      apelido: null,
      cpf: cpfFicticio(s),
      nascimento,
      conta_aberta_em: abertura,
      cidade: s.escolha(CIDADES),
      perfil,
      personagem: 0,
    };
    clientes.push(c);
    const base = {
      assalariado: s.inteiro(140000, 650000),
      autonomo: s.inteiro(80000, 900000),
      estudante: s.inteiro(20000, 150000),
      aposentado: s.inteiro(141200, 400000),
      informal: s.inteiro(40000, 300000),
    }[perfil];
    const regular = perfil === "assalariado" || perfil === "aposentado";
    const diaFixo = regular ? s.inteiro(1, 28) : null;
    for (const mes of meses) {
      const recebe = regular ? s.chance(0.95) : s.chance(perfil === "estudante" ? 0.7 : 0.8);
      const total = recebe ? Math.max(0, base + (regular ? 0 : s.inteiro(-base / 2, base / 2))) : 0;
      entradaNoMes(c, mes, Math.floor(total), diaFixo);
      gastosDoMes(c, mes, Math.floor(total * (0.5 + s.numero() * 0.45)));
    }
  }

  return { clientes, transacoes };
}

/**
 * Impressão digital dos dados: confere que o banco local foi gerado com a
 * semente certa e a mesma versão do gerador que o servidor usa.
 */
export function impressaoDigital(dados) {
  let h = 2166136261 >>> 0;
  const mistura = (str) => {
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
  };
  for (const c of dados.clientes) mistura(`${c.id}|${c.cpf}|${c.conta_aberta_em};`);
  for (const t of dados.transacoes) mistura(`${t.id}|${t.cliente_id}|${t.valor_centavos}|${t.criada_em};`);
  return `v${VERSAO_DADOS}-${h.toString(16).padStart(8, "0")}`;
}
