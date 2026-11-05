import { Suspense } from "react"
import { ListScreen } from "@/components/screens/list-screen"
import { Carregando } from "@/components/widgets/estados"
import { RotaProtegida } from "@/components/widgets/rota-protegida"

export default function Page() {
  return (
    <RotaProtegida>
      <Suspense fallback={<Carregando />}>
        <ListScreen />
      </Suspense>
    </RotaProtegida>
  )
}
