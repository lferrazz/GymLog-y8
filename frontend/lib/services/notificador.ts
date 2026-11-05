// guarda os ouvintes e chama cada um quando o estado muda (o changenotifier do flutter)
export class Notificador {
  private ouvintes = new Set<() => void>()
  private versao = 0

  ouvir = (ouvinte: () => void): (() => void) => {
    this.ouvintes.add(ouvinte)
    return () => this.ouvintes.delete(ouvinte)
  }

  versaoAtual = (): number => this.versao

  protected avisar(): void {
    this.versao++
    this.ouvintes.forEach((ouvinte) => ouvinte())
  }
}
