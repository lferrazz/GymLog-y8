import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Providers } from "@/components/providers"
import { ListScreen } from "@/components/screens/list-screen"
import { LoginScreen } from "@/components/screens/login-screen"
import { PerfilScreen } from "@/components/screens/perfil-screen"
import { RegisterScreen } from "@/components/screens/register-screen"
import PaginaDoTreino from "@/app/treinos/[id]/page"
import PaginaEditar from "@/app/treinos/[id]/editar/page"
import PaginaNovo from "@/app/treinos/novo/page"
import { AppDrawer } from "@/components/widgets/app-drawer"
import { RotaProtegida } from "@/components/widgets/rota-protegida"
import { TreinoRepository } from "@/lib/repositories/treino-repository"
import { UsuarioRepository } from "@/lib/repositories/usuario-repository"
import { SessaoService } from "@/lib/services/sessao-service"
import { TreinosService } from "@/lib/services/treinos-service"

const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
const params: { id?: string } = {}
const url = { consulta: "" }
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/treinos",
  useParams: () => params,
  useSearchParams: () => new URLSearchParams(url.consulta),
}))

beforeEach(() => {
  router.push.mockClear()
  router.replace.mockClear()
  router.back.mockClear()
  url.consulta = ""
  localStorage.clear()
})
afterEach(cleanup)

const CHAVE_DO_TOKEN = "gymlog.token"

const TREINOS_DA_ANA = [
  {
    id: "t-peito",
    nome: "Peito e tríceps",
    tipo_treino: "Musculação",
    data_treino: "2026-10-20T18:30:00",
    duracao_min: 60,
    observacoes: null,
    dono_id: "1",
  },
  {
    id: "t-corrida",
    nome: "Corrida no parque",
    tipo_treino: "Corrida",
    data_treino: "2026-10-21T07:00:00",
    duracao_min: 40,
    observacoes: "5 km leves",
    dono_id: "1",
  },
]

