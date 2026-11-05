import { redirect } from "next/navigation"
import { AppRoutes } from "@/lib/routes"

export default function Page() {
  redirect(AppRoutes.treinos)
}
