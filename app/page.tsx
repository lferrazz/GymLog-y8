"use client"

import { useEffect, useState } from "react"
import { LoginScreen } from "@/components/screens/login-screen"
import { RegisterScreen } from "@/components/screens/register-screen"
import { ListScreen } from "@/components/screens/list-screen"
import { FormScreen } from "@/components/screens/form-screen"
import { DetailScreen } from "@/components/screens/detail-screen"
import { M3Snackbar, M3Dialog } from "@/components/m3"
import { type Treino, TREINOS_SEED } from "@/lib/treino-data"

type Tela = "login" | "cadastro" | "lista" | "form" | "detalhe"

export default function Page() {
  const [tela, setTela] = useState<Tela>("login")
  const [treinos, setTreinos] = useState<Treino[]>(TREINOS_SEED)
  const [carregandoLista, setCarregandoLista] = useState(false)
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)

  const selecionado = treinos.find((t) => t.id === selecionadoId) ?? null
  const emEdicao = treinos.find((t) => t.id === editandoId)

  // Simula carregamento da lista ao entrar
  function irParaLista() {
    setTela("lista")
    setCarregandoLista(true)
  }

  useEffect(() => {
    if (!carregandoLista) return
    const t = setTimeout(() => setCarregandoLista(false), 900)
    return () => clearTimeout(t)
  }, [carregandoLista])

  function mostrarSnackbar(msg: string) {
    setSnackbar(msg)
  }

  useEffect(() => {
    if (!snackbar) return
    const t = setTimeout(() => setSnackbar(null), 2600)
    return () => clearTimeout(t)
  }, [snackbar])

  function salvarTreino(dados: Omit<Treino, "id">) {
    if (editandoId) {
      setTreinos((prev) => prev.map((t) => (t.id === editandoId ? { ...t, ...dados } : t)))
      setSelecionadoId(editandoId)
      setEditandoId(null)
      setTela("detalhe")
      mostrarSnackbar("Treino atualizado com sucesso.")
    } else {
      const novo: Treino = { id: `t${Date.now()}`, ...dados }
      setTreinos((prev) => [novo, ...prev])
      setSelecionadoId(novo.id)
      setTela("detalhe")
      mostrarSnackbar("Treino criado com sucesso.")
    }
  }

  function excluirTreino() {
    if (!selecionadoId) return
    setTreinos((prev) => prev.filter((t) => t.id !== selecionadoId))
    setConfirmarExclusao(false)
    setSelecionadoId(null)
    setTela("lista")
    mostrarSnackbar("Treino excluído.")
  }

  return (
    <main className="flex min-h-svh justify-center bg-muted/40 md:items-center md:py-8">
      {/* Moldura de celular — coluna única, mobile-first */}
      <div className="relative flex h-svh w-full max-w-md flex-col overflow-hidden bg-background shadow-xl md:h-[860px] md:rounded-[2.5rem] md:border-8 md:border-foreground/90">
        <div className="flex-1 overflow-y-auto">
          {tela === "login" && (
            <LoginScreen onSuccess={irParaLista} onGoRegister={() => setTela("cadastro")} />
          )}

          {tela === "cadastro" && (
            <RegisterScreen
              onBack={() => setTela("login")}
              onSuccess={() => {
                mostrarSnackbar("Conta criada com sucesso.")
                irParaLista()
              }}
            />
          )}

          {tela === "lista" && (
            <ListScreen
              treinos={treinos}
              carregando={carregandoLista}
              onSelecionar={(id) => {
                setSelecionadoId(id)
                setTela("detalhe")
              }}
              onCriar={() => {
                setEditandoId(null)
                setTela("form")
              }}
              onSair={() => {
                setTela("login")
                setSelecionadoId(null)
              }}
            />
          )}

          {tela === "form" && (
            <FormScreen
              treino={emEdicao}
              onSalvar={salvarTreino}
              onCancelar={() => {
                if (editandoId) {
                  setTela("detalhe")
                  setEditandoId(null)
                } else {
                  setTela("lista")
                }
              }}
            />
          )}

          {tela === "detalhe" && selecionado && (
            <DetailScreen
              treino={selecionado}
              onVoltar={() => setTela("lista")}
              onEditar={() => {
                setEditandoId(selecionado.id)
                setTela("form")
              }}
              onExcluir={() => setConfirmarExclusao(true)}
            />
          )}
        </div>

        {confirmarExclusao && selecionado && (
          <M3Dialog
            title="Excluir treino?"
            description={`O treino "${selecionado.nome}" será removido permanentemente. Esta ação não pode ser desfeita.`}
            confirmLabel="Excluir"
            destructive
            onConfirm={excluirTreino}
            onCancel={() => setConfirmarExclusao(false)}
          />
        )}

        {snackbar && <M3Snackbar message={snackbar} />}
      </div>
    </main>
  )
}