function apiDeMentira({ treinosDaAna = TREINOS_DA_ANA } = {}) {
  const contas = new Map([["ana@ifg.edu.br", { nome: "Ana", senha: "segredo1" }]])
  const treinos = treinosDaAna.map((t) => ({ ...t, dono: "ana@ifg.edu.br" }))
  const pedidos: { url: string; init?: RequestInit }[] = []
  const estado = { foraDoAr: false, treinosForaDoAr: false }
  const responder = (status: number, corpo?: unknown) =>
    new Response(corpo === undefined ? null : JSON.stringify(corpo), {
      status,
      headers: { "Content-Type": "application/json" },
    })

  const cliente = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const endereco = String(url)
    if (estado.foraDoAr || (estado.treinosForaDoAr && endereco.includes("/treinos"))) {
      throw new TypeError("Failed to fetch")
    }
    pedidos.push({ url: endereco, init })

    const enderecoInteiro = new URL(endereco)
    const rotaDeTreino = enderecoInteiro.pathname.match(/\/treinos\/(.*)$/)
    if (rotaDeTreino) {
      const cabecalho = new Headers(init?.headers).get("Authorization") ?? ""
      const email = cabecalho.replace("Bearer token-de-", "")
      if (!contas.has(email)) return responder(401, { detail: "Credenciais invalidas" })
      const id = rotaDeTreino[1]
      const doDono = treinos.filter((t) => t.dono === email)
      const publico = ({ dono: _, ...t }: (typeof treinos)[number]) => t
      const metodo = init?.method ?? "GET"

      if (id === "" && metodo === "GET") {
        const nome = enderecoInteiro.searchParams.get("nome")?.toLowerCase()
        const tipo = enderecoInteiro.searchParams.get("tipo_treino")
        const achados = doDono.filter(
          (t) => (!nome || t.nome.toLowerCase().includes(nome)) && (!tipo || t.tipo_treino === tipo),
        )
        return responder(200, achados.map(publico))
      }
      if (metodo === "POST" || metodo === "PATCH") {
        const dados = JSON.parse(String(init?.body))
        if (dados.duracao_min !== undefined && (dados.duracao_min < 1 || dados.duracao_min > 600)) {
          return responder(422, {
            detail: [
              {
                loc: ["body", "duracao_min"],
                msg: "Value error, a duracao precisa estar entre 1 e 600 minutos",
              },
            ],
          })
        }
      }
      if (id === "" && metodo === "POST") {
        const dados = JSON.parse(String(init?.body))
        if (doDono.some((t) => t.nome === dados.nome)) {
          return responder(409, { detail: `Ja existe um treino chamado ${dados.nome} nesse dia` })
        }
        const novo = { id: `t-${treinos.length + 1}`, dono_id: "1", ...dados, dono: email }
        treinos.push(novo)
        return responder(201, publico(novo))
      }
      const treino = doDono.find((t) => t.id === id)
      if (!treino) return responder(404, { detail: "Treino nao encontrado" })
      if (metodo === "DELETE") {
        treinos.splice(treinos.indexOf(treino), 1)
        return responder(204)
      }
      if (metodo === "PATCH") {
        Object.assign(treino, JSON.parse(String(init?.body)))
      }
      return responder(200, publico(treino))
    }

    if (endereco.endsWith("/usuarios/login")) {
      const form = new URLSearchParams(String(init?.body))
      const email = form.get("username") ?? ""
      return contas.get(email)?.senha === form.get("password")
        ? responder(200, { access_token: `token-de-${email}`, token_type: "bearer" })
        : responder(401, { detail: "Credenciais invalidas" })
    }
    if (endereco.endsWith("/usuarios/eu")) {
      const cabecalho = new Headers(init?.headers).get("Authorization") ?? ""
      const email = cabecalho.replace("Bearer token-de-", "")
      const conta = contas.get(email)
      return conta
        ? responder(200, { id: "1", nome: conta.nome, email })
        : responder(401, { detail: "Credenciais invalidas" })
    }
    if (endereco.endsWith("/usuarios/")) {
      const dados = JSON.parse(String(init?.body))
      if (contas.has(dados.email)) {
        return responder(409, { detail: "E-mail ja cadastrado" })
      }
      if (dados.senha.length < 6) {
        return responder(422, {
          detail: [{ loc: ["body", "senha"], msg: "String should have at least 6 characters" }],
        })
      }
      contas.set(dados.email, { nome: dados.nome, senha: dados.senha })
      return responder(201, { id: "2", nome: dados.nome, email: dados.email })
    }
    return responder(404, { detail: "Not Found" })
  })

  const novaSessao = () => {
    const sessao = new SessaoService(new UsuarioRepository(cliente, "http://api"))
    clienteDa.set(sessao, cliente)
    return sessao
  }
  const treinosDe = (sessao: SessaoService) =>
    new TreinosService(new TreinoRepository(cliente, "http://api"), sessao)
  return { pedidos, estado, novaSessao, treinosDe, sessao: novaSessao() }
}

const clienteDa = new WeakMap<SessaoService, typeof fetch>()

function desenhar(tela: React.ReactNode, sessao: SessaoService) {
  const treinos = new TreinosService(new TreinoRepository(clienteDa.get(sessao), "http://api"), sessao)
  return render(
    <Providers sessao={sessao} treinos={treinos}>
      {tela}
    </Providers>,
  )
}

async function sessaoDaAna() {
  const api = apiDeMentira()
  await api.sessao.entrar("ana@ifg.edu.br", "segredo1")
  return api
}

function preencher(rotulo: string, valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } })
}

