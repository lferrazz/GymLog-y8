"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Menu, LogOut, ShieldCheck } from "lucide-react"
import { M3Button, M3IconButton, M3TopAppBar } from "@/components/m3"
import { useAviso, useSessao } from "@/components/providers"
import { AppDrawer } from "@/components/widgets/app-drawer"
import { AppRoutes } from "@/lib/routes"

export function PerfilScreen() {
  const sessao = useSessao()
  const avisar = useAviso()
  const router = useRouter()
  const [menuAberto, setMenuAberto] = useState(false)
  const usuario = sessao.usuario

  if (usuario === null) return null

  function sair() {
    sessao.sair()
    avisar("Você saiu da conta")
    router.replace(AppRoutes.login)
  }

  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title="Perfil"
        leading={
          <M3IconButton aria-label="Abrir menu" onClick={() => setMenuAberto(true)}>
            <Menu className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />
      <AppDrawer aberto={menuAberto} onFechar={() => setMenuAberto(false)} />

      <div className="flex flex-1 flex-col items-center px-6 py-10 text-center">
        <span className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-container text-4xl font-medium text-on-primary-container">
          {usuario.nome.charAt(0).toUpperCase()}
        </span>
        <h2 className="text-2xl font-medium text-foreground text-balance">{usuario.nome}</h2>
        <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" aria-hidden />
          {usuario.email}
        </p>

        <p className="mt-8 inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />A API reconheceu o seu token.
        </p>

        <M3Button variant="outlined" className="mt-8 w-full" onClick={sair}>
          <LogOut className="h-5 w-5" aria-hidden />
          Sair
        </M3Button>
      </div>
    </div>
  )
}
