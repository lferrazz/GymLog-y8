# GymLog

Diário de treinos: cada pessoa cria uma conta, entra e registra os próprios
treinos, com busca, filtro e as regras da academia conferidas pela API.

Projeto da disciplina Programação para Web III (IFG Câmpus Jataí).

| Parte | Tecnologia | Pasta |
|---|---|---|
| API | FastAPI, SQLAlchemy, Alembic, JWT | [`backend/`](backend/) |
| App | Next.js (React), TypeScript, Tailwind | [`frontend/`](frontend/) |
| Banco | PostgreSQL (SQLite também serve para desenvolver) | — |

## No ar

| O quê | Endereço |
|---|---|
| App | _preencher depois do deploy_ |
| API (Swagger) | _preencher depois do deploy_ `/docs` |

## As seis funcionalidades

| Funcionalidade | No app | Na API | Como provar |
|---|---|---|---|
| **Autenticação** | Cadastro e login; sem sessão, só as telas de entrada | Senha com bcrypt; token JWT no cabeçalho de todo pedido | Sair, tentar abrir `/treinos` (volta ao login) e entrar de novo |
| **CRUD** | O **+ Novo treino** cria; o detalhe edita e exclui (com confirmação) | `POST`, `GET`, `PATCH` e `DELETE` em `/treinos/` | Criar, abrir, editar e excluir um treino |
| **Relacionamento com o usuário** | Cada um vê só os próprios treinos | O `dono_id` vem do token; treino de outra pessoa responde 404 | Entrar com outra conta: a lista é outra |
| **Validação nas duas pontas** | O formulário barra campo vazio, com a frase embaixo do campo | 422 (forma) e 409 (regras de negócio), com a frase em português | Salvar com o nome vazio; depois um nome de 2 letras, ou dois treinos com o mesmo nome no mesmo dia |
| **Busca e filtro** | O campo de busca e os chips de tipo na lista | `GET /treinos/?nome=...&tipo_treino=...`, filtrado no banco | Uma busca que acha e uma que não acha |
| **Feedback visual** | Faixa verde (deu certo) ou vermelha (não deu) em toda ação | — | Entrar, salvar, uma recusa, excluir e sair |

As regras de negócio (RN01 a RN05) estão em
[`backend/docs/regras-de-negocio.md`](backend/docs/regras-de-negocio.md).

## Rodando na sua máquina

Pré-requisitos: **Python 3.14** com **Poetry 2**, **Node 24** com **pnpm**, e
**Docker** (só para o PostgreSQL; sem ele, use SQLite).

### 1. O banco

```bash
docker run -d --name gymlog-postgres --restart unless-stopped \
  -e POSTGRES_USER=gymlog -e POSTGRES_PASSWORD=troque-esta-senha \
  -e POSTGRES_DB=gymlog -p 5432:5432 \
  -v gymlog-pgdata:/var/lib/postgresql/data postgres:17
```

### 2. A API

```bash
cd backend
cp .env.example .env
```

No `.env`:

- `DATABASE_URL=postgresql+psycopg2://gymlog:troque-esta-senha@localhost:5432/gymlog`
  (ou `sqlite:///./gymlog.db`, sem Docker);
- `SECRET_KEY=` a saída de `python -c "import secrets; print(secrets.token_hex(32))"`.

```bash
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

A API fica em <http://127.0.0.1:8000/docs>.

### 3. O app

Noutro terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

O app fica em <http://localhost:3000>. Ele procura a API em
`http://127.0.0.1:8000`; se ela estiver noutro endereço, copie o
`frontend/.env.example` para `frontend/.env.local` e ajuste o
`NEXT_PUBLIC_API_URL`.

### 4. Os testes

```bash
cd backend && poetry run pytest     # os endpoints da API (banco SQLite descartável)
cd frontend && pnpm test            # as telas do app (com uma API de mentira)
```

## As camadas

- **API:** toda rota passa por `controller.py` → `service.py` → `repository.py`.
  Só o repository fala com o banco; as regras de negócio moram no service.
- **App:** `components/screens/` (as telas) → `lib/services/` (as regras e a
  sessão) → `lib/repositories/` (o único que faz HTTP) → `lib/models/`.
  Nenhuma tela faz `fetch`.

## Publicando na nuvem

Nenhum segredo vai para o Git: o `.env` está no `.gitignore`, e na nuvem os
valores entram como variáveis de ambiente.

### A API e o banco (Render)

1. **New → PostgreSQL** (plano free). Copie a **Internal Database URL**.
2. **New → Web Service**, ligado a este repositório:
   - Root Directory: `backend`
   - Runtime: **Docker** (o [`backend/Dockerfile`](backend/Dockerfile) roda as
     migrações e sobe a API na porta que o Render informar)
   - Variáveis de ambiente:
     - `DATABASE_URL` = a Internal Database URL do passo 1
     - `SECRET_KEY` = uma chave nova (`python -c "import secrets; print(secrets.token_hex(32))"`)
     - `CORS_ORIGINS` = o endereço do app publicado (ex.: `https://gymlog.vercel.app`)
3. Abra `https://<sua-api>.onrender.com/docs` para conferir.

### O app (Vercel)

1. **Add New → Project**, importando este repositório.
2. Root Directory: `frontend`.
3. Variável de ambiente: `NEXT_PUBLIC_API_URL` = o endereço da API do Render.
4. Depois do deploy, confira se o endereço do app está no `CORS_ORIGINS` da API.

Por fim, preencha a tabela **No ar**, lá em cima, com os dois endereços.
