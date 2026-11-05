"use client"

import { ClipboardList, LogOut, UserRound } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAviso, useSessao, useSessaoAcoes } from "@/components/providers"
import { AppRoutes } from "@/lib/routes"
import { cn } from "@/lib/utils"

const ITENS = [
  { rota: AppRoutes.treinos, rotulo: "Meus treinos", Icone: ClipboardList },
  { rota: AppRoutes.perfil, rotulo: "Perfil", Icone: UserRound },
]

export function AppDrawer({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const usuario = useSessao().usuario
  const sessao = useSessaoAcoes()
  const avisar = useAviso()
  const router = useRouter()
  const atual = usePathname()

  if (!aberto || usuario === null) return null

  function ir(rota: string) {
    onFechar()
    if (rota !== atual) router.replace(rota)
  }

  function sair() {
    sessao.sair()
    avisar("Você saiu da conta")
    router.replace(AppRoutes.login)
  }

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-foreground/40" onClick={onFechar} aria-hidden />
      <nav
        aria-label="Menu"
        className="relative flex h-full w-72 max-w-[85%] flex-col rounded-r-3xl bg-surface-container py-4 shadow-xl"
      >
        <div className="mb-2 border-b border-border px-6 pb-5 pt-3">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground">
            {usuario.nome.charAt(0).toUpperCase()}
          </span>
          <p className="truncate text-base font-medium text-foreground">{usuario.nome}</p>
          <p className="truncate text-sm text-muted-foreground">{usuario.email}</p>
        </div>

        <ul className="flex flex-1 flex-col gap-1 px-3">
          {ITENS.map(({ rota, rotulo, Icone }) => (
            <li key={rota}>
              <button
                onClick={() => ir(rota)}
                aria-current={rota === atual ? "page" : undefined}
                className={cn(
                  "flex h-14 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-medium transition-colors",
                  rota === atual
                    ? "bg-primary-container text-on-primary-container"
                    : "text-foreground hover:bg-accent/40",
                )}
              >
                <Icone className="h-5 w-5" aria-hidden />
                {rotulo}
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3">
          <button
            onClick={sair}
            className="flex h-14 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/40"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            Sair
          </button>
        </div>
      </nav>
    </div>
  )
}
