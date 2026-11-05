"use client"

import { useParams, useRouter } from "next/navigation"
import { useAviso, useTreinos } from "@/components/providers"
import { FormScreen } from "@/components/screens/form-screen"
import { Carregando, ErroComTentarDeNovo, TelaComVoltar } from "@/components/widgets/estados"
import { RotaProtegida } from "@/components/widgets/rota-protegida"
import { usePedido } from "@/lib/hooks/use-pedido"

export default function Page() {
  return (
    <RotaProtegida>
      <EditarTreino />
    </RotaProtegida>
  )
}

function EditarTreino() {
  const { id } = useParams<{ id: string }>()
  const treinos = useTreinos()
  const avisar = useAviso()
  const router = useRouter()
  const pedido = usePedido(() => treinos.buscar(id), [treinos, id])

  if (pedido.fase === "carregando") {
    return (
      <TelaComVoltar titulo="Editar treino" onVoltar={() => router.back()}>
        <Carregando />
      </TelaComVoltar>
    )
  }
  if (pedido.fase === "erro") {
    return (
      <TelaComVoltar titulo="Editar treino" onVoltar={() => router.back()}>
        <ErroComTentarDeNovo
          titulo="Não consegui carregar o treino"
          erro={pedido.erro}
          onTentarDeNovo={pedido.tentarDeNovo}
        />
      </TelaComVoltar>
    )
  }

  return (
    <FormScreen
      treino={pedido.dados}
      onSalvar={async (dados) => {
        try {
          await treinos.atualizar(id, dados)
        } catch (falha) {
          avisar("Não deu para salvar", { erro: true })
          throw falha
        }
        avisar("Treino salvo")
        router.back()
      }}
      onCancelar={() => router.back()}
    />
  )
}
