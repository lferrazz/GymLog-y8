import { type DadosDoTreino, type Treino, treinoDoJson } from "@/lib/models/treino"
import { ENDERECO_DA_API, exigir, fetchDeVerdade } from "@/lib/repositories/api"

export type FiltrosDosTreinos = { nome?: string; tipo_treino?: string }

export class TreinoRepository {
  constructor(
    private readonly cliente: typeof fetch = fetchDeVerdade,
    private readonly endereco: string = ENDERECO_DA_API,
  ) {}

  private cabecalho(token: string, json = false): HeadersInit {
    return json
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { Authorization: `Bearer ${token}` }
  }

  async listar(token: string, filtros: FiltrosDosTreinos = {}): Promise<Treino[]> {
    const consulta = new URLSearchParams()
    if (filtros.nome) consulta.set("nome", filtros.nome)
    if (filtros.tipo_treino) consulta.set("tipo_treino", filtros.tipo_treino)
    const sufixo = consulta.toString() ? `?${consulta}` : ""
    const resposta = await this.cliente(`${this.endereco}/treinos/${sufixo}`, {
      headers: this.cabecalho(token),
    })
    await exigir(resposta, 200)
    const itens: Record<string, unknown>[] = await resposta.json()
    return itens.map(treinoDoJson)
  }

  async buscar(token: string, id: string): Promise<Treino> {
    const resposta = await this.cliente(`${this.endereco}/treinos/${id}`, {
      headers: this.cabecalho(token),
    })
    await exigir(resposta, 200)
    return treinoDoJson(await resposta.json())
  }

  async criar(token: string, dados: DadosDoTreino): Promise<Treino> {
    const resposta = await this.cliente(`${this.endereco}/treinos/`, {
      method: "POST",
      headers: this.cabecalho(token, true),
      body: JSON.stringify(dados),
    })
    await exigir(resposta, 201)
    return treinoDoJson(await resposta.json())
  }

  async atualizar(token: string, id: string, dados: Partial<DadosDoTreino>): Promise<Treino> {
    const resposta = await this.cliente(`${this.endereco}/treinos/${id}`, {
      method: "PATCH",
      headers: this.cabecalho(token, true),
      body: JSON.stringify(dados),
    })
    await exigir(resposta, 200)
    return treinoDoJson(await resposta.json())
  }

  async excluir(token: string, id: string): Promise<void> {
    const resposta = await this.cliente(`${this.endereco}/treinos/${id}`, {
      method: "DELETE",
      headers: this.cabecalho(token),
    })
    await exigir(resposta, 204)
  }
}
