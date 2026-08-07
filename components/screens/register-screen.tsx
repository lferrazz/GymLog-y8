"use client"

import { useState } from "react"
import { ArrowLeft, User, Mail, Lock, Check, X } from "lucide-react"
import { M3Button, M3TextField, M3IconButton, M3TopAppBar } from "@/components/m3"

type Erros = { nome?: string; email?: string; senha?: string }

export function RegisterScreen({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void
  onBack: () => void
}) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erros, setErros] = useState<Erros>({})
  const [carregando, setCarregando] = useState(false)

  const regras = [
    { ok: senha.length >= 8, texto: "Pelo menos 8 caracteres" },
    { ok: /[A-Z]/.test(senha), texto: "Uma letra maiúscula" },
    { ok: /[0-9]/.test(senha), texto: "Um número" },
  ]

  function validar(): boolean {
    const e: Erros = {}
    if (!nome.trim()) e.nome = "Informe seu nome."
    if (!email.trim()) e.email = "Informe seu e-mail."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido."
    if (!regras.every((r) => r.ok)) e.senha = "A senha não atende às regras."
    setErros(e)
    return Object.keys(e).length === 0
  }

  function cadastrar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    setCarregando(true)
    setTimeout(() => onSuccess(), 700)
  }

  return (
    <div className="flex min-h-full flex-col">
      <M3TopAppBar
        title="Criar conta"
        leading={
          <M3IconButton aria-label="Voltar" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </M3IconButton>
        }
      />

      <form onSubmit={cadastrar} className="flex flex-1 flex-col gap-4 px-6 py-6" noValidate>
        <M3TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          leading={<User className="h-5 w-5 text-muted-foreground" aria-hidden />}
        />
        <M3TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erros.email}
          leading={<Mail className="h-5 w-5 text-muted-foreground" aria-hidden />}
        />
        <M3TextField
          label="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erros.senha}
          leading={<Lock className="h-5 w-5 text-muted-foreground" aria-hidden />}
        />

        <ul className="flex flex-col gap-1.5 rounded-xl bg-muted/50 px-4 py-3">
          {regras.map((r) => (
            <li
              key={r.texto}
              className={`flex items-center gap-2 text-sm ${r.ok ? "text-success" : "text-muted-foreground"}`}
            >
              {r.ok ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <X className="h-4 w-4 shrink-0" aria-hidden />
              )}
              {r.texto}
            </li>
          ))}
        </ul>

        <M3Button type="submit" disabled={carregando} className="mt-2">
          {carregando ? "Criando conta..." : "Cadastrar"}
        </M3Button>
      </form>
    </div>
  )
}
