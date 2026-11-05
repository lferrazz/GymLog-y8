import { type Usuario, usuarioDoJson } from "@/lib/models/usuario"
import { ENDERECO_DA_API, exigir, fetchDeVerdade } from "@/lib/repositories/api"

export { RecusaDaApi } from "@/lib/repositories/api"

export class UsuarioRepository {
  constructor(
    private readonly cliente: typeof fetch = fetchDeVerdade,
    private readonly endereco: string = ENDERECO_DA_API,
  ) {}

  async entrar(email: string, senha: string): Promise<string | null> {
    const resposta = await this.cliente(`${this.endereco}/usuarios/login`, {
      method: "POST",
      body: new URLSearchParams({ username: email, password: senha }),
    })
    if (resposta.status !== 200) {
      return null
    }
    const corpo = await resposta.json()
    return corpo.access_token
  }

  async cadastrar(nome: string, email: string, senha: string): Promise<Usuario> {
    const resposta = await this.cliente(`${this.endereco}/usuarios/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    })
    await exigir(resposta, 201)
    return usuarioDoJson(await resposta.json())
  }

  async quemSouEu(token: string): Promise<Usuario> {
    const resposta = await this.cliente(`${this.endereco}/usuarios/eu`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    await exigir(resposta, 200)
    return usuarioDoJson(await resposta.json())
  }
}
