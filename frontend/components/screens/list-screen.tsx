"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight, Menu, ClipboardList, Plus, Clock, Search, X } from "lucide-react"
import { M3TopAppBar, M3IconButton, M3Chip, M3ExtendedFab, M3Button } from "@/components/m3"
import { useSessao, useTreinos } from "@/components/providers"
import { TipoIcon } from "@/components/tipo-icon"
import { AppDrawer } from "@/components/widgets/app-drawer"
import { ErroComTentarDeNovo } from "@/components/widgets/estados"
import { usePedido } from "@/lib/hooks/use-pedido"
import { AppRoutes } from "@/lib/routes"
import { TIPOS_TREINO, PERIODOS, formatarData, formatarDuracao } from "@/lib/treino-data"

export function ListScreen() {
  const parametros = useSearchParams()
  const busca = parametros.get("nome") ?? ""
  const tipo = parametros.get("tipo") ?? "todos"

  const servico = useTreinos()
  const pedido = usePedido(
    () => servico.listar({ nome: busca, tipo_treino: tipo === "todos" ? undefined : tipo }),
    [servico, busca, tipo],
  )
  const usuario = useSessao().usuario
  const router = useRouter()
  const [texto, setTexto] = useState(busca)
  const [periodo, setPeriodo] = useState<string>("todos")
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => setTexto(busca), [busca])

  const onSelecionar = (id: string) => router.push(AppRoutes.treino(id))
  const onCriar = () => router.push(AppRoutes.novoTreino)

  // guarda a busca e o tipo na url; a lista pede de novo a api, que filtra no banco
  function filtrar(novo: { nome?: string; tipo?: string }) {
    const consulta = new URLSearchParams()
    const nome = novo.nome ?? busca
    const tipoNovo = novo.tipo ?? tipo
    if (nome) consulta.set("nome", nome)
    if (tipoNovo !== "todos") consulta.set("tipo", tipoNovo)
    const sufixo = consulta.toString() ? `?${consulta}` : ""
    router.replace(`${AppRoutes.treinos}${sufixo}`)
  }

  function buscar(ev: React.FormEvent) {
    ev.preventDefault()
    filtrar({ nome: texto.trim() })
  }

  function limparBusca() {
    setTexto("")
    filtrar({ nome: "" })
  }

  const carregando = pedido.fase === "carregando"
  const comErro = pedido.fase === "erro"
  const treinos = useMemo(() => (pedido.fase === "pronto" ? pedido.dados : []), [pedido])

  const filtrados = useMemo(() => {
    const agora = Date.now()
    return treinos
      .filter((t) => {
        if (periodo === "todos") return true
        const dias = Number(periodo)
        const diff = (agora - new Date(t.data_treino).getTime()) / 86_400_000
        return diff <= dias
      })
      .sort((a, b) => new Date(b.data_treino).getTime() - new Date(a.data_treino).getTime())
  }, [treinos, periodo])

  const filtrando = Boolean(busca) || tipo !== "todos" || periodo !== "todos"
  const listaTotalVazia = pedido.fase === "pronto" && treinos.length === 0 && !filtrando
  const semResultado = pedido.fase === "pronto" && filtrados.length === 0 && filtrando

  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title="Meus treinos"
        leading={
          <M3IconButton aria-label="Abrir menu" onClick={() => setMenuAberto(true)}>
            <Menu className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />
      <AppDrawer aberto={menuAberto} onFechar={() => setMenuAberto(false)} />

      {usuario && (
        <p className="px-4 pb-1 pt-2 text-base text-muted-foreground">Olá, {usuario.nome}!</p>
      )}

      {!listaTotalVazia && (
        <div className="flex flex-col gap-3 px-4 pb-2 pt-2">
          <form role="search" onSubmit={buscar} className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              aria-label="Buscar pelo nome"
              placeholder="Buscar pelo nome"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              enterKeyHint="search"
              className="h-12 w-full rounded-full border border-input bg-muted/40 pl-12 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary [&::-webkit-search-cancel-button]:hidden"
            />
            {texto && (
              <button
                type="button"
                aria-label="Limpar a busca"
                onClick={limparBusca}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/40"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </form>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <M3Chip selected={tipo === "todos"} onClick={() => filtrar({ tipo: "todos" })}>
              Todos os tipos
            </M3Chip>
            {TIPOS_TREINO.map((t) => (
              <M3Chip key={t} selected={tipo === t} onClick={() => filtrar({ tipo: t })}>
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

        {pedido.fase === "erro" && (
          <ErroComTentarDeNovo
            titulo="Não consegui carregar os treinos"
            erro={pedido.erro}
            onTentarDeNovo={pedido.tentarDeNovo}
          />
        )}

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

        {semResultado && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ClipboardList className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-base font-medium text-foreground text-balance">
              {busca ? `Nenhum treino com "${busca}" no nome.` : "Nenhum treino nesse filtro"}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">
              Tente outra busca, ou ajuste o tipo e o período.
            </p>
          </div>
        )}

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

      {!listaTotalVazia && !comErro && (
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
