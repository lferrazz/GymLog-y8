export type Treino = {
  id: string
  nome: string
  tipo_treino: string
  data_treino: string // ISO datetime
  duracao_min: number
  observacoes: string | null
}

export const TIPOS_TREINO = [
  "Corrida",
  "Musculação",
  "Ciclismo",
  "Natação",
  "Funcional",
  "Yoga",
] as const

// Usuário de exemplo fixo (protótipo — sem autenticação real)
export const USUARIO_DEMO = {
  nome: "Ana Martins",
  email: "ana@exemplo.com",
  senha: "treino123",
}

// Dados de exemplo fixos, inventados
export const TREINOS_SEED: Treino[] = [
  {
    id: "t1",
    nome: "Longão de domingo",
    tipo_treino: "Corrida",
    data_treino: "2026-08-02T07:30:00",
    duracao_min: 78,
    observacoes: "12 km em ritmo leve. Perna respondeu bem, sem dores.",
  },
  {
    id: "t2",
    nome: "Superiores — puxada",
    tipo_treino: "Musculação",
    data_treino: "2026-08-01T18:00:00",
    duracao_min: 55,
    observacoes: "Aumentei a carga na remada. Foco em costas e bíceps.",
  },
  {
    id: "t3",
    nome: "Pedal no parque",
    tipo_treino: "Ciclismo",
    data_treino: "2026-07-30T06:45:00",
    duracao_min: 95,
    observacoes: null,
  },
  {
    id: "t4",
    nome: "Intervalado na piscina",
    tipo_treino: "Natação",
    data_treino: "2026-07-28T20:15:00",
    duracao_min: 40,
    observacoes: "8x50m forte com descanso curto.",
  },
  {
    id: "t5",
    nome: "Mobilidade e alongamento",
    tipo_treino: "Yoga",
    data_treino: "2026-07-27T08:00:00",
    duracao_min: 30,
    observacoes: "Recuperação ativa.",
  },
]

export const PERIODOS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "7", rotulo: "Últimos 7 dias" },
  { valor: "30", rotulo: "Últimos 30 dias" },
] as const

export function formatarData(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatarDuracao(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export function iconePorTipo(tipo: string): string {
  return tipo // usado como chave; ícone resolvido no componente
}
