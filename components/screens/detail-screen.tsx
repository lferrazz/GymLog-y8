"use client"

import { ArrowLeft, Pencil, Trash2, Clock, CalendarDays, Tag, FileText } from "lucide-react"
import { M3TopAppBar, M3IconButton, M3Button } from "@/components/m3"
import { TipoIcon } from "@/components/tipo-icon"
import { type Treino, formatarDataHora, formatarDuracao } from "@/lib/treino-data"

function Linha({
  icon,
  rotulo,
  valor,
}: {
  icon: React.ReactNode
  rotulo: string
  valor: string
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-4">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{rotulo}</p>
        <p className="mt-0.5 text-base text-card-foreground text-pretty">{valor}</p>
      </div>
    </div>
  )
}

export function DetailScreen({
  treino,
  onVoltar,
  onEditar,
  onExcluir,
}: {
  treino: Treino
  onVoltar: () => void
  onEditar: () => void
  onExcluir: () => void
}) {
  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title="Detalhe do treino"
        leading={
          <M3IconButton aria-label="Voltar" onClick={onVoltar}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />

      <div className="flex-1 px-4 py-4">
        <div className="mb-4 flex items-center gap-4 rounded-3xl bg-primary-container px-5 py-6 text-on-primary-container">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <TipoIcon tipo={treino.tipo_treino} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-medium text-balance">{treino.nome}</h2>
            <p className="text-sm opacity-80">{treino.tipo_treino}</p>
          </div>
        </div>

        <div className="divide-y divide-border rounded-3xl bg-card">
          <Linha
            icon={<Tag className="h-5 w-5" aria-hidden />}
            rotulo="Tipo"
            valor={treino.tipo_treino}
          />
          <Linha
            icon={<CalendarDays className="h-5 w-5" aria-hidden />}
            rotulo="Data e horário"
            valor={formatarDataHora(treino.data_treino)}
          />
          <Linha
            icon={<Clock className="h-5 w-5" aria-hidden />}
            rotulo="Duração"
            valor={formatarDuracao(treino.duracao_min)}
          />
          <Linha
            icon={<FileText className="h-5 w-5" aria-hidden />}
            rotulo="Observações"
            valor={treino.observacoes ?? "Sem observações."}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-3 bg-background/80 px-4 py-4 backdrop-blur">
        <M3Button variant="outlined" className="flex-1 text-destructive" onClick={onExcluir}>
          <Trash2 className="h-5 w-5" aria-hidden />
          Excluir
        </M3Button>
        <M3Button className="flex-1" onClick={onEditar}>
          <Pencil className="h-5 w-5" aria-hidden />
          Editar
        </M3Button>
      </div>
    </div>
  )
}
