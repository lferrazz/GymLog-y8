from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from . import service
from .schemas import TreinoAtualizar, TreinoCriar, TreinoPublico

router = APIRouter(prefix="/treinos", tags=["treinos"])


@router.post("/", response_model=TreinoPublico, status_code=status.HTTP_201_CREATED)
def criar_treino(dados: TreinoCriar, db: Session = Depends(get_db)):
    return service.criar_treino(db, dados)


@router.get("/", response_model=list[TreinoPublico])
def listar_treinos(db: Session = Depends(get_db)):
    return service.listar_treinos(db)


@router.get("/{treino_id}", response_model=TreinoPublico)
def buscar_treino(treino_id: str, db: Session = Depends(get_db)):
    return service.buscar_treino(db, treino_id)


@router.patch("/{treino_id}", response_model=TreinoPublico)
def atualizar_treino(
    treino_id: str, dados: TreinoAtualizar, db: Session = Depends(get_db)
):
    return service.atualizar_treino(db, treino_id, dados)


@router.delete("/{treino_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_treino(treino_id: str, db: Session = Depends(get_db)) -> Response:
    service.excluir_treino(db, treino_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)