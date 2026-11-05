export type Usuario = {
  id: string
  nome: string
  email: string
}

export function usuarioDoJson(json: Record<string, unknown>): Usuario {
  return {
    id: String(json.id),
    nome: String(json.nome),
    email: String(json.email),
  }
}
