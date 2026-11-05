"use client"

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react"
import { M3Snackbar } from "@/components/m3"
import { TreinoRepository } from "@/lib/repositories/treino-repository"
import type { Notificador } from "@/lib/services/notificador"
import { SessaoService } from "@/lib/services/sessao-service"
import { TreinosService } from "@/lib/services/treinos-service"

const SessaoContext = createContext<SessaoService | null>(null)
const TreinosContext = createContext<TreinosService | null>(null)
type Aviso = { texto: string; erro: boolean }
const AvisoContext = createContext<((aviso: Aviso) => void) | null>(null)

export function Providers({
  children,
  sessao: sessaoDeFora,
  treinos: treinosDeFora,
}: {
  children: React.ReactNode
  sessao?: SessaoService
  treinos?: TreinosService
}) {
  const [sessao] = useState(() => sessaoDeFora ?? new SessaoService())
  const [treinos] = useState(() => treinosDeFora ?? new TreinosService(new TreinoRepository(), sessao))
  const [aviso, setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    sessao.restaurar()
  }, [sessao])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3000)
    return () => clearTimeout(t)
  }, [aviso])

  return (
    <SessaoContext.Provider value={sessao}>
      <TreinosContext.Provider value={treinos}>
        <AvisoContext.Provider value={setAviso}>
          {children}
          {aviso && <M3Snackbar message={aviso.texto} tom={aviso.erro ? "erro" : "sucesso"} />}
        </AvisoContext.Provider>
      </TreinosContext.Provider>
    </SessaoContext.Provider>
  )
}

function pegar<T>(contexto: React.Context<T | null>, nome: string): T {
  const valor = useContext(contexto)
  if (valor === null) {
    throw new Error(`${nome} não encontrado: a tela precisa estar dentro do <Providers>`)
  }
  return valor
}

// cadastra a tela como ouvinte: ela se redesenha quando o service avisa (o watch)
function observar<T extends Notificador>(objeto: T): T {
  useSyncExternalStore(objeto.ouvir, objeto.versaoAtual, objeto.versaoAtual)
  return objeto
}

export function useSessao(): SessaoService {
  return observar(pegar(SessaoContext, "SessaoService"))
}

export function useSessaoAcoes(): SessaoService {
  return pegar(SessaoContext, "SessaoService")
}

export function useTreinos(): TreinosService {
  return pegar(TreinosContext, "TreinosService")
}

export function useAviso(): (texto: string, opcoes?: { erro?: boolean }) => void {
  const setAviso = pegar(AvisoContext, "Aviso")
  return useCallback(
    (texto: string, opcoes?: { erro?: boolean }) => setAviso({ texto, erro: opcoes?.erro ?? false }),
    [setAviso],
  )
}
