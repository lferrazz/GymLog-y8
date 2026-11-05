const CHAVE = "gymlog.token"

export class TokenRepository {
  ler(): string | null {
    try {
      return window.localStorage.getItem(CHAVE)
    } catch {
      return null
    }
  }

  salvar(token: string): void {
    try {
      window.localStorage.setItem(CHAVE, token)
    } catch {
    }
  }

  apagar(): void {
    try {
      window.localStorage.removeItem(CHAVE)
    } catch {
    }
  }
}
