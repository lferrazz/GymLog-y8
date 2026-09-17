"use client"

import { useMemo, useState } from "react"
import { ChevronRight, LogOut, ClipboardList, Plus, Clock } from "lucide-react"
import { M3TopAppBar, M3IconButton, M3Chip, M3ExtendedFab, M3Button } from "@/components/m3"
import { TipoIcon } from "@/components/tipo-icon"
import {
  type Treino,
  TIPOS_TREINO,
  PERIODOS,
  formatarData,
  formatarDuracao,
} from "@/lib/treino-data"

export function ListScreen({
  treinos,
  carregando,
  onSelecionar,
  onCriar,
  onSair,
}: {
  treinos: Treino[]
  carregando: boolean
  onSelecionar: (id: string) => void
  onCriar: () => void
  onSair: () => void
}) {
  const [tipo, setTipo] = useState<string>("todos")
  const [periodo, setPeriodo] = useState<string>("todos")

  const filtrados = useMemo(() => {
    const agora = Date.now()
    return treinos
      .filter((t) => (tipo === "todos" ? true : t.tipo_treino === tipo))
      .filter((t) => {
        if (periodo === "todos") return true
        const dias = Number(periodo)
        const diff = (agora - new Date(t.data_treino).getTime()) / 86_400_000
        return diff <= dias
      })
      .sort((a, b) => new Date(b.data_treino).getTime() - new Date(a.data_treino).getTime())
  }, [treinos, tipo, periodo])

  const listaTotalVazia = !carregando && treinos.length === 0
  const filtroSemResultado = !carregando && treinos.length > 0 && filtrados.length === 0

  return (
    <div className="relative flex min-h-full flex-col">
      <M3TopAppBar
        title="Meus treinos"
        actions={
          <M3IconButton aria-label="Sair" onClick={onSair}>
            <LogOut className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />

      {/* Filtros */}
      {!listaTotalVazia && (
        <div className="flex flex-col gap-3 px-4 pb-2 pt-1">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <M3Chip selected={tipo === "todos"} onClick={() => setTipo("todos")}>
              Todos os tipos
            </M3Chip>
            {TIPOS_TREINO.map((t) => (
              <M3Chip key={t} selected={tipo === t} onClick={() => setTipo(t)}>
                <TipoIcon tipo={t} className="h-4 w-4" />
                {t}
              </M3Chip>
            ))}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {PERIODOS.map((p) => (
              <M3Chip key={p.valor} selected={periodo === p.valor} onClick={() => setPeriodo(p.valor)}>
                {p.rotulo}
              </M3Chip>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-4 pb-28 pt-2">
        {/* Carregando */}
        {carregando && (
          <ul className="flex flex-col gap-3" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Lista vazia (nenhum treino cadastrado) */}
        {listaTotalVazia && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <ClipboardList className="h-10 w-10" aria-hidden />
            </div>
            <h2 className="text-lg font-medium text-foreground text-balance">
              Nenhum treino por aqui ainda
            </h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">
              Registre seu primeiro treino e comece a acompanhar sua evolução.
            </p>
            <M3Button className="mt-6" onClick={onCriar}>
              <Plus className="h-5 w-5" aria-hidden />
              Criar primeiro treino
            </M3Button>
          </div>
        )}

        {/* Filtro sem resultado */}
        {filtroSemResultado && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ClipboardList className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-base font-medium text-foreground">Nenhum treino nesse filtro</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">
              Tente ajustar o tipo ou o período para ver mais registros.
            </p>
          </div>
        )}

        {/* Sucesso — lista */}
        {!carregando && filtrados.length > 0 && (
          <ul className="flex flex-col gap-3">
            {filtrados.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onSelecionar(t.id)}
                  className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    <TipoIcon tipo={t.tipo_treino} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-card-foreground">{t.nome}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{t.tipo_treino}</span>
                      <span aria-hidden>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {formatarDuracao(t.duracao_min)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {formatarData(t.data_treino)}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB */}
      {!listaTotalVazia && (
        <div className="pointer-events-none sticky bottom-0 z-10 flex justify-end px-4 pb-5">
          <M3ExtendedFab className="pointer-events-auto" onClick={onCriar}>
            <Plus className="h-6 w-6" aria-hidden />
            Novo treino
          </M3ExtendedFab>
        </div>
      )}
    </div>
  )
}
