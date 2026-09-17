from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .database import Base, engine
from .treino import controller as treino_controller
from .treino.erros import ErroDeTreino, TreinoNaoEncontradoError

    
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API do Meu Projeto", version="0.3.0")
app.include_router(treino_controller.router)


@app.exception_handler(ErroDeTreino)
def traduzir_recusa(request: Request, erro: ErroDeTreino):
    """O unico lugar do sistema que transforma recusa em numero HTTP."""
    codigo = 404 if isinstance(erro, TreinoNaoEncontradoError) else 409
    return JSONResponse(status_code=codigo, content={"detail": str(erro)})
