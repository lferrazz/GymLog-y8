"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { M3Dialog } from "@/components/m3"
import { useAviso, useTreinos } from "@/components/providers"
import { DetailScreen } from "@/components/screens/detail-screen"
import { Carregando, ErroComTentarDeNovo, TelaComVoltar } from "@/components/widgets/estados"
import { RotaProtegida } from "@/components/widgets/rota-protegida"
import { usePedido } from "@/lib/hooks/use-pedido"
import { AppRoutes } from "@/lib/routes"

export default function Page() {
  return (
    <RotaProtegida>
      <DetalheDoTreino />
    </RotaProtegida>
  )
}

function DetalheDoTreino() {
  const { id } = useParams<{ id: string }>()
  const treinos = useTreinos()
  const avisar = useAviso()
  const router = useRouter()
  const pedido = usePedido(() => treinos.buscar(id), [treinos, id])
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [recusa, setRecusa] = useState<string | null>(null)

  const voltar = () => router.back()

  if (pedido.fase === "carregando") {
    return (
      <TelaComVoltar titulo="Detalhe do treino" onVoltar={voltar}>
        <Carregando />
      </TelaComVoltar>
    )
  }
  if (pedido.fase === "erro") {
    return (
      <TelaComVoltar titulo="Detalhe do treino" onVoltar={voltar}>
        <ErroComTentarDeNovo
          titulo="Não consegui carregar o treino"
          erro={pedido.erro}
          onTentarDeNovo={pedido.tentarDeNovo}
        />
      </TelaComVoltar>
    )
  }

  const treino = pedido.dados

  async function excluir() {
    setExcluindo(true)
    setRecusa(null)
    try {
      await treinos.excluir(id)
    } catch (falha) {
      setConfirmarExclusao(false)
      setExcluindo(false)
      setRecusa(falha instanceof Error ? falha.message : String(falha))
      avisar("Não deu para excluir", { erro: true })
      return
    }
    avisar("Treino excluído")
    router.replace(AppRoutes.treinos)
  }

  return (
    <>
      <DetailScreen
        treino={treino}
        erro={recusa}
        onVoltar={voltar}
        onEditar={() => router.push(AppRoutes.editarTreino(id))}
        onExcluir={() => setConfirmarExclusao(true)}
      />
      {confirmarExclusao && (
        <M3Dialog
          title="Excluir treino?"
          description={`O treino "${treino.nome}" será removido permanentemente. Esta ação não pode ser desfeita.`}
          confirmLabel={excluindo ? "Excluindo..." : "Excluir"}
          destructive
          onConfirm={excluir}
          onCancel={() => setConfirmarExclusao(false)}
        />
      )}
    </>
  )
}