describe("as telas de entrada", () => {
  it("a tela de login tem e-mail, senha e o botão Entrar", () => {
    desenhar(<LoginScreen />, apiDeMentira().sessao)
    expect(screen.getByLabelText("E-mail")).toBeTruthy()
    expect(screen.getByLabelText("Senha")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy()
  })

  it("Cadastre-se abre o cadastro por cima (push)", () => {
    desenhar(<LoginScreen />, apiDeMentira().sessao)
    fireEvent.click(screen.getByRole("button", { name: "Cadastre-se" }))
    expect(router.push).toHaveBeenCalledWith("/cadastro")
  })

  it("a tela de cadastro tem nome, e-mail e senha", () => {
    desenhar(<RegisterScreen />, apiDeMentira().sessao)
    expect(screen.getAllByRole("textbox")).toHaveLength(2)
    expect(screen.getByLabelText("Senha")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeTruthy()
  })
})

describe("o login de verdade", () => {
  it("campo vazio nem chega à API", async () => {
    const { sessao, pedidos } = apiDeMentira()
    desenhar(<LoginScreen />, sessao)
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect((await screen.findByRole("alert")).textContent).toBe("Preencha o e-mail e a senha")
    expect(pedidos).toHaveLength(0)
  })

  it("senha errada mostra a recusa e não sai do login", async () => {
    const { sessao } = apiDeMentira()
    desenhar(<LoginScreen />, sessao)
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "errada")
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect((await screen.findByRole("alert")).textContent).toBe("E-mail ou senha incorretos")
    expect(router.replace).not.toHaveBeenCalled()
    expect(sessao.logado).toBe(false)
  })

  it("senha certa guarda quem entrou e troca o login pelos treinos (replace)", async () => {
    const { sessao, pedidos } = apiDeMentira()
    desenhar(<LoginScreen />, sessao)
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "segredo1")
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/treinos"))

    expect(sessao.usuario?.nome).toBe("Ana")
    expect(pedidos[0].url).toBe("http://api/usuarios/login")
    expect(new Headers(pedidos[1].init?.headers).get("Authorization")).toBe("Bearer token-de-ana@ifg.edu.br")
  })

  it("cadastro com e-mail repetido mostra a recusa da API", async () => {
    desenhar(<RegisterScreen />, apiDeMentira().sessao)
    preencher("Nome", "Ana")
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "Segredo123")
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }))
    expect((await screen.findByRole("alert")).textContent).toBe("Já existe uma conta com este e-mail")
  })
})

describe("o guarda de rotas", () => {
  it("sem sessão, não mostra a tela e manda para o login", async () => {
    desenhar(
      <RotaProtegida>
        <p>tela secreta</p>
      </RotaProtegida>,
      apiDeMentira().sessao,
    )
    expect(screen.queryByText("tela secreta")).toBeNull()
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"))
  })

  it("com sessão, mostra a tela", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(
      <RotaProtegida>
        <p>tela secreta</p>
      </RotaProtegida>,
      sessao,
    )
    expect(screen.getByText("tela secreta")).toBeTruthy()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it("quem faz watch é avisado: sair tira a tela do ar na hora", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(
      <RotaProtegida>
        <p>tela secreta</p>
      </RotaProtegida>,
      sessao,
    )
    act(() => sessao.sair())
    expect(screen.queryByText("tela secreta")).toBeNull()
    expect(router.replace).toHaveBeenCalledWith("/login")
  })
})

describe("o menu, a lista e o perfil", () => {
  it("o menu mostra o nome e o e-mail de quem entrou", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<AppDrawer aberto onFechar={() => {}} />, sessao)
    expect(screen.getByText("Ana")).toBeTruthy()
    expect(screen.getByText("ana@ifg.edu.br")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Meus treinos" }).getAttribute("aria-current")).toBe("page")
  })

  it("Sair no menu apaga a sessão e vai para o login", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<AppDrawer aberto onFechar={() => {}} />, sessao)
    fireEvent.click(screen.getByRole("button", { name: "Sair" }))
    expect(sessao.logado).toBe(false)
    expect(router.replace).toHaveBeenCalledWith("/login")
  })

  it("Perfil no menu troca de tela pelo nome", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<AppDrawer aberto onFechar={() => {}} />, sessao)
    fireEvent.click(screen.getByRole("button", { name: "Perfil" }))
    expect(router.replace).toHaveBeenCalledWith("/perfil")
  })

  it("a lista cumprimenta quem entrou e abre o menu", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<ListScreen />, sessao)
    expect(screen.getByText("Olá, Ana!")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
    expect(screen.getByRole("navigation", { name: "Menu" })).toBeTruthy()
  })

  it("o perfil mostra o nome e o e-mail", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<PerfilScreen />, sessao)
    expect(screen.getByRole("heading", { name: "Ana" })).toBeTruthy()
    expect(screen.getByText("ana@ifg.edu.br")).toBeTruthy()
  })
})

