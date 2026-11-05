export const ENDERECO_DA_API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export class RecusaDaApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem)
  }
}

export const fetchDeVerdade: typeof fetch = (...args) => fetch(...args)

export async function exigir(resposta: Response, esperado: number): Promise<void> {
  if (resposta.status !== esperado) {
    throw new RecusaDaApi(resposta.status, await frase(resposta))
  }
}

// a frase da recusa: o texto do detail (401, 404, 409) ou "campo: mensagem" do primeiro erro (422)
async function frase(resposta: Response): Promise<string> {
  try {
    const detalhe = (await resposta.json()).detail
    if (typeof detalhe === "string") return detalhe
    const primeiro = detalhe[0]
    return `${primeiro.loc.at(-1)}: ${String(primeiro.msg).replace(/^Value error, /, "")}`
  } catch {
    return `A API respondeu ${resposta.status}`
  }
}
