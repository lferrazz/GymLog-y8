"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { M3TopAppBar, M3IconButton, M3Button, M3TextField, M3Select } from "@/components/m3"
import { type Treino, TIPOS_TREINO } from "@/lib/treino-data"

type Erros = {
  nome?: string
  tipo_treino?: string
  data_treino?: string
  duracao_min?: string
}

// Converte ISO -> valor de input datetime-local
function paraInput(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export function FormScreen({
  treino,
  onSalvar,
  onCancelar,
}: {
  treino?: Treino
  onSalvar: (dados: Omit<Treino, "id">) => void
  onCancelar: () => void
}) {
  const editando = Boolean(treino)
  const [nome, setNome] = useState(treino?.nome ?? "")
  const [tipo, setTipo] = useState(treino?.tipo_treino ?? "")
  const [data, setData] = useState(paraInput(treino?.data_treino))
  const [duracao, setDuracao] = useState(treino ? String(treino.duracao_min) : "")
  const [obs, setObs] = useState(treino?.observacoes ?? "")
  const [erros, setErros] = useState<Erros>({})

  function validar(): boolean {
    const e: Erros = {}
    if (!nome.trim()) e.nome = "Informe o nome do treino."
    if (!tipo) e.tipo_treino = "Selecione o tipo de treino."
    if (!data) e.data_treino = "Informe a data e o horário."
    const dur = Number(duracao)
    if (!duracao.trim()) e.duracao_min = "Informe a duração."
    else if (!Number.isInteger(dur) || dur <= 0) e.duracao_min = "Use um número inteiro maior que zero."
    setErros(e)
    return Object.keys(e).length === 0
  }

  function salvar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    onSalvar({
      nome: nome.trim(),
      tipo_treino: tipo,
      data_treino: new Date(data).toISOString(),
      duracao_min: Number(duracao),
      observacoes: obs.trim() ? obs.trim() : null,
    })
  }

  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title={editando ? "Editar treino" : "Novo treino"}
        leading={
          <M3IconButton aria-label="Cancelar" onClick={onCancelar}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />

      <form onSubmit={salvar} className="flex flex-1 flex-col gap-4 px-6 py-6" noValidate>
        <M3TextField
          label="Nome do treino"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
        />

        <div>
          <M3Select label="Tipo de treino" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="" disabled>
              Selecione...
            </option>
            {TIPOS_TREINO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </M3Select>
          {erros.tipo_treino && (
            <p className="mt-1 px-1 text-xs text-destructive">{erros.tipo_treino}</p>
          )}
        </div>

        <div>
          <label htmlFor="data" className="mb-1 block px-1 text-xs font-medium text-muted-foreground">
            Data e horário
          </label>
          <input
            id="data"
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-muted/40 px-4 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {erros.data_treino && (
            <p className="mt-1 px-1 text-xs text-destructive">{erros.data_treino}</p>
          )}
        </div>

        <M3TextField
          label="Duração (minutos)"
          type="number"
          inputMode="numeric"
          min={1}
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          error={erros.duracao_min}
          helper="Tempo total do treino em minutos."
        />

        <div>
          <label htmlFor="obs" className="mb-1 block px-1 text-xs font-medium text-muted-foreground">
            Observações (opcional)
          </label>
          <textarea
            id="obs"
            rows={4}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Como foi o treino, sensações, cargas..."
            className="w-full resize-none rounded-md border border-input bg-muted/40 px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mt-2 flex gap-3">
          <M3Button type="button" variant="outlined" className="flex-1" onClick={onCancelar}>
            Cancelar
          </M3Button>
          <M3Button type="submit" className="flex-1">
            {editando ? "Salvar" : "Criar treino"}
          </M3Button>
        </div>
      </form>
    </div>
  )
}
