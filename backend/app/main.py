from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .treino import controller as treino_controller
from .treino.erros import ErroDeTreino, TreinoNaoEncontradoError
from .usuarios import controller as usuarios_controller
from .usuarios.erros import EmailJaCadastrado, ErroDeUsuario

# Nao existe mais create_all aqui: quem cria e altera tabela agora e o
# Alembic. Deixar os dois jeitos convivendo faria o banco nascer pelo
# create_all e as migracoes nunca rodarem, escondendo erro ate a producao.

app = FastAPI(title="API do Meu Projeto", version="0.5.0")
app.include_router(treino_controller.router)
app.include_router(usuarios_controller.router)


@app.exception_handler(ErroDeTreino)
def traduzir_recusa(request: Request, erro: ErroDeTreino):
    """O unico lugar do sistema que transforma recusa em numero HTTP."""
    codigo = 404 if isinstance(erro, TreinoNaoEncontradoError) else 409
    return JSONResponse(status_code=codigo, content={"detail": str(erro)})


@app.exception_handler(ErroDeUsuario)
def traduzir_recusa_de_usuario(request: Request, erro: ErroDeUsuario):
    if isinstance(erro, EmailJaCadastrado):
        return JSONResponse(status_code=409, content={"detail": str(erro)})

    # WWW-Authenticate e exigido pela especificacao do HTTP no 401 e e o que
    # faz o /docs abrir o Authorize.
    return JSONResponse(
        status_code=401,
        content={"detail": str(erro)},
        headers={"WWW-Authenticate": "Bearer"},
    )
