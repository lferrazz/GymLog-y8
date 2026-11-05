"use client"

import { ArrowLeft, CloudOff, Loader2, RotateCw } from "lucide-react"
import { M3Button, M3IconButton, M3TopAppBar } from "@/components/m3"

export function TelaComVoltar({
  titulo,
  onVoltar,
  children,
}: {
  titulo: string
  onVoltar: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title={titulo}
        leading={
          <M3IconButton aria-label="Voltar" onClick={onVoltar}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />
      {children}
    </div>
  )
}

export function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center py-16" role="status" aria-label="Carregando">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
    </div>
  )
}

export function ErroComTentarDeNovo({
  titulo,
  erro,
  onTentarDeNovo,
}: {
  titulo: string
  erro: string
  onTentarDeNovo: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CloudOff className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="text-base font-medium text-foreground">{titulo}</h2>
      <p role="alert" className="mt-2 max-w-xs text-sm text-destructive text-pretty">
        {erro}
      </p>
      <M3Button className="mt-6" onClick={onTentarDeNovo}>
        <RotateCw className="h-5 w-5" aria-hidden />
        Tentar de novo
      </M3Button>
    </div>
  )
}
