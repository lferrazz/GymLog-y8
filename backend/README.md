# GymLog — API

API de registro de treinos, feita em FastAPI para a disciplina Programação para
Web III (IFG). Cada pessoa cria uma conta, faz login e passa a ter o seu próprio
acervo de treinos: ninguém enxerga nem altera o treino de outra.

## O que tem dentro

- **FastAPI** com a divisão `controller → service → repository → models`.
- **Autenticação JWT**: cadastro, login e um "porteiro" (`get_current_user`) que
  tranca todas as rotas de `/treinos`.
- **Senhas com bcrypt**: o banco guarda só o hash, nunca a senha.
- **Alembic**: o banco tem histórico versionado; não existe `create_all`.
- **Dono por registro**: todo treino nasce amarrado a quem o criou.
- **Busca e filtro** na listagem, por nome e por tipo de treino.

## Rodando do zero

```bash
cd backend

# 1. dependências
poetry install

# 2. configuração: copie o exemplo e preencha
cp .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"   # cole em SECRET_KEY

# 3. o banco: as migrações criam todas as tabelas
poetry run alembic upgrade head

# 4. o servidor
poetry run uvicorn app.main:app --reload
```

Abra <http://127.0.0.1:8000/docs>.

O `.env` não vai para o git (está no `.gitignore`), por isso o `.env.example`
existe: ele lista quais variáveis são necessárias, sem expor os valores.

Sem `SECRET_KEY` preenchido a aplicação não sobe — é proposital, para não
existir a chance de rodar assinando tokens com uma chave padrão conhecida.

## Trocando o banco

O `DATABASE_URL` do `.env` é a única coisa que muda. Nenhum arquivo de `app/`
é tocado:

```bash
# SQLite (padrão, bom para desenvolver)
DATABASE_URL=sqlite:///./gymlog.db

# PostgreSQL
DATABASE_URL=postgresql+psycopg2://usuario:senha@localhost:5432/gymlog
```

Depois de trocar, `alembic upgrade head` reconstrói o schema inteiro no banco
novo, na ordem em que as migrações foram escritas.

## Migrações

```bash
poetry run alembic current                              # onde o banco está
poetry run alembic history                              # o histórico todo
poetry run alembic revision --autogenerate -m "motivo"  # nova migração
poetry run alembic upgrade head                         # aplica
poetry run alembic downgrade -1                         # desfaz a última
```

O `--autogenerate` compara os models com o banco e escreve o diff. **Sempre
leia o arquivo gerado antes de aplicar**: ele acerta na maioria das vezes, mas
não em todas.

## O que dá para provar no /docs

1. **Cadastro** — `POST /usuarios/` devolve **201** e a resposta não traz
   `senha` nem `senha_hash`.
2. **E-mail repetido** — o mesmo e-mail de novo devolve **409**.
3. **Login errado** — senha errada devolve **401** com a mensagem genérica
   `"Credenciais invalidas"`; e-mail inexistente devolve exatamente a mesma
   coisa, para não revelar quais e-mails existem.
4. **Login certo** — **200** com `access_token`. Use o botão **Authorize**
   (o campo `username` recebe o e-mail).
5. **Porta trancada** — `GET /treinos/` sem token devolve **401**; com token,
   **200**.
6. **O dono aparece sozinho** — `POST /treinos/` devolve `dono_id` preenchido,
   sem que ele tenha sido enviado no corpo.
7. **Cada um no seu acervo** — logado como outro usuário, `GET /treinos/` vem
   vazio e `GET /treinos/{id de outro}` devolve **404** (não 403: um 403 já
   confirmaria que aquele id existe).
8. **Busca e filtro** — `?nome=...`, `?tipo_treino=...` e os dois juntos.
9. **422 em português** — nome com menos de 3 caracteres ou duração fora do
   intervalo de 1 a 600 minutos.
10. **Histórico do banco** — `alembic current` aponta para a migração
    `dono_id em treinos`.

## Estrutura

```
backend/
├── alembic/
│   ├── env.py              # lê DATABASE_URL do .env, modo batch ligado
│   └── versions/           # o histórico do banco
├── app/
│   ├── database.py         # engine, Session, Base
│   ├── seguranca.py        # hash, JWT e o porteiro
│   ├── main.py             # routers e tradução de erro em código HTTP
│   ├── treino/
│   └── usuarios/
├── .env.example
├── alembic.ini
└── pyproject.toml
```
