"use client"

import { useState } from "react"
import { Dumbbell, Mail, Lock, AlertCircle } from "lucide-react"
import { M3Button, M3TextField } from "@/components/m3"
import { USUARIO_DEMO } from "@/lib/treino-data"

export function LoginScreen({
  onSuccess,
  onGoRegister,
}: {
  onSuccess: () => void
  onGoRegister: () => void
}) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    // Simula chamada à API
    setTimeout(() => {
      if (email.trim() === USUARIO_DEMO.email && senha === USUARIO_DEMO.senha) {
        onSuccess()
      } else {
        setErro("E-mail ou senha incorretos. Tente novamente.")
        setCarregando(false)
      }
    }, 700)
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
          <Dumbbell className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-medium text-foreground text-balance">Diário de Treino</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Entre para acompanhar a evolução dos seus treinos.
        </p>
      </div>

      <form onSubmit={entrar} className="flex flex-col gap-4" noValidate>
        <M3TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leading={<Mail className="h-5 w-5 text-muted-foreground" aria-hidden />}
        />
        <M3TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          leading={<Lock className="h-5 w-5 text-muted-foreground" aria-hidden />}
        />

        {erro && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{erro}</span>
          </div>
        )}

        <M3Button type="submit" disabled={carregando} className="mt-2">
          {carregando ? "Entrando..." : "Entrar"}
        </M3Button>
      </form>

      <div className="mt-6 flex justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Ainda não tem conta?</span>
        <button
          type="button"
          onClick={onGoRegister}
          className="font-medium text-primary hover:underline"
        >
          Cadastre-se
        </button>
      </div>

      <p className="mt-8 rounded-xl bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        Protótipo — use <strong className="font-medium text-foreground">{USUARIO_DEMO.email}</strong> e senha{" "}
        <strong className="font-medium text-foreground">{USUARIO_DEMO.senha}</strong>.
      </p>
    </div>
  )
}
