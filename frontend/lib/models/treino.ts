export type Treino = {
  id: string
  nome: string
  tipo_treino: string
  data_treino: string
  duracao_min: number
  observacoes: string | null
  dono_id: string | null
}

export type DadosDoTreino = Omit<Treino, "id" | "dono_id">

export function treinoDoJson(json: Record<string, unknown>): Treino {
  return {
    id: String(json.id),
    nome: String(json.nome),
    tipo_treino: String(json.tipo_treino),
    data_treino: String(json.data_treino),
    duracao_min: Number(json.duracao_min),
    observacoes: json.observacoes == null ? null : String(json.observacoes),
    dono_id: json.dono_id == null ? null : String(json.dono_id),
  }
}
