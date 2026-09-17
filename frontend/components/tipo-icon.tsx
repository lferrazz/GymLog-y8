import { Bike, Dumbbell, Footprints, Waves, Activity, Flower2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const MAPA: Record<string, LucideIcon> = {
  Corrida: Footprints,
  Musculação: Dumbbell,
  Ciclismo: Bike,
  Natação: Waves,
  Funcional: Activity,
  Yoga: Flower2,
}

export function TipoIcon({ tipo, className }: { tipo: string; className?: string }) {
  const Icon = MAPA[tipo] ?? Activity
  return <Icon className={className} aria-hidden />
}