describe("a listagem, com os dados de verdade", () => {
  it("carregando primeiro, depois um treino por linha, vindos da API", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    const { container } = desenhar(<ListScreen />, sessao)
    expect(container.querySelector(".animate-pulse")).not.toBeNull()

    expect(await screen.findByText("Peito e tríceps")).toBeTruthy()
    expect(screen.getByText("Corrida no parque")).toBeTruthy()
    const doGet = pedidos.find((p) => p.url === "http://api/treinos/")
    expect(new Headers(doGet?.init?.headers).get("Authorization")).toBe("Bearer token-de-ana@ifg.edu.br")
  })

  it("lista vazia não é erro: mostra a mensagem amigável", async () => {
    const api = apiDeMentira({ treinosDaAna: [] })
    await api.sessao.entrar("ana@ifg.edu.br", "segredo1")
    desenhar(<ListScreen />, api.sessao)
    expect(await screen.findByText("Nenhum treino por aqui ainda")).toBeTruthy()
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("erro: mostra o que houve, e o Tentar de novo pede outra vez", async () => {
    const api = await sessaoDaAna()
    api.estado.treinosForaDoAr = true
    desenhar(<ListScreen />, api.sessao)
    expect((await screen.findByRole("alert")).textContent).toBe("Não foi possível falar com o servidor")

    api.estado.treinosForaDoAr = false
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))
    expect(await screen.findByText("Peito e tríceps")).toBeTruthy()
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("tocar num treino abre o detalhe pelo id", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<ListScreen />, sessao)
    fireEvent.click(await screen.findByText("Corrida no parque"))
    expect(router.push).toHaveBeenCalledWith("/treinos/t-corrida")
  })

  it("token vencido no meio do caminho: a sessão acaba", async () => {
    const api = await sessaoDaAna()
    const treinos = api.treinosDe(api.sessao)
    localStorage.clear()
    ;(api.sessao as unknown as { tokenAtual: string }).tokenAtual = "token-vencido"
    await expect(treinos.listar()).rejects.toThrow("Sua sessão expirou. Entre de novo")
    expect(api.sessao.logado).toBe(false)
  })
})

describe("o detalhe, que busca pelo id", () => {
  it("busca o treino na API e mostra os campos", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    params.id = "t-corrida"
    desenhar(<PaginaDoTreino />, sessao)
    expect(screen.getByRole("status", { name: "Carregando" })).toBeTruthy()

    expect(await screen.findByText("Corrida no parque")).toBeTruthy()
    expect(screen.getByText("5 km leves")).toBeTruthy()
    expect(pedidos.some((p) => p.url === "http://api/treinos/t-corrida")).toBe(true)
  })

  it("treino que não existe (ou de outra pessoa): erro, com a seta para voltar", async () => {
    const { sessao } = await sessaoDaAna()
    params.id = "t-de-outra-pessoa"
    desenhar(<PaginaDoTreino />, sessao)
    expect((await screen.findByRole("alert")).textContent).toBe("Treino não encontrado")
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }))
    expect(router.back).toHaveBeenCalled()
  })

  it("excluir pede o DELETE e volta para a lista", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    params.id = "t-peito"
    desenhar(<PaginaDoTreino />, sessao)
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }))
    const dialogo = screen.getByRole("alertdialog")
    fireEvent.click(within(dialogo).getByRole("button", { name: "Excluir" }))
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/treinos"))
    expect(pedidos.some((p) => p.init?.method === "DELETE" && p.url.endsWith("/treinos/t-peito"))).toBe(true)
  })
})

