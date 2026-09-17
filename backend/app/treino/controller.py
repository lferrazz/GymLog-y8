from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..seguranca import get_current_user
from ..usuarios.models import Usuario
from . import service
from .schemas import TreinoAtualizar, TreinoCriar, TreinoPublico

# dependencies no APIRouter protege TODAS as rotas de uma vez: nenhuma
# funcao abaixo muda e nenhuma pode ser esquecida.
router = APIRouter(
    prefix="/treinos", tags=["treinos"], dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=TreinoPublico, status_code=status.HTTP_201_CREATED)
def criar_treino(
    dados: TreinoCriar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.criar_treino(db, dados, usuario)


@router.get("/", response_model=list[TreinoPublico])
def listar_treinos(
    nome: str | None = None,
    tipo_treino: str | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    # Parametros sem valor no path viram query params (?nome=...&tipo_treino=...)
    # e, por terem default None, seguem opcionais.
    return service.listar_treinos(db, usuario, nome=nome, tipo_treino=tipo_treino)


@router.get("/{treino_id}", response_model=TreinoPublico)
def buscar_treino(
    treino_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.buscar_treino(db, treino_id, usuario)


@router.patch("/{treino_id}", response_model=TreinoPublico)
def atualizar_treino(
    treino_id: str,
    dados: TreinoAtualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.atualizar_treino(db, treino_id, dados, usuario)


@router.delete("/{treino_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_treino(
    treino_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> Response:
    service.excluir_treino(db, treino_id, usuario)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
