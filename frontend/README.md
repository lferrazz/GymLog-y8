# GymLog-y8

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_pMhTrI6vLuo6tYh6sPRsbDsttJI2)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Rodando com a API

O login e o cadastro falam com a API de verdade (`backend/`). Suba a API antes
(veja o README do backend) e depois o app:

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # a prova: as telas e o login, com uma API de mentira
```

O app procura a API em `http://127.0.0.1:8000`. Se ela estiver noutra porta,
crie um `.env.local` aqui no `frontend/` (ele não vai para o Git):

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

### As camadas do app

As mesmas da API, e cada uma só conversa com a de baixo:

| Pasta | Camada | O que faz |
|---|---|---|
| `app/` | rotas | uma pasta por tela: `/login`, `/cadastro`, `/treinos`, `/perfil`... |
| `components/screens/` | apresentação | as telas: recebem o clique e mostram a resposta |
| `components/widgets/` | apresentação | pedaços que várias telas usam: o menu e o guarda de rotas |
| `lib/services/` | regras e estado | a sessão (guarda quem entrou e **avisa** quando muda) e os treinos (pegam o token na sessão e traduzem a recusa da API numa frase) |
| `lib/repositories/` | dados | o único lugar que faz HTTP e lê JSON |
| `lib/models/` | formato | o `Usuario`, igual ao `UsuarioPublico` da API |

- **Os nomes das telas** moram em `lib/routes.ts`: quem navega escreve
  `AppRoutes.perfil`, e não `"/perfil"` solto.
- **O guarda** (`components/widgets/rota-protegida.tsx`) manda para o login quem
  abre uma tela protegida sem ter entrado (inclusive depois de um F5).
- **O estado num lugar só**: `components/providers.tsx` põe os services no alto
  da árvore (no `app/layout.tsx`), e cada tela pega o que precisa:
  - `useSessao()` para **mostrar**: a tela se redesenha quando a sessão avisa
    (o `watch` do Provider);
  - `useSessaoAcoes()` e `useTreinos()` para **fazer** algo (o `read`).
- **Os treinos vêm da API.** Quem lembra o que mostrar é a própria tela, com o
  `usePedido` (o `FutureBuilder` do Flutter), num dos quatro estados, sempre
  nesta ordem: carregando, erro (com "Tentar de novo"), vazia e a lista. O
  detalhe e a edição **buscam o treino pelo id da URL**: mostram o treino como
  ele está agora no banco, e sobrevivem ao F5.
- **A busca é da API.** O campo da lista e os chips de tipo mandam `?nome=` e
  `?tipo_treino=` ao `GET /treinos/`, e quem filtra é o banco. A busca mora na
  URL (`/treinos?nome=cas&tipo=Corrida`): ao abrir um treino e voltar, ela
  continua lá. O período (7 ou 30 dias) a API não filtra: ele recorta, no app,
  a lista que ela devolveu.
- **Toda ação avisa.** Uma faixa embaixo da tela, que some sozinha: verde
  quando deu certo ("Treino salvo", "Treino excluído"), vermelha quando não deu
  ("Não deu para salvar", "Não deu para excluir"), com a frase da API na tela.

Nenhuma tela faz `fetch`, nenhuma recebe a sessão por props, e o token nunca
sai do `SessaoService`.

### A sessão guardada

Ao entrar, o token vai para a memória e uma cópia vai para o `localStorage`
(chave `gymlog.token`), pelo `TokenRepository`. Ao abrir o app (ou depois de um
F5), o `SessaoService.restaurar()` pergunta à API, no `/usuarios/eu`, se a cópia
ainda vale:

| A API responde | O app faz |
|---|---|
| 200 | entra direto, sem pedir a senha |
| 401 (token vencido, 60 min) | apaga a cópia e vai para o login |
| nada (API fora do ar) | vai para o login, mas **mantém** a cópia: quando a API voltar, a sessão volta |

O **Sair** apaga a memória e a cópia: depois dele, nem o F5 traz a sessão de
volta. A API não fica sabendo do Sair: um token copiado antes continua valendo
até vencer.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
