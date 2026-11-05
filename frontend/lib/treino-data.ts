export type { Treino } from "@/lib/models/treino"

export const TIPOS_TREINO = [
  "Corrida",
  "Musculação",
  "Ciclismo",
  "Natação",
  "Funcional",
  "Yoga",
] as const

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
  return tipo
}
