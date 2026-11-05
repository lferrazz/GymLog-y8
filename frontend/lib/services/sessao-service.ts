import type { Usuario } from "@/lib/models/usuario"
import { TokenRepository } from "@/lib/repositories/token-repository"
import { RecusaDaApi, UsuarioRepository } from "@/lib/repositories/usuario-repository"
import { Notificador } from "@/lib/services/notificador"

export class ErroDeSessao extends Error {}

const SEM_API = "Não foi possível falar com o servidor"

export class SessaoService extends Notificador {
  private tokenAtual: string | null = null
  usuario: Usuario | null = null
  restaurando = true
  private restauracao: Promise<void> | null = null

  constructor(
    private readonly repositorio: UsuarioRepository = new UsuarioRepository(),
    private readonly tokens: TokenRepository = new TokenRepository(),
  ) {
    super()
  }

  get logado(): boolean {
    return this.usuario !== null
  }

  get token(): string | null {
    return this.tokenAtual
  }

  async entrar(email: string, senha: string): Promise<void> {
    if (!email.trim() || !senha) {
      throw new ErroDeSessao("Preencha o e-mail e a senha")
    }

    let recebido: string | null
    let usuario: Usuario | null = null
    try {
      recebido = await this.repositorio.entrar(email.trim(), senha)
      if (recebido !== null) usuario = await this.repositorio.quemSouEu(recebido)
    } catch {
      throw new ErroDeSessao(SEM_API)
    }

    if (recebido === null || usuario === null) {
      throw new ErroDeSessao("E-mail ou senha incorretos")
    }
    this.tokenAtual = recebido
    this.usuario = usuario
    this.tokens.salvar(recebido)
    this.avisar()
  }

  async cadastrar(nome: string, email: string, senha: string): Promise<void> {
    if (!nome.trim() || !email.trim() || !senha) {
      throw new ErroDeSessao("Preencha o nome, o e-mail e a senha")
    }

    try {
      await this.repositorio.cadastrar(nome.trim(), email.trim(), senha)
    } catch (falha) {
      if (falha instanceof RecusaDaApi) {
        if (falha.status === 409) throw new ErroDeSessao("Já existe uma conta com este e-mail")
        throw new ErroDeSessao(falha.message)
      }
      throw new ErroDeSessao(SEM_API)
    }

    try {
      await this.entrar(email, senha)
    } catch {
      throw new ErroDeSessao("Conta criada, mas não consegui entrar. Tente pelo login.")
    }
  }

  restaurar(): Promise<void> {
    this.restauracao ??= this.conferirTokenGuardado()
    return this.restauracao
  }

  // token guardado: a api aceita, entra; recusa (401), apaga; nao responde, mantem
  private async conferirTokenGuardado(): Promise<void> {
    const guardado = this.tokens.ler()
    if (guardado !== null && !this.logado) {
      try {
        this.usuario = await this.repositorio.quemSouEu(guardado)
        this.tokenAtual = guardado
      } catch (falha) {
        if (falha instanceof RecusaDaApi) this.tokens.apagar()
      }
    }
    this.restaurando = false
    this.avisar()
  }

  sair(): void {
    this.tokens.apagar()
    this.tokenAtual = null
    this.usuario = null
    this.avisar()
  }
}
