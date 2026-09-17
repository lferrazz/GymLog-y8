from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .treino import controller as treino_controller
from .treino.erros import ErroDeTreino, TreinoNaoEncontradoError
from .usuarios import controller as usuarios_controller
from .usuarios.erros import EmailJaCadastrado, ErroDeUsuario

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

    return JSONResponse(
        status_code=401,
        content={"detail": str(erro)},
        headers={"WWW-Authenticate": "Bearer"},
    )
