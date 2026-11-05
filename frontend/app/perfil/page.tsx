import { PerfilScreen } from "@/components/screens/perfil-screen"
import { RotaProtegida } from "@/components/widgets/rota-protegida"

export default function Page() {
  return (
    <RotaProtegida>
      <PerfilScreen />
    </RotaProtegida>
  )
}
