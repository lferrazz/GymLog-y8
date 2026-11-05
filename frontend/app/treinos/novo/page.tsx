"use client"

import { useRouter } from "next/navigation"
import { useAviso, useTreinos } from "@/components/providers"
import { FormScreen } from "@/components/screens/form-screen"
import { RotaProtegida } from "@/components/widgets/rota-protegida"
import { AppRoutes } from "@/lib/routes"

export default function Page() {
  return (
    <RotaProtegida>
      <NovoTreino />
    </RotaProtegida>
  )
}

function NovoTreino() {
  const treinos = useTreinos()
  const avisar = useAviso()
  const router = useRouter()

  return (
    <FormScreen
      onSalvar={async (dados) => {
        let novo
        try {
          novo = await treinos.criar(dados)
        } catch (falha) {
          avisar("Não deu para salvar", { erro: true })
          throw falha
        }
        avisar("Treino salvo")
        router.replace(AppRoutes.treino(novo.id))
      }}
      onCancelar={() => router.back()}
    />
  )
}
