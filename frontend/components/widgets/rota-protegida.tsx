"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSessao } from "@/components/providers"
import { AppRoutes } from "@/lib/routes"

// espera conferir o token guardado antes de decidir: com sessao mostra a tela, sem sessao vai ao login
export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const sessao = useSessao()
  const router = useRouter()
  const decidido = sessao.logado || !sessao.restaurando

  useEffect(() => {
    if (decidido && !sessao.logado) router.replace(AppRoutes.login)
  }, [decidido, sessao.logado, router])

  if (!decidido) {
    return (
      <div className="flex min-h-full items-center justify-center" role="status" aria-label="Carregando">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    )
  }
  return sessao.logado ? children : null
}