describe("o formulário e o CRUD", () => {
  function preencherTreino(nome: string, duracao: string) {
    preencher("Nome do treino", nome)
    fireEvent.change(screen.getByLabelText("Tipo de treino"), { target: { value: "Yoga" } })
    fireEvent.change(screen.getByLabelText("Data e horário"), { target: { value: "2026-10-21T08:00" } })
    preencher("Duração (minutos)", duracao)
  }

  it("a ponta do app: campo errado mostra a frase, e nada vai para a API", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    const antes = pedidos.length
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    expect(await screen.findByText("Informe o nome do treino.")).toBeTruthy()
    expect(screen.getByText("Informe a duração.")).toBeTruthy()
    expect(pedidos.length).toBe(antes)
  })

  it("criar: o POST leva a hora local, e o app abre o treino novo", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    preencherTreino("Yoga da manhã", "30")
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/treinos/t-3"))

    const post = pedidos.find((p) => p.init?.method === "POST" && p.url.endsWith("/treinos/"))
    expect(JSON.parse(String(post?.init?.body))).toMatchObject({
      nome: "Yoga da manhã",
      tipo_treino: "Yoga",
      data_treino: "2026-10-21T08:00:00",
      duracao_min: 30,
    })
  })

  it("a ponta da API, 409: a frase dela aparece e o formulário fica aberto", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    preencherTreino("Peito e tríceps", "30")
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Ja existe um treino chamado Peito e tríceps nesse dia",
    )
    expect(router.replace).not.toHaveBeenCalled()
    expect(screen.getByDisplayValue("Peito e tríceps")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Criar treino" }).hasAttribute("disabled")).toBe(false)
  })

  it("a ponta da API, 422: a regra que o app não confere volta com a frase da API", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    preencherTreino("Treino longo", "700")
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    expect((await screen.findByRole("alert")).textContent).toBe(
      "duracao_min: a duracao precisa estar entre 1 e 600 minutos",
    )
  })

  it("editar: o mesmo formulário, já preenchido, manda o PATCH e volta ao detalhe", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    params.id = "t-corrida"
    desenhar(<PaginaEditar />, sessao)
    expect(await screen.findByDisplayValue("Corrida no parque")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Editar treino" })).toBeTruthy()

    preencher("Duração (minutos)", "45")
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))
    await vi.waitFor(() => expect(router.back).toHaveBeenCalled())

    const patch = pedidos.find((p) => p.init?.method === "PATCH")
    expect(patch?.url).toBe("http://api/treinos/t-corrida")
    expect(JSON.parse(String(patch?.init?.body)).duracao_min).toBe(45)
  })

  it("excluir pergunta antes: Cancelar e o toque fora não excluem nada", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    params.id = "t-peito"
    desenhar(<PaginaDoTreino />, sessao)

    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }))
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancelar" }))
    expect(screen.queryByRole("alertdialog")).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }))
    const fundo = screen.getByRole("alertdialog").previousElementSibling as HTMLElement
    fireEvent.click(fundo)
    expect(screen.queryByRole("alertdialog")).toBeNull()

    expect(pedidos.some((p) => p.init?.method === "DELETE")).toBe(false)
  })

  it("excluir recusado: a frase aparece embaixo dos botões, e o detalhe fica", async () => {
    const api = await sessaoDaAna()
    params.id = "t-peito"
    desenhar(<PaginaDoTreino />, api.sessao)
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }))

    api.estado.treinosForaDoAr = true
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir" }))
    expect((await screen.findByRole("alert")).textContent).toBe("Não foi possível falar com o servidor")
    expect(screen.getByText("Peito e tríceps")).toBeTruthy()
    expect(router.replace).not.toHaveBeenCalled()
  })
})

