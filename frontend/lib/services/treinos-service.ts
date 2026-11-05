import type { DadosDoTreino, Treino } from "@/lib/models/treino"
import { RecusaDaApi } from "@/lib/repositories/api"
import { type FiltrosDosTreinos, TreinoRepository } from "@/lib/repositories/treino-repository"
import type { SessaoService } from "@/lib/services/sessao-service"

export class ErroDeTreinos extends Error {}

export class TreinosService {
  constructor(
    private readonly repositorio: TreinoRepository,
    private readonly sessao: SessaoService,
  ) {}

  listar(filtros: FiltrosDosTreinos = {}): Promise<Treino[]> {
    return this.pedir((token) => this.repositorio.listar(token, filtros))
  }

  buscar(id: string): Promise<Treino> {
    return this.pedir((token) => this.repositorio.buscar(token, id))
  }

  criar(dados: DadosDoTreino): Promise<Treino> {
    return this.pedir((token) => this.repositorio.criar(token, dados))
  }

  atualizar(id: string, dados: Partial<DadosDoTreino>): Promise<Treino> {
    return this.pedir((token) => this.repositorio.atualizar(token, id, dados))
  }

  excluir(id: string): Promise<void> {
    return this.pedir((token) => this.repositorio.excluir(token, id))
  }

  // leva o token em todo pedido e troca a recusa da api por uma frase para a tela
  private async pedir<T>(pedido: (token: string) => Promise<T>): Promise<T> {
    const token = this.sessao.token
    if (token === null) {
      throw new ErroDeTreinos("Faça login para continuar")
    }

    try {
      return await pedido(token)
    } catch (falha) {
      if (!(falha instanceof RecusaDaApi)) {
        throw new ErroDeTreinos("Não foi possível falar com o servidor")
      }
      if (falha.status === 401) {
        this.sessao.sair()
        throw new ErroDeTreinos("Sua sessão expirou. Entre de novo")
      }
      if (falha.status === 404) {
        throw new ErroDeTreinos("Treino não encontrado")
      }
      throw new ErroDeTreinos(falha.message)
    }
  }
}
