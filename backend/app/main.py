import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .treinos import controller as treinos_controller
from .treinos.erros import ErroDeTreino, TreinoNaoEncontrado
from .usuarios import controller as usuarios_controller
from .usuarios.erros import EmailJaCadastrado, ErroDeUsuario

ORIGENS_PUBLICADAS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

app = FastAPI(title="GymLog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENS_PUBLICADAS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(treinos_controller.router)
app.include_router(usuarios_controller.router)


@app.exception_handler(ErroDeTreino)
def traduzir_recusa(request: Request, erro: ErroDeTreino):
    codigo = 404 if isinstance(erro, TreinoNaoEncontrado) else 409
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