describe("a busca, que a API faz", () => {
  const pedidoDaLista = (pedidos: { url: string; init?: RequestInit }[]) =>
    pedidos.find((p) => new URL(p.url).pathname === "/treinos/" && !p.init?.method)

  it("a busca que acha: o ?nome= vai à API, e voltam só os que têm o pedaço", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    url.consulta = "nome=PEITO"
    desenhar(<ListScreen />, sessao)
    expect(await screen.findByText("Peito e tríceps")).toBeTruthy()
    expect(screen.queryByText("Corrida no parque")).toBeNull()
    expect(pedidoDaLista(pedidos)?.url).toBe("http://api/treinos/?nome=PEITO")
  })

  it("a busca que não acha: a frase diz o que foi buscado", async () => {
    const { sessao } = await sessaoDaAna()
    url.consulta = "nome=xyz"
    desenhar(<ListScreen />, sessao)
    expect(await screen.findByText('Nenhum treino com "xyz" no nome.')).toBeTruthy()
    expect(screen.queryByText("Nenhum treino por aqui ainda")).toBeNull()
    expect((screen.getByLabelText("Buscar pelo nome") as HTMLInputElement).value).toBe("xyz")
  })

  it("sem busca, a lista inteira, e o pedido vai sem nada depois da barra", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    desenhar(<ListScreen />, sessao)
    expect(await screen.findByText("Peito e tríceps")).toBeTruthy()
    expect(screen.getByText("Corrida no parque")).toBeTruthy()
    expect(pedidoDaLista(pedidos)?.url).toBe("http://api/treinos/")
  })

  it("o Enter guarda a busca na URL, e o x a limpa", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<ListScreen />, sessao)
    const campo = screen.getByLabelText("Buscar pelo nome")
    fireEvent.change(campo, { target: { value: "  cas  " } })
    fireEvent.submit(campo)
    expect(router.replace).toHaveBeenCalledWith("/treinos?nome=cas")

    fireEvent.click(screen.getByRole("button", { name: "Limpar a busca" }))
    expect(router.replace).toHaveBeenLastCalledWith("/treinos")
  })

  it("o filtro de tipo também vai à API, junto com a busca", async () => {
    const { sessao, pedidos } = await sessaoDaAna()
    url.consulta = "nome=parque&tipo=Corrida"
    desenhar(<ListScreen />, sessao)
    expect(await screen.findByText("Corrida no parque")).toBeTruthy()
    expect(pedidoDaLista(pedidos)?.url).toBe("http://api/treinos/?nome=parque&tipo_treino=Corrida")

    fireEvent.click(screen.getByRole("button", { name: "Todos os tipos" }))
    expect(router.replace).toHaveBeenCalledWith("/treinos?nome=parque")
  })
})

describe("os avisos de cada ação", () => {
  const aviso = () => screen.getAllByRole("status").find((e) => e.hasAttribute("data-tom"))

  function preencherTreino(nome: string) {
    preencher("Nome do treino", nome)
    fireEvent.change(screen.getByLabelText("Tipo de treino"), { target: { value: "Yoga" } })
    fireEvent.change(screen.getByLabelText("Data e horário"), { target: { value: "2026-10-21T08:00" } })
    preencher("Duração (minutos)", "30")
  }

  it("salvou: a faixa verde, Treino salvo", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    preencherTreino("Yoga da manhã")
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Treino salvo"))
    expect(aviso()?.getAttribute("data-tom")).toBe("sucesso")
  })

  it("a API recusou: a faixa vermelha, e a frase dela no formulário", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<PaginaNovo />, sessao)
    preencherTreino("Peito e tríceps")
    fireEvent.click(screen.getByRole("button", { name: "Criar treino" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Não deu para salvar"))
    expect(aviso()?.getAttribute("data-tom")).toBe("erro")
    expect(screen.getByRole("alert").textContent).toBe("Ja existe um treino chamado Peito e tríceps nesse dia")
  })

  it("excluiu: a faixa verde, Treino excluído", async () => {
    const { sessao } = await sessaoDaAna()
    params.id = "t-peito"
    desenhar(<PaginaDoTreino />, sessao)
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }))
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Treino excluído"))
    expect(aviso()?.getAttribute("data-tom")).toBe("sucesso")
  })

  it("não deu para excluir: a faixa vermelha, e a frase embaixo dos botões", async () => {
    const api = await sessaoDaAna()
    params.id = "t-peito"
    desenhar(<PaginaDoTreino />, api.sessao)
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }))
    api.estado.treinosForaDoAr = true
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Não deu para excluir"))
    expect(aviso()?.getAttribute("data-tom")).toBe("erro")
    expect(screen.getByRole("alert").textContent).toBe("Não foi possível falar com o servidor")
  })
})

describe("os avisos de entrar, cadastrar e sair", () => {
  const aviso = () => screen.getAllByRole("status").find((e) => e.hasAttribute("data-tom"))

  it("entrar com a senha certa: a faixa verde com o nome", async () => {
    desenhar(<LoginScreen />, apiDeMentira().sessao)
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "segredo1")
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Bem-vindo, Ana!"))
    expect(aviso()?.getAttribute("data-tom")).toBe("sucesso")
  })

  it("entrar com a senha errada: a faixa vermelha", async () => {
    desenhar(<LoginScreen />, apiDeMentira().sessao)
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "errada")
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Não deu para entrar"))
    expect(aviso()?.getAttribute("data-tom")).toBe("erro")
  })

  it("cadastro recusado: a faixa vermelha", async () => {
    desenhar(<RegisterScreen />, apiDeMentira().sessao)
    preencher("Nome", "Ana")
    preencher("E-mail", "ana@ifg.edu.br")
    preencher("Senha", "Segredo123")
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }))
    await vi.waitFor(() => expect(aviso()?.textContent).toBe("Não deu para criar a conta"))
    expect(aviso()?.getAttribute("data-tom")).toBe("erro")
  })

  it("sair pelo menu: a faixa verde", async () => {
    const { sessao } = await sessaoDaAna()
    desenhar(<AppDrawer aberto onFechar={() => {}} />, sessao)
    fireEvent.click(screen.getByRole("button", { name: "Sair" }))
    expect(aviso()?.textContent).toBe("Você saiu da conta")
    expect(aviso()?.getAttribute("data-tom")).toBe("sucesso")
  })
})

describe("o service dos treinos", () => {
  it("criar manda o treino e devolve o que a API criou", async () => {
    const api = await sessaoDaAna()
    const treinos = api.treinosDe(api.sessao)
    const novo = await treinos.criar({
      nome: "Yoga",
      tipo_treino: "Yoga",
      data_treino: "2026-10-21T08:00:00",
      duracao_min: 30,
      observacoes: null,
    })
    expect(novo.id).toBeTruthy()
    expect((await treinos.listar()).map((t) => t.nome)).toContain("Yoga")
  })

  it("a recusa da regra de negócio (409) chega com a frase da API", async () => {
    const api = await sessaoDaAna()
    const treinos = api.treinosDe(api.sessao)
    await expect(
      treinos.criar({
        nome: "Peito e tríceps",
        tipo_treino: "Musculação",
        data_treino: "2026-10-20T19:00:00",
        duracao_min: 30,
        observacoes: null,
      }),
    ).rejects.toThrow("Ja existe um treino chamado Peito e tríceps nesse dia")
  })
})

describe("o cadastro pelo app", () => {
  it("cadastrar cria a conta e já entra com ela, pelo mesmo caminho do login", async () => {
    const { sessao } = apiDeMentira()
    await sessao.cadastrar("Bia", "bia@ifg.edu.br", "segredo456")
    expect(sessao.logado).toBe(true)
    expect(sessao.usuario?.nome).toBe("Bia")
  })

  it("campos vazios nem chegam à API", async () => {
    const { sessao, pedidos } = apiDeMentira()
    await expect(sessao.cadastrar("", "", "")).rejects.toThrow("Preencha o nome, o e-mail e a senha")
    expect(pedidos).toHaveLength(0)
  })

  it("o service traduz a recusa: e-mail repetido (409) e campo inválido (422)", async () => {
    const { sessao } = apiDeMentira()
    await expect(sessao.cadastrar("Ana", "ana@ifg.edu.br", "segredo1")).rejects.toThrow(
      "Já existe uma conta com este e-mail",
    )
    await expect(sessao.cadastrar("Bia", "bia@ifg.edu.br", "123")).rejects.toThrow(
      "senha: String should have at least 6 characters",
    )
    expect(sessao.logado).toBe(false)
  })

  it("com a API fora do ar, a frase diz isso", async () => {
    const { sessao, estado } = apiDeMentira()
    estado.foraDoAr = true
    await expect(sessao.cadastrar("Bia", "bia@ifg.edu.br", "segredo456")).rejects.toThrow(
      "Não foi possível falar com o servidor",
    )
  })
})

describe("a sessão guardada no aparelho", () => {
  it("entrar guarda uma cópia do token no aparelho", async () => {
    const { sessao } = apiDeMentira()
    await sessao.entrar("ana@ifg.edu.br", "segredo1")
    expect(localStorage.getItem(CHAVE_DO_TOKEN)).toBe("token-de-ana@ifg.edu.br")
  })

  it("F5 com o token valendo: a sessão volta sem pedir a senha", async () => {
    const api = apiDeMentira()
    await api.sessao.entrar("ana@ifg.edu.br", "segredo1")

    const depoisDoF5 = api.novaSessao()
    expect(depoisDoF5.logado).toBe(false)
    await depoisDoF5.restaurar()
    expect(depoisDoF5.logado).toBe(true)
    expect(depoisDoF5.usuario?.nome).toBe("Ana")
  })

  it("token que a API recusa (401) é apagado do aparelho", async () => {
    const api = apiDeMentira()
    localStorage.setItem(CHAVE_DO_TOKEN, "token-vencido")
    const sessao = api.novaSessao()
    await sessao.restaurar()
    expect(sessao.logado).toBe(false)
    expect(localStorage.getItem(CHAVE_DO_TOKEN)).toBeNull()
  })

  it("API fora do ar: volta ao login, mas o token continua guardado", async () => {
    const api = apiDeMentira()
    await api.sessao.entrar("ana@ifg.edu.br", "segredo1")
    api.estado.foraDoAr = true

    const depoisDoF5 = api.novaSessao()
    await depoisDoF5.restaurar()
    expect(depoisDoF5.logado).toBe(false)
    expect(localStorage.getItem(CHAVE_DO_TOKEN)).toBe("token-de-ana@ifg.edu.br")

    api.estado.foraDoAr = false
    const maisTarde = api.novaSessao()
    await maisTarde.restaurar()
    expect(maisTarde.logado).toBe(true)
  })

  it("sair apaga da memória e do aparelho: nem o F5 traz a sessão de volta", async () => {
    const api = apiDeMentira()
    await api.sessao.entrar("ana@ifg.edu.br", "segredo1")
    api.sessao.sair()
    expect(localStorage.getItem(CHAVE_DO_TOKEN)).toBeNull()

    const depoisDoF5 = api.novaSessao()
    await depoisDoF5.restaurar()
    expect(depoisDoF5.logado).toBe(false)
  })

  it("o guarda espera a conferência: F5 numa tela protegida não cai no login", async () => {
    const api = apiDeMentira()
    await api.sessao.entrar("ana@ifg.edu.br", "segredo1")

    desenhar(
      <RotaProtegida>
        <p>tela secreta</p>
      </RotaProtegida>,
      api.novaSessao(),
    )
    expect(screen.getByRole("status", { name: "Carregando" })).toBeTruthy()
    expect(await screen.findByText("tela secreta")).toBeTruthy()
    expect(router.replace).not.toHaveBeenCalled()
  })
})
